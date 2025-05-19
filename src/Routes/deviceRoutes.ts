import express from "express";
import DeviceController from "../Controller/deviceController.js";
import {DeviceRepositoryMongoDB} from "../Repository/DeviceRepositoryMongoDB.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";

const deviceRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");

const {getDeviceByMac, getDeviceById, getDevices, putDevice, postDevice, deleteDeviceByMac, deleteDeviceById} = new DeviceController(new DeviceRepositoryMongoDB(mongoClient, "devices"));

deviceRoutes.get("/id/:id", getDeviceById);
deviceRoutes.get("/mac/:mac", getDeviceByMac);
deviceRoutes.get("/", getDevices);
deviceRoutes.put("/", putDevice)
deviceRoutes.post("/", postDevice)
deviceRoutes.delete("/id/:id", deleteDeviceById)
deviceRoutes.delete("/mac/:id", deleteDeviceByMac)



export { deviceRoutes };