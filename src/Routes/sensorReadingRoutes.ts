import express from "express";
import { SensorReadingController } from "../Controller/SensorReadingController";
import { ISensorReadingRepository } from "../Repository/ISensorReadingRepository";
import {MongoDBClient} from "../Data/MongoDBClient";
import {SensorReadingRepositoryMongoDB} from "../Repository/SensorReadingRepositoryMongoDB";


const sensorReadingRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");
const sensorReadingsRepository : ISensorReadingRepository = new SensorReadingRepositoryMongoDB(mongoClient, process.env.MONGO_DB_SENSOR_COLLECTION || "sensors");
const {getSensorData} = new SensorReadingController(sensorReadingsRepository)

sensorReadingRoutes.post("/", getSensorData);