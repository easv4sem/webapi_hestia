import { ISensorReadingRepository } from "./ISensorReadingRepository";
import { MongoDBClient } from "../Data/MongoDBClient.js";
import Logger from "../Infrastructure/Logger/logger.js";
import { ISensorData } from "../Entities/Models/ISensorData";


export class SensorReadingRepositoryMongoDB implements ISensorReadingRepository {

    private readonly database: MongoDBClient;
    private readonly collection;

    constructor(database: MongoDBClient, collection: string) {
        this.database = database;
        this.collection = collection;

    }

    // @ts-ignore
    async insertSensorReadings(rawSensorData: string ) {

        const sensorDataList: ISensorData[] = [];

        try {
            const PiMac = rawSensorData["Mac-Add"];
            const TimeStamp = rawSensorData["Date"];

            for (const key of Object.keys(rawSensorData)) {
                if (key !== "Mac-Add" && key !== "Date") {
                    const innerData = rawSensorData[key];
                    let data: any;

                    if (typeof innerData === "string") {
                       try {
                            data = JSON.parse(innerData);
                       } catch (error) {
                           Logger.error("Error parsing inner data: " + error);
                       }
                    }

                    let type: string = key;

                    if (typeof data === "object" && data !== null) {
                        const innerKey = Object.keys(data)
                        if (innerKey.length === 1) {
                            type = innerKey[0];
                        }
                    }

                    sensorDataList.push({
                        SensorUniqeIdentifier: key,
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

        const collection = await this.database.getCollectionAsync<ISensorData>(this.collection);
        const result = await collection.insertMany(sensorDataList)

        if(result.acknowledged) {
            Logger.info("Successful Insert");
            return sensorDataList
        }else{
            Logger.error("Failed to insert sensor readings");
        }


    }


}

