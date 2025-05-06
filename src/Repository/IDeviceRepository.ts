import {IDevice} from "../Entities/Interfaces/IDevice.js";

export interface IDeviceRepository{
    read(id: number, range: number);
    readAllDevices() : Promise<IDevice[]>;
    readDeviceById(id: number) : Promise<IDevice>;
    readDeviceByMacAddress(macAddress: string) : Promise<IDevice>;
}