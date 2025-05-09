import ITokenProvider from "../../InterfaceAdapters/ITokenProvider.js";
import {BearerTokenSigningService} from "./BearerTokenSigningService.js";

export enum EProviders {
    "login_token",
}


export default class TokenProviderFactory {

    private static readonly loginTokenConfiguration = {
        "secretKey": process.env.JWT_SECRET_KEY || "super_secret_key",
        "issuer": process.env.JWT_ISSUER || "my_issuer",
        "audience": process.env.JWT_AUDIENCE || "my_audience",
        "expiresIn": 3600,

    }

    public static CreateFactory(provider : EProviders ) : ITokenProvider {

        if (provider == EProviders.login_token) {
            return new BearerTokenSigningService(this.loginTokenConfiguration.secretKey, this.loginTokenConfiguration.expiresIn,
                "HS256", this.loginTokenConfiguration.issuer, this.loginTokenConfiguration.audience)
        }

        // fail safe...
        throw new Error(`Provider ${provider} is not supported.`);

    }

}