import express from "express";
import DeviceController from "../Controller/deviceController.js";
import {DeviceRepositoryMongoDB} from "../Repository/DeviceRepositoryMongoDB.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import {DeviceRepositoryReadies} from "../Repository/DeviceRepositoryRedies.js";
import HeartbeatController from "../Controller/heartbeatController.js";
import {NotificationRepositoryMongo} from "../Repository/NotificationRepositoryMongo.js";

const deviceRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");

const {
    getDeviceByMac,
    getDeviceById,
    getDevices,
    putDevice,
    postDevice,
    deleteDeviceByMac,
    deleteDeviceById,
    getAllDeviceSensorsByDeviceID,
    getAllDeviceSensorsByDeviceMac,
    postSensorToDeviceByDeviceID,
    postSensorToDeviceByDeviceMac,
} = new DeviceController(new DeviceRepositoryMongoDB(mongoClient, "devices"), new DeviceRepositoryReadies());
const {
    postHeartbeat

} = new HeartbeatController(new DeviceRepositoryMongoDB(mongoClient, "devices"), new NotificationRepositoryMongo(mongoClient, process.env.MONGO_DB_NOTIFICATIONS_COLLECTION || "notifications"));

deviceRoutes.get("/id/:id", getDeviceById);
deviceRoutes.get("/mac/:mac", getDeviceByMac);
deviceRoutes.get("/", getDevices);
deviceRoutes.put("/", putDevice)
deviceRoutes.post("/", postDevice)
deviceRoutes.delete("/id/:id", deleteDeviceById)
deviceRoutes.delete("/mac/:mac", deleteDeviceByMac)

// Get all sensors for a device by device id.
deviceRoutes.get("/id/:id/sensors", getAllDeviceSensorsByDeviceID)
deviceRoutes.get("/mac/:mac/sensors", getAllDeviceSensorsByDeviceMac)
deviceRoutes.post("/id/:id/sensor/", postSensorToDeviceByDeviceID)
deviceRoutes.post("/mac/:mac/sensor/", postSensorToDeviceByDeviceMac)

// Heartbeat
deviceRoutes.post("/heartbeat", postHeartbeat)


export { deviceRoutes };