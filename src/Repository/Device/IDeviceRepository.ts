import { IDevice } from "../../Entities/Models/Device/IDevice";

export interface IDeviceRepository{
    readAllDevices() : Promise<IDevice[]>;
    readDeviceById(id: string) : Promise<IDevice>;
    readDeviceByMacAddress(macAddress: string) : Promise<IDevice>;
    postDevice(device: IDevice): Promise<IDevice>;
    putDevice(device: IDevice): Promise<IDevice>;
    deleteDeviceById(id: string): Promise<boolean>;
    deleteDeviceByMac(mac: string): Promise<boolean>;
}