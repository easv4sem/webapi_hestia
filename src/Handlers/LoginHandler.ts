import {AbstractHandler} from "./Handler.js";
import {IUserController} from "../Controller/userController.js";

export class LoginHandler extends AbstractHandler {
    private _userController: IUserController;

    constructor(userController : IUserController) {
        super();
        this._userController = userController;

    }

    handle(request: any, response: any): any {
        return this._userController.signin(request, response);
    }
}