/**
 * The Handler interface declares a method for building the chain of handlers.
 * It also declares a method for executing a request.
 * https://refactoring.guru/design-patterns/chain-of-responsibility/typescript/example
 */
import {ISensorData} from "../Entities/Models/Sensor/ISensorData";

export interface IHandler {
    setNext(handler: IHandler): IHandler;
    handle(request : any, response : any): any;
}

export interface IAlertHandler {
    setNext(handler: IAlertHandler): IAlertHandler;
    handle(sensorData: ISensorData): any;
}

/**
 * The default chaining behavior can be implemented inside a base handler class.
 */
export abstract class AbstractHandler implements IHandler
{
    private nextHandler: IHandler;

    public setNext(handler: IHandler): IHandler {
        this.nextHandler = handler;
        // Returning a handler from here will let us link handlers in a
        return handler;
    }

    public handle(request : any, response : any): any {
        if (this.nextHandler) {
            return this.nextHandler.handle(request, response);
        }

        return null;
    }
}

export abstract class AlertHandler implements IAlertHandler{
    private nextHandler: AlertHandler;

    public setNext(handler : AlertHandler) {
        this.nextHandler = handler;
        return handler;
    }

    public handle(sensorData: ISensorData): any {
        if (this.nextHandler) {
            return this.nextHandler.handle(sensorData);
        }
        return null;
    }
}


