import {IDeviceRepository} from "../Repository/IDeviceRepository.js";
import {RegexUtils} from "../Utilities/regexUtils.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {IDevice} from "../Entities/Interfaces/IDevice";

interface IDeviceController {
    getDeviceByMac(req: any, res: any): Promise<Response>;
    getDeviceById(req: any, res: any): Promise<Response>;
    getDevices(req: any, res: any): Promise<Response>;
}

export default class DeviceController implements IDeviceController {
    private readonly _deviceRepository: IDeviceRepository;

    constructor(deviceRepository: IDeviceRepository) {
        this._deviceRepository = deviceRepository;
        this.getDevices = this.getDevices.bind(this);
        this.getDeviceById = this.getDeviceById.bind(this);
        this.getDeviceByMac = this.getDeviceByMac.bind(this);
    }

    public async getDeviceById(req: any, res: any): Promise<Response> {

        try {

            if (!req.params?.id) {
                return res.status(404).send("Id missing required field");
            }

            const device : IDevice = await this._deviceRepository.readDeviceById(req.params.id);
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

