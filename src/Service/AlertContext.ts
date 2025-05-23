import { MongoClient } from 'mongodb';
import { NotificationRepositoryMongo } from '../Repository/Notification/NotificationRepositoryMongo.js';
import { DeviceRepositoryMongoDB } from '../Repository/Device/DeviceRepositoryMongoDB.js';

const mongoClient = new MongoClient(
    process.env.MONGO_URL,
    process.env.MONGO_DB_NAME,
);

export const AlertContext = {
    mongoClient,
    notificationRepository: new NotificationRepositoryMongo(mongoClient, process.env.MONGO_DB_NOTIFICATIONS_COLLECTION),
    deviceRepository: new DeviceRepositoryMongoDB(mongoClient, process.env.MONGO_DB_DEVICES_COLLECTION),
}