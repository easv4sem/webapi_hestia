import { IUser } from "../Entities/Models/IUser";


export interface IUserRepository {
    createUser(user : IUser): Promise<IUser>;
    deleteUser(username : string): Promise<boolean>;
    updateUser(username : string, user : Partial<IUser>): Promise<IUser | null>;
    readAllUsers(): Promise<IUser[]>;
    readUser(username: string): Promise<IUser | null>;
}



