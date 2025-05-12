import express from "express";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import INotificationRepository from "../Repository/INotificationRepository.js";
import {NotificationRepositoryMongo} from "../Repository/NotificationRepositoryMongo.js";
import {INotificationsController, NotificationsController} from "../Controller/notificationsController.js";

const notificationRoutes = express.Router();
const mongoClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia");
const notificationRepository : INotificationRepository = new NotificationRepositoryMongo(mongoClient,  process.env.MONGO_DB_NOTIFICATIONS_COLLECTION || "notifications")
const {getNotificationById, getAllNotifications, getAllActiveNotifications, updateNotification, createNotification, deleteNotification} : INotificationsController = new NotificationsController(notificationRepository);

notificationRoutes.get("/", getAllNotifications);
notificationRoutes.get("/id/:id", getNotificationById);
notificationRoutes.get("/active", getAllActiveNotifications);
notificationRoutes.put("/", updateNotification);
notificationRoutes.post("/", createNotification);
notificationRoutes.delete("/id/:id", deleteNotification);



notificationRoutes.all('*', (req:any,res:any) => res.status(404).send('no such route'));


export { notificationRoutes };