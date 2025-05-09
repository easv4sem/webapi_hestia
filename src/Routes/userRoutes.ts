import express from 'express';
import {AbstractHandler} from "../Handlers/Handler.js";
import RequestBodyHandler from "../Handlers/RequestBodyHandler.js";
import {userLoginSchema, userRegistrationSchema} from "../Entities/Schemas/userSchemas.js";
import {PasswordHashingHandler} from "../Handlers/PasswordHashingHandler.js";
import ITokenProvider from "../InterfaceAdapters/ITokenProvider.js";
import TokenProviderFactory, {EProviders} from "../Infrastructure/TokenService/TokenProviderFactory.js";
import {UserController} from "../Controller/userController.js";
import {RegistrationHandler} from "../Handlers/RegistrationHandler.js";
import {IUserRepository} from "../Repository/IUserRepository.js";
import {MongoDBClient} from "../Data/MongoDBClient.js";
import {UserRepositoryMongo} from "../Repository/UserRepositoryMongo.js";
import {LoginHandler} from "../Handlers/LoginHandler.js";

const userRouter = express.Router();

const tokenProvider : ITokenProvider = TokenProviderFactory.CreateFactory(EProviders.login_token)
const mongoDBClient = new MongoDBClient(process.env.MONGO_DB_CONNECTION_STRING || "mongodb://mongo:27017/", process.env.MONGO_DB_NAME || "hestia")
const userProvider : IUserRepository = new UserRepositoryMongo(mongoDBClient, process.env.MONGO_DB_USER_COLLECTION || "users");
const userController = new UserController(tokenProvider, userProvider );

const registerBodyValidator : AbstractHandler = new RequestBodyHandler(userRegistrationSchema);
const registrationHandler : AbstractHandler = new RegistrationHandler(userController);
const passwordHarsher : AbstractHandler = new PasswordHashingHandler();

userRouter.post("/register", async (req, res) => {
    registerBodyValidator.setNext(passwordHarsher);
    passwordHarsher.setNext(registrationHandler);
    return await registerBodyValidator.handle(req, res);
})

const loginBodyValidator : AbstractHandler = new RequestBodyHandler(userLoginSchema);
const loginHandler : AbstractHandler = new LoginHandler(userController);
userRouter.post("/login", async (req, res) => {
    loginBodyValidator.setNext(loginHandler);
    return await loginBodyValidator.handle(req, res);
})

userRouter.post("/logout", async (req, res) => {
    return await userController.signout(req, res);
})


export { userRouter };
