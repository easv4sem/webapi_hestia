import express from "express";
import {SensorController} from "../Controller/Sensor/sensorController.js";
import {ISensorRepository} from "../Repository/Sensor/ISensorRepository.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import {SensorRepositoryMongoDB} from "../Repository/Sensor/SensorRepositoryMongoDB.js";

const sensorRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");
const sensorRepository : ISensorRepository = new SensorRepositoryMongoDB(mongoClient, process.env.MONGO_DB_SENSOR_COLLECTION || "sensors");
const {postSensor, getAllSensors, getSensorBySerialNumber, putSensor, getSensorById, deleteSensorById} = new SensorController(sensorRepository);

sensorRoutes.post("/", postSensor);
sensorRoutes.put("/", putSensor);
sensorRoutes.get("/", getAllSensors);
sensorRoutes.get("/id/:id", getSensorById);
sensorRoutes.get("/serial/:serial", getSensorBySerialNumber);
sensorRoutes.delete("/id/:id", deleteSensorById);


export { sensorRoutes };