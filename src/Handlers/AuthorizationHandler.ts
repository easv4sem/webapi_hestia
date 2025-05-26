import {AbstractHandler} from "./Handler.js";
import {ERoles} from "../Entities/Enums/ERoles.js";
import Logger from "../Infrastructure/Logger/logger.js";
import {IUser} from "../Entities/Models/IUser.js";
import ITokenProvider from "../InterfaceAdapters/ITokenProvider.js";
import TokenProviderFactory, {EProviders} from "../Infrastructure/TokenService/TokenProviderFactory.js";

export class AuthorizationHandler extends AbstractHandler {
    private readonly _minimumRole: ERoles;
    private _TokenProvider: ITokenProvider;

    constructor(minimumRole: ERoles,) {
        super();
        this._minimumRole = minimumRole;
        this._TokenProvider = TokenProviderFactory.CreateFactory(EProviders.login_token);
    }

    public handle(request: any, response: any): any {
        try {
            const {user} = request.cookies;

            // validating the user token from request cookies.
            if (!user) {
                Logger.warn("Unauthorized access attempt");
                return response.status(401).send("Unauthorized, failed to find user cookies");
            }

            // Verify the token
            const isValid: boolean = this._TokenProvider.verifyToken(user);
            if (!isValid) {
                Logger.warn("Invalid token");
                return response.status(401).send("Unauthorized, invalid token");
            }
            // Extract user information from the token
            const decodedUserToken: IUser = this._TokenProvider.decodeToken(user);



            // Check if user role is defined
            if (!decodedUserToken?.role) {
                Logger.warn("User role is not defined");
                return response.status(400).send("Bad Request: User role is not defined");
            }

            // Check if user role is sufficient
            if (decodedUserToken?.role > this._minimumRole ) {
                Logger.warn(`Access denied for user role: ${decodedUserToken.role}`);
                return response.status(403).send("Forbidden");
            }

            // If all checks pass, call the next handler in the chain
            super.handle(request, response);


        } catch (error) {
            Logger.error("Error in AuthorizationHandler", error);
            return response.status(500).send("Internal server error");

        }
    }

}