import ITokenProvider from "../InterfaceAdapters/ITokenProvider.js";
import { IUser } from "../Entities/Models/IUser.js";
import { ERoles } from "../Entities/Enums/ERoles.js";
import { IUserRepository } from "../Repository/IUserRepository.js";
import bcrypt from "bcryptjs";
import {UserAlreadyExistsError, UserNotFoundOrPasswordWrongError} from "../Entities/Errors/UserErrors.js";
import Logger from "../Infrastructure/Logger/logger.js";


export interface IUserController {
    registerUser(request: Request, response: Response): Promise<Response>;
    signin(request: Request, response: Response): Promise<Response>;
    signout(request: Request, response: Response): Promise<Response>;
}

/**
 * Controller responsible for handling user registration and authentication.
 */
export class UserController implements IUserController {
    private readonly _TokenProvider: ITokenProvider;
    private readonly _UserContext: IUserRepository;

    // Maximum allowed login attempts before the account gets locked
    private static readonly MAX_LOGIN_ATTEMPTS = 5;

    // Account lock duration in milliseconds (2 minutes)
    private static readonly LOCK_DURATION_MS = 2 * 60 * 1000;

    constructor(TokenProvider: ITokenProvider, UserContext: IUserRepository) {
        this._TokenProvider = TokenProvider;
        this._UserContext = UserContext;
    }

    /**
     * Handles user registration.
     * @param request - HTTP request object containing user data.
     * @param response - HTTP response object.
     * @returns HTTP response with status and user data.
     */
    public async registerUser(request: any, response: any) : Promise<Response> {
        try {
            // Create user object from request body with default role and timestamp
            const user: IUser = {
                ...request.body,
                role: ERoles.USER,
                createdAt: new Date().toISOString(),
                lastActiveAt: new Date().toISOString(),
            };

            // Save user in the database
            await this._UserContext.createUser(user);

            // Remove sensitive fields before sending response
            const sanitizedUser = this.sanitizeUser(user);

            // Generate authentication token for the user
            const userToken = this._TokenProvider.generateToken(sanitizedUser);

            // Set authentication cookie
            this.setUserCookie(response, userToken);

            return response.status(201).json({ message: "Created User", user: sanitizedUser });
        } catch (error) {
            // Handle user already exists error
            if (error instanceof UserAlreadyExistsError) {
                return response.status(409).json({ message: "Username is already in use" });
            }

            // Log any other errors and return a server error response
            Logger.error(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * Handles user login.
     * @param request - HTTP request object containing username and password.
     * @param response - HTTP response object.
     * @returns HTTP response with authentication status and user data.
     */
    public async signin(request: any, response: any) : Promise<Response> {
        try {
            const { username, password } = request.body;

            // Fetch user from database
            const user: IUser | null = await this._UserContext.readUser(username);

            if (!user) {
                return this.invalidLoginAttempt(response, username);
            }

            // check if the account is disabled
            if (this.isAccountDisabled(user)) {
                return response.status(403).json({
                    message: `This account has been disabled. Please contact an admin if you have any questions`
                })
            }

            // Check if the account is locked
            if (this.isAccountLocked(user)) {
                return response.status(403).json({ message: `Account is locked. Try again after ${user.lockedUntil}` });
            }

            // Verify the provided password
            if (!(await bcrypt.compare(password, user.password))) {
                return await this.handleFailedLogin(user, response);
            }

            // Reset login attempts after successful authentication, and updating lastActiveAt.
            await this._UserContext.updateUser(user.username,
                {
                    loginAttempts: 0,
                    lockedUntil: null,
                    lastActiveAt: new Date().toISOString(),
                });

            // Remove sensitive fields before sending response
            const sanitizedUser = this.sanitizeUser(user);

            // Generate authentication token
            const userToken = this._TokenProvider.generateToken(sanitizedUser);

            // Set authentication cookie
            this.setUserCookie(response, userToken);

            Logger.info(`Successful login for user: ${user.username}`);
            return response.status(200).json({ message: "Successfully logged in", user: sanitizedUser });

        } catch (err) {

            if (err instanceof UserNotFoundOrPasswordWrongError) {
                return response.status(404).json({ message: "Username or password is wrong" });
            }


            Logger.error(err);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    }

    public async signout(request: any, response: any): Promise<Response> {
        try {
            const user = request.cookies?.user;
            if (!user) {

                return response.status(403).json({
                    message: "User is not logged in",
                });

            }

            Logger.info(`Successfully logged out user ${this._TokenProvider.decodeToken(user)?.username}`);

            response.clearCookie("user", { httpOnly: true, secure: true, sameSite: "strict" });

            return response.status(200).json({
                message: "User logged out",
            });
        } catch (error) {
            Logger.error(error);
            return response.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * Handles failed login attempts and locks the account if the limit is exceeded.
     * @param user - User object.
     * @param response - HTTP response object.
     * @returns HTTP response indicating failure.
     */
    private async handleFailedLogin(user: IUser, response: any) {
        // Increment login attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        // Lock account if max attempts exceeded
        if (user.loginAttempts >= UserController.MAX_LOGIN_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + UserController.LOCK_DURATION_MS).toISOString();
            Logger.warn(`User ${user.username} has reached max login attempts and is now locked until ${user.lockedUntil}`);
        }

        // Update login attempt details in the database
        await this._UserContext.updateUser(user.username, { loginAttempts: user.loginAttempts, lockedUntil: user.lockedUntil || null });

        return response.status(400).json({ message: "User does not exist or password is incorrect" });
    }

    /**
     * Logs invalid login attempts for non-existing users.
     * @param response - HTTP response object.
     * @param username - The attempted username.
     * @returns HTTP response indicating failure.
     */
    private invalidLoginAttempt(response: any, username: string) {
        Logger.warn(`Invalid login attempt for username: ${username}`);
        return response.status(400).json({ message: "User does not exist or password is incorrect" });
    }

    /**
     * Checks if a user's account is locked.
     * @param user - User object.
     * @returns True if the account is locked, otherwise false.
     */
    private isAccountLocked(user: IUser): boolean {
        return user.lockedUntil ? new Date(user.lockedUntil) > new Date() : false;
    }

    /**
     * Removes sensitive fields before sending user data in responses.
     * @param user - User object.
     * @returns A sanitized user object.
     */
    private sanitizeUser(user: IUser): Partial<IUser> {
        const { password, createdAt, loginAttempts, updatedAt, lastActiveAt, isDisabled,
            lockedUntil, ...safeUser } = user;

        return safeUser;
    }

    /**
     * Sets an authentication cookie for the user.
     * @param response - HTTP response object.
     * @param token - Generated JWT token.
     */
    private setUserCookie(response: any, token: string) {
        response.cookie("user", token, {
            httpOnly: true, // Prevents client-side JavaScript access
            secure: process.env.NODE_ENV === "production", // Enables secure cookies in production
            sameSite: "strict", // Prevents CSRF attacks
        });
    }

    private isAccountDisabled(user: IUser) {
        return user.isDisabled == true || false;
    }
}
