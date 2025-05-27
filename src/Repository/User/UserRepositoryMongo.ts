import {IUser} from "../../Entities/Models/User/IUser.js";
import {IUserRepository} from "./IUserRepository.js";
import {MongoDBClient} from "../../Data/MongoDBClient.js";
import {UserAlreadyExistsError, UserNotFoundOrPasswordWrongError} from "../../Entities/Errors/UserErrors.js";
import Logger from "../../Infrastructure/Logger/logger.js";

export class UserRepositoryMongo implements IUserRepository {
    
    private readonly database: MongoDBClient;
    private readonly collection;

    constructor(database: MongoDBClient, collection: string) {
        this.database = database;
        this.collection = collection;
    }

    async updateUser(username: string, user: Partial<IUser>): Promise<IUser> {
        return await (await this.database.getCollectionAsync<IUser>(this.collection)).findOneAndUpdate(
            {username: username},
            {$set: {...user, updatedAt: new Date().toISOString()}},
            {returnDocument: "after"} // Returns the updated document
        );
    }



    // Create a new user in the database
    async createUser(user: IUser): Promise<IUser> {


        // Check if the user already exists
        const existingUser = await (await this.database.getCollectionAsync<IUser>(this.collection)).findOne({ username: user.username });

        if (existingUser) {
            throw new UserAlreadyExistsError("The username is already in use.");
        }

        // Insert the new user
        await (await this.database.getCollectionAsync<IUser>(this.collection)).insertOne(user);
        return user;

    }

    // Delete a user by username
    async deleteUser(username: string): Promise<boolean> {
        try {
            const result = await (await this.database.getCollectionAsync<IUser>(this.collection)).deleteOne({ username });
            return result.deletedCount > 0;
        } catch (error) {
            Logger.error("Error deleting user:", error);
            throw new Error("Failed to delete user");
        }
    }

    // Retrieve all users from the database
    async readAllUsers(): Promise<IUser[]> {
        try {
            return await (await this.database.getCollectionAsync<IUser>(this.collection)).find().toArray() as IUser[];
        } catch (error) {
            Logger.error("Error reading users:", error);
            return [];
        }
    }

    // Find a user by username
    async readUser(username: string): Promise<IUser | null> {

        let user;
        try {
            user =  await (await this.database.getCollectionAsync<IUser>(this.collection)).findOne({ username });
        } catch (error) {
            console.error("Error reading user:", error);
            return null;
        }

        if (user===null) throw new UserNotFoundOrPasswordWrongError("User not found or the password is incorrect.");
        return user as IUser;


    }
}
