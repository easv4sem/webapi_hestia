import Logger from "../Infrastructure/Logger/logger.js";
import { AbstractHandler } from "./Handler.js";
import bcrypt from 'bcryptjs';

export class PasswordHashingHandler extends AbstractHandler {

    async handle(request: any, response: any): Promise<any> {
        const saltRounds: number = 4;

        // Validate if the password exists in the request body
        if (!request.body.password) {
            return response.status(400).send({ message: "Password attribute is required" });
        }

        try {
            // Hash the password
            Logger.info("started hashing password");
            request.body.password = await bcrypt.hash(request.body.password, saltRounds);
            Logger.info("finished hashing password");

            super.handle(request, response);

        } catch (err) {
            // Handle any errors
            Logger.error(err);
            return response.status(400).send({ message: "An error occurred, if this persist please contact an administrator" });

        }
    }
}
