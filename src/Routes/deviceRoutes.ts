import express from "express";
import DeviceController from "../Controller/deviceController.js";
import {DeviceRepositoryMariaDB} from "../Repository/DeviceRepositoryMariaDB.js";
import {MariaDBService} from "../Data/MariaDBService.js";
import {SensorController} from "../Controller/SensorController.js";

const deviceRoutes = express.Router();
const mariaDBService = new MariaDBService();
const sensorController = new SensorController();

const {getDeviceByMac, getDeviceById, getDevices} = new DeviceController(new DeviceRepositoryMariaDB(mariaDBService));

deviceRoutes.get("/id/:id", getDeviceById);
deviceRoutes.get("/mac/:mac", getDeviceByMac);
deviceRoutes.get("/", getDevices);

deviceRoutes.get("/sensor", (req, res) =>
    sensorController.getSensorData(req, res));



export { deviceRoutes };