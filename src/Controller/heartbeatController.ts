import {IDeviceRepository} from "../Repository/Device/IDeviceRepository.js";
import INotificationRepository from "../Repository/Notification/INotificationRepository.js";
import {RegexUtils} from "../Utilities/regexUtils.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {IDevice} from "../Entities/Models/Device/IDevice.js";
import HeartBeatMonitor from "../Service/heartBeatService.js";
import {deviceStatus} from "../Entities/Models/Device/DeviceStatus.js";
import {DEBUG} from "../config/config.js";

export default class HeartbeatController {
    private readonly _deviceRepository: IDeviceRepository;
    private readonly _notificationRepository: INotificationRepository;

    constructor(deviceRepository: IDeviceRepository, notificationRepository: INotificationRepository) {
        this._deviceRepository = deviceRepository;
        this._notificationRepository = notificationRepository;

        HeartBeatMonitor.getInstance(this._deviceRepository, this._notificationRepository);


        this.postHeartbeat = this.postHeartbeat.bind(this);
    }

    /**
     * Handles the heartbeat POST request.
     * Validates the MAC address and date, updates the device's last heartbeat,
     * and returns the updated device information.
     * @param req - The request object containing the MAC address and date.
     * @param res - The response object to send the result.
     */
    public async postHeartbeat(req: any, res: any): Promise<Response> {
        try {
            const mac = req.body.mac;
            const dateStr = req.body.date;

            // Validate MAC
            if (!mac || !RegexUtils.isValidMacAddress(mac)) {
                Logger.warn("[HEARTBEAT CONTROLLER] Failed Heartbeat - Invalid MAC", mac, req.body);
                return res.status(400).send("Invalid or missing MAC address");
            }

            // Validate and parse date
            if (!dateStr) {
                Logger.warn("[HEARTBEAT CONTROLLER] Failed Heartbeat - Missing Date", mac, req.body);
                return res.status(400).send("Missing date");
            }

            const heartbeatDate = new Date(dateStr);

            if (isNaN(heartbeatDate.getTime())) {
                Logger.warn("[HEARTBEAT CONTROLLER] Failed Heartbeat - Invalid Date", mac, req.body);
                return res.status(400).send("Invalid date format");
            }

            // Lookup device
            const device: IDevice | null = await this._deviceRepository.readDeviceByMacAddress(mac);

            if (!device) {
                Logger.warn("[HEARTBEAT CONTROLLER] Failed Heartbeat - Unknown Device", mac);
                return res.status(404).send("Device not found");
            }

            // Check if heartbeat is newer
            if (device.LastHeartbeat && device.LastHeartbeat > heartbeatDate) {
                Logger.warn("[HEARTBEAT CONTROLLER] Failed Heartbeat - Outdated Date", {
                    mac,
                    lastHeartbeat: device.LastHeartbeat,
                    newDate: heartbeatDate
                });
                return res.status(400).send("Heartbeat date is older than last known value");
            }

            // Update and persist
            device.LastHeartbeat = heartbeatDate;
            const updatedDevice: IDevice = await this._deviceRepository.putDevice(device);
            deviceStatus.set(mac, {
                LastHeartbeat: updatedDevice.LastHeartbeat,
                Mode: updatedDevice.Mode,
                PIUniqueIdentifier: updatedDevice.PIUniqueIdentifier,
                PIDisplayName: updatedDevice.PIDisplayName,
            })

            if(DEBUG){
                Logger.warn("[HEARTBEAT CONTROLLER] Heartbeat received successfully: ", req);
            }


            return res.status(200).send(updatedDevice);

        } catch (err) {
            Logger.error("[HEARTBEAT CONTROLLER] Error receiving heartbeat", err, req);
            return res.status(500).send("Internal server error");
        }
    }


}