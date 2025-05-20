import {deviceStatus} from "../Entities/Models/DeviceStatus.js";
import {IDevice} from "../Entities/Models/IDevice.js";
import {IDeviceRepository} from "../Repository/IDeviceRepository.js";
import {HEARTBEAT} from "../config/config.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {EDeviceModes} from "../Entities/Enums/EDeviceModes.js";
import {INotification} from "../Entities/Models/INotification.js";
import {EnumAppNotificationType} from "../Entities/Enums/EnumAppNotificationType.js";
import INotificationRepository from "../Repository/INotificationRepository.js";

export default class HeartBeatMonitor {
    private static _instance : HeartBeatMonitor | null = null;
    private _deviceRepository: IDeviceRepository;
    private intervalId?: NodeJS.Timeout;
    private _notificationRepository: INotificationRepository;


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
            Logger.info("HeartBeat Monitor: Checking device health...");

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

                    Logger.info(`Loaded ${devices.length} devices into heartbeat map.`);
                } catch (err) {
                    Logger.error("Failed to load devices for heartbeat check:", err);
                }
            } else {
                deviceStatus.forEach((status, mac) => {
                    const currentTime = new Date();
                    const lastHeartbeat = new Date(status.LastHeartbeat);
                    const timeDiff = Math.abs(currentTime.getTime() - lastHeartbeat.getTime());
                    const diffMinutes = Math.floor((timeDiff / 1000) / 60);

                    if (diffMinutes > HEARTBEAT.OFFLINE_TREASHOLD_MINUTES) {
                        Logger.info(`Device ${mac} is offline. Last heartbeat was ${diffMinutes} minutes ago.`);
                        if (status.Mode !== EDeviceModes.Offline) {
                            status.Mode = EDeviceModes.Offline;
                            this._deviceRepository.putDevice({ Mac: mac, Mode: status.Mode } as IDevice);
                        }
                        const notifiction: INotification = {
                            UniqueIdentifier: this.generateDeviceID(mac),
                            Type: EnumAppNotificationType.offline,
                            Title: `Device ${status.PIDisplayName} is offline. Last seen online: ${lastHeartbeat}.`,
                            PiUniqeIdentifier: status.PIUniqueIdentifier,
                            DateCreated: status.LastHeartbeat
                        }
                        this._notificationRepository.postNotification(notifiction);


                    } else {
                        //We are only changing it to online if it's seen as offline, otherwise we'll leave it as is.
                        if (status.Mode === EDeviceModes.Offline) {
                            status.Mode = EDeviceModes.Online;
                            this._deviceRepository.putDevice({ Mac: mac, Mode: status.Mode } as IDevice);
                        }
                        Logger.info(`Device ${mac} is online. Last heartbeat was ${diffMinutes} minutes ago.`);
                    }
                });
            }
        }, this.getInterval());
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            Logger.warning("Heartbeat monitor stopped.");
        }
    }

    generateDeviceID(mac: string): string {
        const timestamp = Date.now().toString(36); // base36 = shorter
        const cleanMac = mac.replace(/[:\-]/g, '').toLowerCase(); // remove colons or dashes
        const randomPart = Math.random().toString(36).substring(2, 8); // 6-char random string

        return `${timestamp}-${cleanMac}-${randomPart}`;
    }
}
