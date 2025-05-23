import {AbstractHandler} from "../Handler";
import ITokenProvider from "../../InterfaceAdapters/ITokenProvider";
import {ERoles} from "../../Entities/Enums/ERoles";
import Logger from "../../Infrastructure/Logger/logger";

export class AuthenticationHandler extends AbstractHandler {
    private TokenProvider: ITokenProvider;

    constructor(TokenProvider : ITokenProvider, requiredRole : ERoles) {
        super();
        this.TokenProvider = TokenProvider;

    }

    public handle(request: any, response: any): any {

        // fetching the user token from request header.
        try {
            const { user } = request.cookies;

            if (!user) {
                return response.status(401).json({"message": "Authentication failed, Login first."});
            }

            // ensure the validity of the token.
            const isValid : boolean = this.TokenProvider.verifyToken(user)


            if (isValid){
                return response.status(201).json({"message": "Authentication successful."});
            }

        } catch (err) {
            Logger.error(err);
            return response.status(401).json({"error": "Unauthorized"});
        }






        return response.status(204).json({message: "user is not authenticated. JWT is invalid."});
    }
}
