import {CustomError} from "ts-custom-error";

class UserAlreadyExistsError extends CustomError {
    public constructor(
        message?: string,
    ) {
        super(message)
    }
}

class UserNotFoundOrPasswordWrongError extends CustomError {
    public constructor(
        message?: string,
    ) {
        super(message)
    }
}

export { UserAlreadyExistsError, UserNotFoundOrPasswordWrongError };