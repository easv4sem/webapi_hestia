import {AbstractHandler, IHandler} from "../Handler";

export class CreateAlertChain extends AbstractHandler {

    setNext(handler: IHandler): IHandler {
        return super.setNext(handler);
    }

    handle(request: any, response: any): any {

    }
}