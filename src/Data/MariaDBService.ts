import mariadb from "mariadb";
import Logger from "../Infrastructure/Logger/logger.js";

export interface IMariaDBService {
    testConnection(): Promise<boolean>;
    query<T = any>(sql: string, params?: any[]): Promise<T>;
}

/**
 * MariaDBService is a class that provides methods to interact with a MariaDB database.
 * It handles connection pooling, executing queries, and managing connections.
 */
export class MariaDBService implements IMariaDBService {
    protected readonly pool: mariadb.Pool;

    constructor() {
        this.pool = this.createPool();
        this.testConnection = this.testConnection.bind(this);
        this.query = this.query.bind(this);
    }

    private createPool(): mariadb.Pool {
        return mariadb.createPool({
            host: process.env.MYSQL_HOST || "mariadb",
            port: Number(process.env.MYSQL_PORT) || 3306,
            user: process.env.MYSQL_USER || "root",
            password: process.env.MYSQL_PASSWORD || "<PASSWORD>",
            database: process.env.MYSQL_DATABASE || "deviceDB",
            connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT) || 50,
            connectTimeout: 10000,
            acquireTimeout: 10000,
        });
    }

    /**
     * Tests the database connection
     * @returns Promise resolving to boolean indicating connection status
     */
    public async testConnection(): Promise<boolean> {
        let conn: mariadb.PoolConnection = null;

        try {
            conn = await this.pool.getConnection();
            const result = await conn.query("SELECT 1 as test");
            return result[0]?.test === 1;
        } catch (error) {
            Logger.error("Database connection test failed:", error);
            return false;
        } finally {
            if (conn) {
                try {
                    await conn.release();
                } catch (releaseError) {
                    Logger.error("Error releasing connection:", releaseError);
                }
            }
        }
    }

    /**
     * Executes a SQL query with optional parameters
     * @param sql The SQL query to execute
     * @param params Optional parameters for the query
     * @returns Promise resolving to query results
     */
    public async query<T = any>(sql: string, params?: any[]): Promise<T> {
        let conn: mariadb.PoolConnection = null;

        try {
            conn = await this.pool.getConnection();
            return await conn.query(sql, params) as T;
        } catch (error) {
            Logger.error(`Error executing query: ${sql}`, error);
            throw error;
        } finally {
            if (conn) {
                try {
                    await conn.release();
                } catch (releaseError) {
                    Logger.error("Error releasing connection:", releaseError);
                }
            }
        }
    }

    /**
     * Executes a transaction with multiple queries
     * @param callback Function that receives a connection and executes queries
     * @returns Promise resolving to the transaction result
     */


    /**
     * Closes the connection pool
     * Should be called when shutting down the application
     */
    public async close(): Promise<void> {
        try {
            await this.pool.end();
            Logger.info("Database connection pool closed");
        } catch (error) {
            Logger.error("Error closing database connection pool:", error);
            throw error;
        }
    }
}