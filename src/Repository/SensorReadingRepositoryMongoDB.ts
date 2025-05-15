import { ISensorReadingRepository } from "../Repository/ISensorReadingRepository";
import { ISensor } from "../Entities/Models/ISensor";
import { MongoDBClient } from "../Data/MongoDBClient.js";
import * as QueryString from "node:querystring";

export class SensorReadingRepositoryMongoDB implements ISensorReadingRepository {

    private readonly database: MongoDBClient;
    private readonly collection;

    constructor(database: MongoDBClient, collection: string) {
        this.database = database;
        this.collection = collection;

    }

    // @ts-ignore
    readAllSensors(sensorData: string ) {

        console.log("Reading sensors data: ", sensorData);

        throw new Error("Method not implemented.");
    }


}

