import express from "express";
import {SensorController} from "../Controller/sensorController.js";
import {ISensorRepository} from "../Repository/ISensorRepository";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import {SensorRepositoryMongoDB} from "../Repository/SensorRepositoryMongoDB.js";

const sensorRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");
const sensorRepository : ISensorRepository = new SensorRepositoryMongoDB(mongoClient, process.env.MONGO_DB_SENSOR_COLLECTION || "sensors");
const controller = new SensorController(sensorRepository);

sensorRoutes.post("/", controller.postSensor.bind(controller));
sensorRoutes.put("/", controller.putSensor.bind(controller));
sensorRoutes.get("/", controller.getAllSensors.bind(controller));
sensorRoutes.get("/id/:id", controller.getSensorById.bind(controller));
sensorRoutes.get("/serial/:serial", controller.getSensorBySerialNumber.bind(controller));
sensorRoutes.delete("/id/:id", controller.deleteSensorById.bind(controller));


export { sensorRoutes };
