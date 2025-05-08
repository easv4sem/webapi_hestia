import { MongoClient, Db, Collection } from "mongodb";
import Logger from "../Infrastructure/Logger/logger.js";

interface IMongoDBClient {
    close() : Promise<void>;
    getCollectionAsync<T>(collectionName: string) : Promise<Collection<T>>;
}

/**
 * MongoDBClient is a class that provides methods to interact with a MongoDB database.
 * It handles connection pooling, executing queries, and managing connections.
 */
export class MongoDBClient implements IMongoDBClient{
    private readonly connectionString: string;
    private readonly databaseName: string;
    private client: MongoClient | null = null;

    constructor(connectionString: string, databaseName: string) {
        this.connectionString = connectionString;
        this.databaseName = databaseName;
    }

    private async connect(): Promise<Db> {
        if (!this.client) {
            this.client = new MongoClient(this.connectionString);
            await this.client.connect();
        }
        return this.client.db(this.databaseName);
    }

    public async getCollectionAsync<T>(collectionName: string): Promise<Collection<T>> {
        try {
            const db = await this.connect();
            return db.collection<T>(collectionName);
        } catch (error) {
            Logger.error("MongoDB connection failed:", error);
            throw error;
        }
    }

    public async close(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
        }
    }
}
