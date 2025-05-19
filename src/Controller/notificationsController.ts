import { Request, Response } from "express";
import { EnumAppNotificationType } from "../Entities/Enums/EnumAppNotificationType.js";
import INotificationRepository from "../Repository/INotificationRepository.js";
import Logger from "../Infrastructure/Logger/logger.js";

export interface INotificationsController {
    getAllNotifications(request: Request, response: Response): Promise<Response>;
    getAllActiveNotifications(request: Request, response: Response): Promise<Response>;
    getNotificationById(request: Request, response: Response): Promise<Response>;
    createNotification(request: Request, response: Response): Promise<Response>;
    updateNotification(request: Request, response: Response): Promise<Response>;
    deleteNotification(request: Request, response: Response): Promise<Response>;
}

export class NotificationsController implements INotificationsController {

    private readonly _notificationsRepository: INotificationRepository;

    constructor(notificationsRepo : INotificationRepository) {
        this._notificationsRepository = notificationsRepo;
        this.getAllNotifications = this.getAllNotifications.bind(this);
        this.getAllActiveNotifications = this.getAllActiveNotifications.bind(this);
        this.getNotificationById = this.getNotificationById.bind(this);
        this.createNotification = this.createNotification.bind(this);
        this.updateNotification = this.updateNotification.bind(this);
        this.deleteNotification = this.deleteNotification.bind(this);
    }

    async getAllNotifications(request: Request, response: Response): Promise<Response> {
        try {

            const notifications = await this._notificationsRepository.readAllNotifications();
            if (!notifications ) {
                return response.status(404).send("No notifications found");
            }

            if (notifications.length === 0) {
                return response.status(404).send("No notifications found");
            }

            return response.status(200).send(notifications);
        } catch (error) {
            Logger.error("Error getting all notifications: ", error);
            return response.status(500).send("Internal server error");
        }
    }

    async getAllActiveNotifications(request: Request, response: Response): Promise<Response> {
        try {

            const notifications = await this._notificationsRepository.readAllUnreadNotifications();
            if (!notifications ) {
                return response.status(404).send("No active notifications found");
            }

            if (notifications.length === 0) {
                return response.status(404).send("No active notifications found");
            }

            return response.status(200).send(notifications);

        } catch (error) {
            Logger.error("Error getting all active notifications: ", error);
            return response.status(500).send("Internal server error");
        }
    }

    async getNotificationById(request: Request, response: Response): Promise<Response> {

        try {
            if (!request.params?.id) {
                return response.status(400).send("Notification id is required as a parameter");
            }

            const notification = await this._notificationsRepository.readNotificationById(request.params.id);
            if (!notification) {
                return response.status(404).send("Notification not found");
            }

            return response.status(200).send(notification);

        } catch (error) {
            Logger.error("Error getting notification by id: ", error);
            return response.status(500).send("Internal server error");
        }

    }

    async createNotification(request: Request, response: Response): Promise<Response> {
        try {

            const notification = request.body?.notification;

            if (!request.body) {
                return response.status(400).send("Request body is required");
            }

            if (!notification || !notification.UniqueIdentifier) {
                return response.status(400).send("Notification data is required");
            }

            if(typeof notification.Type !== "number" || !Object.values(EnumAppNotificationType).includes(notification.Type)) {
                return response.status(400).send("Notification type is required and must be a valid Type");
            }

            if (!notification.DateCreated) {
                notification.DateCreated = new Date();
            }

            const createNotification =  await this._notificationsRepository.postNotification(notification);
            return response.status(201).send(createNotification);

        } catch (error) {
            Logger.error("Error creating notification: ", error);
            return response.status(500).send("Internal server error");
        }

    }

    async updateNotification(request: Request, response: Response): Promise<Response> {
        try {


            const notification = request.body?.notification;
            if (!notification) {
                return response.status(400).send("Notification data is required");
            }

            const existingNotification = await this._notificationsRepository.readNotificationById(notification.UniqueIdentifier);
            if (!existingNotification) {
                return response.status(404).send("Notification not found");
            }

            const updatedNotification = await this._notificationsRepository.putNotification(notification);
            return response.status(200).send(updatedNotification);

        } catch (error) {
            Logger.error("Error updating notification: ", error);
            return response.status(500).send("Internal server error");
        }
    }

    async deleteNotification(request: Request, response: Response): Promise<Response> {
        try {

            if (!request.params?.id) {
                return response.status(400).send("Notification id is required as a parameter");
            }


            const deletedNotification = await this._notificationsRepository.deleteNotificationById(request.params.id);
            if (!deletedNotification) {
                return response.status(404).send("Notification not found");
            }

            return response.status(200).send("Notification deleted successfully");

        } catch (error) {
            Logger.error("Error deleting notification: ", error);
            return response.status(500).send("Internal server error");
        }
    }

}