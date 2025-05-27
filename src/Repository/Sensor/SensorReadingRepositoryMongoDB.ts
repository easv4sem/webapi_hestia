import {ISensorReadingRepository} from "./ISensorReadingRepository.js";
import {MongoDBClient} from "../../Data/MongoDBClient.js";
import Logger from "../../Infrastructure/Logger/logger.js";
import {ESensorTypes} from "../../Entities/Enums/ESensorTypes.js"
import {ISensorReading} from "../../Entities/Models/Sensor/ISensorReading.js";


export class SensorReadingRepositoryMongoDB implements ISensorReadingRepository {

    private readonly database: MongoDBClient;
    private readonly collection;

    constructor(database: MongoDBClient, collection: string) {
        this.database = database;
        this.collection = collection;
    }

    async getReadingsFromDeviceMac(mac: string) {
        return await this.database.getCollectionAsync<ISensorReading>(this.collection)
            .then(collection => collection.find({PIUniqueIdentifier: mac}).toArray()) || undefined;
    }
    async getReadingsFromSensor(type: number) {
        return await this.database.getCollectionAsync<ISensorReading>(this.collection)
            .then(collection => collection.find({Type: type}).toArray()) || undefined;
    }

    async getLatestReadingByDeviceId(PIUniqueIdentifier: string): Promise<ISensorReading | undefined> {
        const collection = await this.database.getCollectionAsync<ISensorReading>(this.collection);
        return await collection
            .find({ PIUniqueIdentifier })
            .sort({ TimeStamp: -1 })
            .limit(1)
            .next() || undefined;
    }

    // @ts-ignore
    async insertSensorReadings(rawSensorData: string ) {

        const sensorDataList: ISensorReading[] = [];

        try {
            const PiMac = rawSensorData["Mac-Add"];
            const TimeStamp = rawSensorData["Date"];

            for (const key of Object.keys(rawSensorData)) {
                if (key !== "Mac-Add" && key !== "Date") {
                    const innerData = rawSensorData[key];
                    let data: any;
                    let SensorType: string | undefined;

                    if (typeof innerData === "string") {
                        try {
                            data = JSON.parse(innerData);
                        } catch (error) {
                            Logger.error(`Error parsing inner data for ${key}:`, error);
                            data = innerData;
                        }
                    } else {
                        data = innerData;
                    }

                    if (typeof data === "object") {
                        const firstInner = Object.values(data)[0];
                        if (firstInner && typeof firstInner === "object") {
                            SensorType = firstInner["Type"] ?? null;
                        }
                    }

                    let type: ESensorTypes = ESensorTypes.unknown;

                    switch (SensorType) {
                        case "Camera":
                            type = ESensorTypes.camera;
                            break;

                        case "bme280":
                            type = ESensorTypes.bme280;
                            break;

                        case "MQ-135":
                            type = ESensorTypes.mq135mq2;
                            break;

                        case "YL-69":
                            type = ESensorTypes.yl69;
                            break;

                        default:
                            type = ESensorTypes.unknown;
                            break;
                    }

                    sensorDataList.push({
                        SensorUniqueIdentifier: key,
                        PIUniqueIdentifier: PiMac,
                        Type: type,
                        TimeStamp: TimeStamp,
                        Data: data ?? rawSensorData[key]
                    })
                }
            }


        } catch (error) {
            Logger.error("Error converting from json to object: ", error);
        }

        const collection = await this.database.getCollectionAsync<ISensorReading>(this.collection);
        const result = await collection.insertMany(sensorDataList)

        if(result.acknowledged) {
            Logger.info("Successful Insert");
            return sensorDataList
        }else{
            Logger.error("Failed to insert sensor readings");
        }


    }


}




