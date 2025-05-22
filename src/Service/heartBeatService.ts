import {deviceStatus} from "../Entities/Models/DeviceStatus.js";
import {IDevice} from "../Entities/Models/IDevice.js";
import {IDeviceRepository} from "../Repository/IDeviceRepository.js";
import {HEARTBEAT} from "../config/config.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {EDeviceModes} from "../Entities/Enums/EDeviceModes.js";
import {INotification} from "../Entities/Models/INotification.js";
import {EnumAppNotificationType} from "../Entities/Enums/EnumAppNotificationType.js";
import INotificationRepository from "../Repository/INotificationRepository.js";
import {DEBUG} from "../config/config.js";

export default class HeartBeatMonitor {
    private static _instance : HeartBeatMonitor | null = null;
    private _deviceRepository: IDeviceRepository;
    private intervalId?: NodeJS.Timeout;
    private _notificationRepository: INotificationRepository;

    ///Debugging helper
    private debug = (msg: string) => DEBUG && Logger.info(`[HEARTBEAT DEBUG] ${msg}`);

    getInterval(): number {
        return HEARTBEAT.CHECK_INTERVAL_MS;
    }

    private constructor(deviceRepository: IDeviceRepository, notificationRepository: INotificationRepository) {
        this._deviceRepository = deviceRepository;
        this._notificationRepository = notificationRepository;
    }

    public static getInstance(deviceRepo: IDeviceRepository, notifRepo: INotificationRepository): HeartBeatMonitor {
        if (!this._instance) {
            this._instance = new HeartBeatMonitor(deviceRepo, notifRepo);
            this._instance.start();
        }
        return this._instance;
    }


    public start() {
        if (this.intervalId) return;
        this.intervalId = setInterval(async () => {

            Logger.info("[HEARTBEAT] HeartBeat Monitor: Checking device health...");

            //Generate a new map for the current check if size is less than 1
            if (deviceStatus.size === 0) {
                try {
                    const devices: IDevice[] = await this._deviceRepository.readAllDevices();

                    devices.forEach((device) => {
                        deviceStatus.set(device.Mac, {
                            LastHeartbeat: device.LastHeartbeat,
                            Mode: device.Mode,
                            PIUniqueIdentifier: device.PIUniqueIdentifier,
                            PIDisplayName: device.PIDisplayName,
                        });
                    });
                    this.debug("Loaded " + devices.length + " devices into heartbeat map.");

                } catch (err) {
                    Logger.error("[HEARTBEAT] Failed to load devices for heartbeat check:", err);
                }
            }

            ///If we have devices in the map, we can check their status
            if(deviceStatus.size > 0) {
                deviceStatus.forEach((status, mac) => {
                    //Getting the current time and the last heartbeat time
                    const currentTime = new Date();
                    const lastHeartbeat = new Date(status.LastHeartbeat);

                    //Check if we accidentally coded a time machine and log it.
                    if (lastHeartbeat > currentTime) {
                        Logger.warn(`[HEARTBEAT] Last heartbeat (${lastHeartbeat}) is in the future relative to current time (${currentTime}).`);
                    }

                    //Calculate the difference in milliseconds
                    const timeDiff = currentTime.getTime() - lastHeartbeat.getTime();
                    //Convert the difference to minutes
                    const diffMinutes = Math.floor((timeDiff / 1000) / 60);

                    //Debugging
                    this.debug("Current time: " + currentTime);
                    this.debug("Last heartbeat time: " + lastHeartbeat);
                    this.debug("Time diff in sec: " + timeDiff);
                    this.debug("Time diff in min: " + diffMinutes)
                    this.debug("The Math will look like: " + diffMinutes + " > "+ HEARTBEAT.OFFLINE_TREASHOLD_MINUTES);

                    //If the difference is greater than the threshold, we set the device to offline
                    if (diffMinutes > HEARTBEAT.OFFLINE_TREASHOLD_MINUTES) {
                        this.debug("Device " + mac + " is offline. Last heartbeat was, " + diffMinutes + " minutes ago.");
                        //If the device is online, we set it to offline
                        if (status.Mode === EDeviceModes.Online) {
                            this.debug("Device " + mac + " was ONLINE but is OFFLINE now. Setting to OFFLINE.");
                            status.Mode = EDeviceModes.Offline;

                            //Set the device to offline in the database
                            this._deviceRepository.putDevice({ Mac: mac, Mode: status.Mode } as IDevice);

                            //Remember to update the map with the new status
                            deviceStatus.set(mac,{
                                    LastHeartbeat: status.LastHeartbeat,
                                    Mode: status.Mode,
                                    PIUniqueIdentifier: status.PIUniqueIdentifier,
                                    PIDisplayName: status.PIDisplayName
                            });
                            //Send a notification to the user
                            const notifiction: INotification = {
                                UniqueIdentifier: this.generateDeviceID(mac),
                                Type: EnumAppNotificationType.offline,
                                Title: `Device ${status.PIDisplayName} is offline. Last seen online: ${lastHeartbeat}.`,
                                PiUniqeIdentifier: status.PIUniqueIdentifier,
                                DateCreated: status.LastHeartbeat,
                                IsRead: false
                            }
                            //Throw that notification into the database.
                            this._notificationRepository.postNotification(notifiction);
                        }
                    } else {
                        //We are only changing it to online if it's seen as offline, otherwise we'll leave it as is.
                        if (status.Mode === EDeviceModes.Offline) {
                            status.Mode = EDeviceModes.Online;
                            this._deviceRepository.putDevice({ Mac: mac, Mode: status.Mode } as IDevice);

                            const notifiction: INotification = {
                                UniqueIdentifier: this.generateDeviceID(mac),
                                Type: EnumAppNotificationType.info,
                                Title: `Device ${status.PIDisplayName} is online again. Last seen online: ${lastHeartbeat}.`,
                                PiUniqeIdentifier: status.PIUniqueIdentifier,
                                DateCreated: status.LastHeartbeat,
                                IsRead: false
                            }

                            this._notificationRepository.postNotification(notifiction);


                            this.debug("Device " + mac + " is ONLINE. Last heartbeat was " + diffMinutes + " minutes ago.");

                        }
                    }
                });
            }
        }, this.getInterval());
    }

    //Maybe we want to stop the heartbeat monitor at some point?
    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            Logger.warn("[HEARTBEAT] Heartbeat monitor stopped.");
        }
    }

    //We need a random ID for the notification, so we use the MAC address and a timestamp to generate a unique ID.
    generateDeviceID(mac: string): string {
        const timestamp = Date.now().toString(36); // base36 = shorter
        const cleanMac = mac.replace(/[:\-]/g, '').toLowerCase(); // remove colons or dashes

        //More randomness In the off chance we generate two ids within the same millisecond.
        const randomPart = Math.random().toString(36).substring(2, 8); // 6-char random string

        return `${timestamp}-${cleanMac}-${randomPart}`;
    }
}
