import {IDeviceRepository} from "../Repository/IDeviceRepository.js";
import {RegexUtils} from "../Utilities/regexUtils.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {IDevice} from "../Entities/Models/IDevice.js";
import logger from "../Infrastructure/Logger/logger.js";

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

    constructor(deviceRepository: IDeviceRepository) {
        this._deviceRepository = deviceRepository;
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
        return res.status(200).send("Device deleted successfully");

    }
    public async deleteDeviceByMac(req: any, res: any): Promise<Response> {
        if (!req.params?.mac) {
            return res.status(400).send("Device mac is required as a parameter");
        }

        // delete the device if it exists
        const device : IDevice = await this._deviceRepository.readDeviceById(req.params.mac);
        if (!device) {
            return res.status(404).send("Device not found");
        }

        const deleted : boolean = await this._deviceRepository.deleteDeviceByMac(req.params.mac);
        if (!deleted) {
            return res.status(500).send("Failed to delete device");
        }
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

            const device : IDevice = await this._deviceRepository.readDeviceByMacAddress(req.params.mac);
            if (!device || device === undefined) {
                return res.status(404).send("Device not found");
            }
            return await res.status(200).send(device);
        } catch (err) {
            Logger.error("Error fetching device by mac address: ", err);
            return res.status(500).send("Internal server error");
        }

    }
    public async getDevices(req: any, res: any): Promise<Response> {

        try {
            const devices : IDevice[] = await this._deviceRepository.readAllDevices();

            if (devices.length === 0) {
                return res.status(404).send("No devices found");
            }

            return res.status(200).send(devices);

        } catch (err) {
            Logger.error("Error fetching devices: ", err);
            return res.status(500).send("Internal server error");
        }
    }

}

