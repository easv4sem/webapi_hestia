import {ISensorRepository} from "./ISensorRepository";
import {ISensor} from "../../Entities/Models/Sensor/ISensor";
import {MongoDBClient} from "../../Data/MongoDBClient";
import {IDevice} from "../../Entities/Models/Device/IDevice";

export class SensorRepositoryMongoDB implements ISensorRepository {
    private readonly database: MongoDBClient;
    private readonly collection;

    constructor(database: MongoDBClient, collection: string) {
        this.database = database;
        this.collection = collection;
    }


    async deleteSensorById(sensorId: string): Promise<boolean> {
        const collection = await this.database.getCollectionAsync<IDevice>(this.collection);
        const result = await collection.deleteOne({UniqueIdentifier: sensorId});
        return result.deletedCount > 0;
    }

    async getAllSensors(): Promise<ISensor[]> {
        return await this.database.getCollectionAsync<ISensor>(this.collection).then(collection => collection.find({}).toArray()) || [];
    }

    async getSensorById(sensorId: string): Promise<ISensor> {
        return await this.database.getCollectionAsync<ISensor>(this.collection).then(collection => collection.findOne({UniqueIdentifier: sensorId})) || undefined;
    }

    async getSensorBySerialNumber(serialNumber: string): Promise<ISensor> {
        return await this.database.getCollectionAsync<ISensor>(this.collection).then(collection => collection.findOne({SerialNumber: serialNumber})) || undefined;
    }

    async postSensor(sensor: ISensor): Promise<ISensor> {
        const collection = await this.database.getCollectionAsync<ISensor>(this.collection);
        const result = await collection.insertOne(sensor);
        if (result.acknowledged) {
            return sensor;
        } else {
            throw new Error("Failed to insert sensor");
        }
    }

    async putSensor(sensor: ISensor): Promise<ISensor> {
        const collection = await this.database.getCollectionAsync<ISensor>(this.collection);
        const result = await collection.updateOne({UniqueIdentifier: sensor.UniqueIdentifier}, {$set: sensor});
        if (result.modifiedCount > 0) {
            return sensor;
        } else {
            throw new Error("Failed to update sensor");
        }
    }

}