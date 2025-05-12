import {MongoDBClient} from "../Data/MongoDBClient.js";
import INotificationRepository from "./INotificationRepository.js";

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

    async postNotification(notification: INotification): Promise<INotification> {
        const collection = await this._database.getCollectionAsync<INotification>(this._collection);
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