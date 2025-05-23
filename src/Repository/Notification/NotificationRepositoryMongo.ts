import {MongoDBClient} from "../../Data/MongoDBClient";
import INotificationRepository from "./INotificationRepository";
import {INotification} from "../../Entities/Models/Notification/INotification";

export class NotificationRepositoryMongo implements INotificationRepository{

    private readonly _database : MongoDBClient;
    private readonly _collection: string;

    constructor(database : MongoDBClient, collection : string) {
        this._database = database;
        this._collection = collection
    }

    async readAllNotifications(): Promise<INotification[]> {
        return await this._database.getCollectionAsync<INotification>(this._collection).then(collection => collection.find({}).toArray()) || [];
    }
    async readNotificationById(id: string): Promise<INotification> {
        return await this._database.getCollectionAsync<INotification>(this._collection).then(collection => collection.findOne({UniqueIdentifier: id})) || undefined;
    }
    async readAllUnreadNotifications(): Promise<INotification[]> {
        return await this._database.getCollectionAsync<INotification>(this._collection).then(collection => collection.find({read: false}).toArray()) || [];
    }

    /// <summary>
    /// Inserts a new notification into the database.
    /// If a notification with the same UniqueIdentifier already exists, an error is thrown.
    /// This implementation isn't best practice as it could result in a race condition.
    /// A better approach would be to use a unique index on the UniqueIdentifier field and handle the error if it occurs.
    /// Time constraint resulted in this implementation.
    /// </summary>
    async postNotification(notification: INotification): Promise<INotification> {
        const collection = await this._database.getCollectionAsync<INotification>(this._collection);

        const existing = await collection.findOne({ UniqueIdentifier: notification.UniqueIdentifier });
        if (existing) {
            throw new Error(`Notification with UniqueIdentifier "${notification.UniqueIdentifier}" already exists.`);
        }

        const result = await collection.insertOne(notification);
        if (result.acknowledged) {
            return notification;
        } else {
            throw new Error("Failed to insert notification");
        }
    }

    async putNotification(notification: INotification): Promise<INotification> {
        const collection = await this._database.getCollectionAsync<INotification>(this._collection);
        const result = await collection.updateOne({UniqueIdentifier: notification.UniqueIdentifier}, {$set: notification});
        if (result.modifiedCount > 0) {
            return notification;
        } else {
            throw new Error("Failed to update notification");
        }
    }

    async deleteNotificationById(id: string): Promise<boolean> {
        const collection = await this._database.getCollectionAsync<INotification>(this._collection);
        const result = await collection.deleteOne({UniqueIdentifier: id});
        return result.deletedCount > 0;
    }
}