import {IDeviceRepository} from "../Repository/Device/IDeviceRepository";
import {RegexUtils} from "../Utilities/regexUtils.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {IDevice} from "../Entities/Models/Device/IDevice";
import { IDeviceRepositoryReadies} from "../Repository/Device/DeviceRepositoryRedies";

interface IDeviceController {
    getDeviceByMac(req: any, res: any): Promise<Response>;
    getDeviceById(req: any, res: any): Promise<Response>;
    getDevices(req: any, res: any): Promise<Response>;
    putDevice(req: any, res: any): Promise<Response>;
    postDevice(req: any, res: any): Promise<Response>;
    deleteDeviceById(req: any, res: any): Promise<Response>;
    deleteDeviceByMac(req: any, res: any): Promise<Response>;

    getAllDeviceSensorsByDeviceID(req: any, res: any): Promise<Response>;
    getAllDeviceSensorsByDeviceMac(req: any, res: any): Promise<Response>;
    postSensorToDeviceByDeviceID(req: any, res: any): Promise<Response>;
    postSensorToDeviceByDeviceMac(req: any, res: any): Promise<Response>;
}

export default class DeviceController implements IDeviceController {
    private readonly _deviceRepository: IDeviceRepository;
    private readonly _readisRepository: IDeviceRepositoryReadies;


    constructor(deviceRepository: IDeviceRepository, deviceRepositoryReadies: IDeviceRepositoryReadies) {
        this._deviceRepository = deviceRepository;
        this._readisRepository = deviceRepositoryReadies;
        this.getDevices = this.getDevices.bind(this);
        this.getDeviceById = this.getDeviceById.bind(this);
        this.getDeviceByMac = this.getDeviceByMac.bind(this);
        this.putDevice = this.putDevice.bind(this);
        this.postDevice = this.postDevice.bind(this);
        this.deleteDeviceById = this.deleteDeviceById.bind(this);
        this.deleteDeviceByMac = this.deleteDeviceByMac.bind(this);
        this.getAllDeviceSensorsByDeviceID = this.getAllDeviceSensorsByDeviceID.bind(this);
        this.getAllDeviceSensorsByDeviceMac = this.getAllDeviceSensorsByDeviceMac.bind(this);
        this.postSensorToDeviceByDeviceID = this.postSensorToDeviceByDeviceID.bind(this);

    }

    public async postSensorToDeviceByDeviceMac(req: any, res: any): Promise<Response> {

        try {

            if (!req.params?.mac) {
                return res.status(400).send("Device mac is required as a parameter");
            }

            if (!req.body?.sensor) {
                return res.status(400).send("Sensor is required in the body");
            }

            const device : IDevice = await this._deviceRepository.readDeviceByMacAddress(req.params.mac);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            if (device.Sensors.map(sensor => sensor.UniqueIdentifier == req.body.sensor.UniqueIdentifier).includes(true)) {
                return res.status(409).send("Sensor with that uniqidentifyer exists on device");
            }


            device.Sensors.push(req.body.sensor);
            const updatedDevice : IDevice = await this._deviceRepository.putDevice(device);
            if (!updatedDevice) {
                return res.status(500).send("Failed to update device");
            }

            // Update device in cash
            await this._readisRepository.cashDevice(device);

            return res.status(200).send(updatedDevice);
        } catch (err) {
            Logger.error("Error updating device: ", err);
            return res.status(500).send("Internal server error");
        }    }
    public async postSensorToDeviceByDeviceID(req: any, res: any): Promise<Response> {

        try {
            if (!req.params?.id) {
                return res.status(400).send("Device id is required as a parameter");
            }

            if (!req.body?.sensor) {
                return res.status(400).send("Sensor is required in the body");
            }

            const device : IDevice = await this._deviceRepository.readDeviceById(req.params.id);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            if (device.Sensors.map(sensor => sensor.UniqueIdentifier == req.body.sensor.UniqueIdentifier).includes(true)) {
                return res.status(409).send("Sensor with that uniqidentifyer exists on device");
            }


            device.Sensors.push(req.body.sensor);
            const updatedDevice : IDevice = await this._deviceRepository.putDevice(device);
            if (!updatedDevice) {
                return res.status(500).send("Failed to update device");
            }


            // Update device in cash
            await this._readisRepository.cashDevice(device);
            return res.status(200).send(updatedDevice);
        } catch (err) {
            Logger.error("Error updating device: ", err);
            return res.status(500).send("Internal server error");
        }

    }
    public async getAllDeviceSensorsByDeviceID(req: any, res: any): Promise<Response> {

        try {

            if (!req.params?.id) {
                return res.status(400).send("Device id is required as a parameter");
            }

            const device : IDevice = await this._deviceRepository.readDeviceById(req.params.id);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            if (!device.Sensors) {
                return res.status(404).send("Device has no sensors");
            }

            return res.status(200).send(device.Sensors);

        } catch (err) {
            Logger.error("Error fetching device by id: ", err);
            return res.status(500).send("Internal server error");
        }

    }
    public async getAllDeviceSensorsByDeviceMac(req: any, res: any): Promise<Response> {

        try {

            if (!req.params?.mac) {
                return res.status(400).send("Device mac is required as a parameter");
            }

            const device : IDevice = await this._deviceRepository.readDeviceByMacAddress(req.params.mac);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            if (!device.Sensors) {
                return res.status(404).send("Device has no sensors");
            }

            return res.status(200).send(device.Sensors);

        } catch (err) {
            Logger.error("Error fetching device by mac: ", err);
            return res.status(500).send("Internal server error");
        }
    }
    public async putDevice(req: any, res: any): Promise<Response> {
        try {

            if (!req.body?.device) {
                return res.status(400).send("Device is required in the body");
            }
            const device : IDevice = req.body.device;

            // Check if the device ID is a valid mac address
            if (!RegexUtils.isValidMacAddress(device.Mac)) {
                return res.status(400).send("Invalid Device ID, must be a valid mac address for the device");
            }
            const existingDevice : IDevice = await this._deviceRepository.readDeviceByMacAddress(device.Mac);
            if (!existingDevice) {
                return res.status(404).send("Device not found");
            }
            const updatedDevice : IDevice = await this._deviceRepository.putDevice(device);
            if (!updatedDevice) {
                return res.status(500).send("Failed to update device");
            }
            // Update device in cash
            await this._readisRepository.cashDevice(updatedDevice);
            return res.status(200).send(updatedDevice);



        } catch (err) {
            Logger.error("Error updating device: ", err);
            return res.status(500).send("Internal server error");
        }
    }
    public async postDevice(req: any, res: any): Promise<Response> {
        try {

            if (!req.body?.device) {
                return res.status(400).send("Device is required");
            }

            const device : IDevice = req.body.device;

            // Check if the device ID is a valid mac address
            if (!RegexUtils.isValidMacAddress(device.Mac)) {
                return res.status(400).send("Invalid Device ID, must be a valid mac address for the device");
            }

            const existingDevice : IDevice = await this._deviceRepository.readDeviceByMacAddress(device.Mac);
            if (existingDevice) {
                return res.status(409).send("Device already exists");
            }

            const newDevice : IDevice = await this._deviceRepository.postDevice(device);

            // Save device to cache
            await this._readisRepository.cashDevice(newDevice);

            return res.status(201).send(newDevice);

        } catch (err) {
            Logger.error("Error creating device: ", err);
            return res.status(500).send("Internal server error");
        }
    }
    public async deleteDeviceById(req: any, res: any): Promise<Response> {
        if (!req.params?.id) {
            return res.status(400).send("Device id is required as a parameter");
        }

        // delete the device if it exists
        const device : IDevice = await this._deviceRepository.readDeviceById(req.params.id);
        if (!device) {
            return res.status(404).send("Device not found");
        }

        const deleted : boolean = await this._deviceRepository.deleteDeviceById(req.params.id);
        if (!deleted) {
            return res.status(500).send("Failed to delete device");
        }
        // delete device from cash
        await this._readisRepository.delDeviceAsyncByMac(device.Mac);

        return res.status(200).send("Device deleted successfully");

    }
    public async deleteDeviceByMac(req: any, res: any): Promise<Response> {
        if (!req.params?.mac) {
            return res.status(400).send("Device mac is required as a parameter");
        }

        // delete the device if it exists
        const device : IDevice = await this._deviceRepository.readDeviceByMacAddress(req.params.mac);
        if (!device) {
            return res.status(404).send("Device not found");
        }

        const deleted : boolean = await this._deviceRepository.deleteDeviceByMac(req.params.mac);
        if (!deleted) {
            return res.status(500).send("Failed to delete device");
        }
        // delete device from cash
        await this._readisRepository.delDeviceAsyncByMac(req.params.mac);
        return res.status(200).send("Device deleted successfully");

    }
    public async getDeviceById(req: any, res: any): Promise<Response> {

        try {

            if (!req.params?.id) {
                return res.status(404).send("Id missing required field");
            }

            const device : IDevice = await this._deviceRepository.readDeviceById(req.params.id);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            return await res.status(200).send(device);

        } catch (err) {
            Logger.error("Error fetching device by id: ", err);
            return res.status(500).send("Internal server error");
        }

    }
    public async getDeviceByMac(req: any, res: any): Promise<Response> {

        try {
            if (!req.params?.mac) {
                return res.status(400).send("Device ID is required");
            }

            // Check if the device ID is a valid mac address
            if (!RegexUtils.isValidMacAddress(req.params?.mac)) {
                return res.status(400).send("Invalid Device ID, must be a valid mac address for the device");
            }

            // check if device is in cash
            const cachedDevice : IDevice = await this._readisRepository.readDeviceAsyncByMac(req.params.mac);
            if (cachedDevice) {
                Logger.info("Device found in cache", {mac: req.params.mac});
                return res.status(200).send(cachedDevice);
            }


            const device : IDevice = await this._deviceRepository.readDeviceByMacAddress(req.params.mac);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }

            // save device to cache
            await this._readisRepository.cashDevice(device);
            Logger.info("Device saved to cache", {mac: req.params.mac});

            return await res.status(200).send(device);
        } catch (err) {
            Logger.error("Error fetching device by mac address: ", err);
            return res.status(500).send("Internal server error");
        }

    }
    public async getDevices(req: any, res: any): Promise<Response> {

        try {

            // Check if the devices are in cache
            const cachedDevices : IDevice[] = await this._readisRepository.readAllDevicesAsync();
            if (cachedDevices && cachedDevices.length > 0) {
                Logger.info("Devices found in cache");
                return res.status(200).send(cachedDevices);
            }

            // If not in cache, fetch from the repository
            const devices : IDevice[] = await this._deviceRepository.readAllDevices();

            if (devices.length === 0) {
                return res.status(404).send("No devices found");
            }

            // Save devices to cache
            if (devices && devices.length > 0) {
                await this._readisRepository.cashAllDevices(devices);
                Logger.info("Devices saved to cache");
            }


            return res.status(200).send(devices);

        } catch (err) {
            Logger.error("Error fetching devices: ", err);
            return res.status(500).send("Internal server error");
        }
    }

    public async postHeartbeat(req: any, res: any): Promise<Response> {
        try {
            const mac = req.body.mac;
            const dateStr = req.body.date;

            // Validate MAC
            if (!mac || !RegexUtils.isValidMacAddress(mac)) {
                Logger.warning("Failed Heartbeat - Invalid MAC", {mac, body: req.body});
                return res.status(400).send("Invalid or missing MAC address");
            }

            // Validate and parse date
            if (!dateStr) {
                Logger.warning("Failed Heartbeat - Missing Date", {mac, body: req.body});
                return res.status(400).send("Missing date");
            }

            const heartbeatDate = new Date(dateStr);
            if (isNaN(heartbeatDate.getTime())) {
                Logger.warning("Failed Heartbeat - Invalid Date", {mac, body: req.body});
                return res.status(400).send("Invalid date format");
            }

            // Lookup device
            const device: IDevice | null = await this._deviceRepository.readDeviceByMacAddress(mac);
            if (!device) {
                Logger.warning("Failed Heartbeat - Unknown Device", {mac});
                return res.status(404).send("Device not found");
            }

            // Check if heartbeat is newer
            if (device.LastHeartbeat && device.LastHeartbeat > heartbeatDate) {
                Logger.warning("Failed Heartbeat - Outdated Date", {
                    mac,
                    lastHeartbeat: device.LastHeartbeat,
                    newDate: heartbeatDate
                });
                return res.status(400).send("Heartbeat date is older than last known value");
            }

            // Update and persist
            device.LastHeartbeat = heartbeatDate;
            const updatedDevice: IDevice = await this._deviceRepository.putDevice(device);

            return res.status(200).send(updatedDevice);

        } catch (err) {
            Logger.error("Error updating heartbeat", {error: err});
            return res.status(500).send("Internal server error");
        }
    }
}

