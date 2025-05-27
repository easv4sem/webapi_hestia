import { NotificationRepositoryMongo } from '../Repository/Notification/NotificationRepositoryMongo.js';
import { DeviceRepositoryMongoDB } from '../Repository/Device/DeviceRepositoryMongoDB.js';
import {SensorReadingRepositoryMongoDB} from "../Repository/Sensor/SensorReadingRepositoryMongoDB.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";

const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");


/**
 * Context for the Alert service/Handlers, providing access to the MongoDB client, device and Notification repositories.
 */
export const AlertContext = {
    mongoClient,
    notificationRepository: new NotificationRepositoryMongo(mongoClient, process.env.MONGO_DB_NOTIFICATIONS_COLLECTION),
    deviceRepository: new DeviceRepositoryMongoDB(mongoClient, process.env.MONGO_DB_DEVICES_COLLECTION),
    sensorRepository: new SensorReadingRepositoryMongoDB(mongoClient, process.env.MONGO_DB_SENSOR_COLLECTION),
}