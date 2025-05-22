import { createClient } from 'redis';
import Logger from "../Infrastructure/Logger/logger.js";

export interface IRedisClient {
    setValue(key: string, value: string, expireInMS: number, overRide: boolean): Promise<void>;
    getValue(key: string): Promise<string | null>;
    deleteValue(key: string): Promise<boolean>;
    getValueKeys(pattern: string): Promise<string[]>
}


export class RedisClient implements IRedisClient{
    private readonly client;

    private constructor(clientInstance) {
        this.client = clientInstance;
    }

    /// Factory method to create a Redis client instance, to avoid having to call async methods in the constructor.
    public static async create() : Promise<RedisClient> {
        try {
            const REDIS_HOST = process.env.REDIS_HOST || 'cache';
            const REDIS_PORT = process.env.REDIS_PORT || '6379';
            const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'my_password';

            const client = createClient({
                url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
                password: REDIS_PASSWORD,
            });

            client.on('error', (err) => console.error('Redis Client Error', err));
            await client.connect();
            Logger.info('Connected to Redis');
            return new RedisClient(client);

        } catch (error) {
            Logger.error('Error creating Redis client:', error);
            throw new Error('Failed to create Redis client', error);
        }

    }


    async setValue(key: string, value: string, expireInSeconds: number, overRide: boolean = true): Promise<void> {
        try {
            await this.client.set(key, value, {
                EX: expireInSeconds,
                NX: overRide,
            });
        } catch (error) {
            Logger.error('Error setting value in Redis:', error);
        }
    }

    async getValue(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error('Error getting value from Redis:', error);
            return null;
        }
    }

    async deleteValue(key: string): Promise<boolean> {
        try {
            await this.client.del(key);
            Logger.info(`Deleted key ${key} from Redis`);
            return true;
        } catch (error) {
            console.error('Error deleting value from Redis:', error);
            return false;
        }
    }

    async getValueKeys(pattern: string): Promise<string[]> {
        try {
            return await this.client.keys(pattern);
        } catch (error) {
            console.error('Error getting keys from Redis:', error);
            return [];
        }
    }
}
