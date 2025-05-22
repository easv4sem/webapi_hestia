import {IDeviceRepository} from "./IDeviceRepository";
import {IDevice} from "../Entities/Models/IDevice";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import { EDeviceModes } from "../Entities/Enums/EDeviceModes.js";
import Logger from "../Infrastructure/Logger/logger.js";

export class DeviceRepositoryMongoDB implements IDeviceRepository{

    private readonly database : MongoDBClient;
    private readonly collection : string;

    constructor(mongoClient : MongoDBClient, collection : string) {
        this.database = mongoClient;
        this.collection = collection;
    }

    async deleteDeviceById(id: string): Promise<boolean> {
        const collection = await this.database.getCollectionAsync<IDevice>(this.collection);
        const result = await collection.deleteOne({PIUniqueIdentifier: id});
        return result.deletedCount > 0;
    }

    async deleteDeviceByMac(mac: string): Promise<boolean> {
        const collection = await this.database.getCollectionAsync<IDevice>(this.collection);
        const result = await collection.deleteOne({Mac: mac});
        return result.deletedCount > 0;
    }


    async readAllDevices(): Promise<IDevice[]> {
        return await this.database.getCollectionAsync<IDevice>(this.collection).then(collection => collection.find({}).toArray()) || [];
    }

    async readDeviceById(id: string): Promise<IDevice> {
        return await this.database.getCollectionAsync<IDevice>(this.collection).then(collection => collection.findOne({PIUniqueIdentifier: id})) || undefined;
    }

    async readDeviceByMacAddress(macAddress: string): Promise<IDevice> {
        return await this.database.getCollectionAsync<IDevice>(this.collection).then(collection => collection.findOne({Mac: macAddress})) || undefined;
    }

    async postDevice(device: IDevice): Promise<IDevice> {

        if (!device.Mode) device.Mode = EDeviceModes.Offline;

        const collection = await this.database.getCollectionAsync<IDevice>(this.collection);
        const result = await collection.insertOne(device);
        if (result.acknowledged) {
            return device;
        } else {
            throw new Error("Failed to insert device");
        }
    }

    async putDevice(device: IDevice): Promise<IDevice> {
        const collection = await this.database.getCollectionAsync<IDevice>(this.collection);

        const oldDevice = await collection.findOne({Mac: device.Mac});
        Logger.warn("Device is identical")
        if (oldDevice === device) return device;


        const result = await collection.updateOne({Mac: device.Mac}, {$set: device});
        if (result.modifiedCount > 0) {
            return device;
        } else {
            throw new Error("Failed to update device");
        }
    }

}