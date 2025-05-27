import express from "express";
import { SensorReadingController } from "../Controller/Sensor/sensorReadingController.js";
import { ISensorReadingRepository } from "../Repository/Sensor/ISensorReadingRepository.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import {SensorReadingRepositoryMongoDB} from "../Repository/Sensor/SensorReadingRepositoryMongoDB.js";


const sensorReadingRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");
const sensorReadingsRepository : ISensorReadingRepository = new SensorReadingRepositoryMongoDB(mongoClient, process.env.MONGO_DB_SENSOR_COLLECTION || "sensorReadings");
const {getSensorData, getReadingsFromDeviceMac, getReadingsFromSensorType, insertSensorReadings} = new SensorReadingController(sensorReadingsRepository)

sensorReadingRoutes.post("/", getSensorData);
sensorReadingRoutes.post("/insert", insertSensorReadings);

// readings from device
// readings from specific sensor type
sensorReadingRoutes.get("/mac/:mac", getReadingsFromDeviceMac);

sensorReadingRoutes.get("/type/:type", getReadingsFromSensorType);

export {sensorReadingRoutes}