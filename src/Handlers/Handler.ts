/**
 * The Handler interface declares a method for building the chain of handlers.
 * It also declares a method for executing a request.
 * https://refactoring.guru/design-patterns/chain-of-responsibility/typescript/example
 */
import {ISensorReading} from "../Entities/Models/Sensor/ISensorReading.js";
import {AlertContext} from "../Service/AlertContext.js";

export interface IHandler {
    setNext(handler: IHandler): IHandler;
    handle(request : any, response : any): any;
}

export interface IAlertHandler {
    setNext(handler: IAlertHandler): IAlertHandler;
    handle(sensorData: ISensorReading): any;
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

/**
 * AlertHandler is a base class for all alert handlers in the chain of responsibility.
 *
 * - Use `setNext(handler)` to chain multiple handlers.
 * - Override the `handle(sensorData)` method to implement specific logic.
 * - Each handler has access to shared services via `context`,
 *   which provides instances of repositories (e.g., NotificationRepository, DeviceRepository).
 *
 * @see AlertContext (imported from ../Service/AlertContext)
 */
export abstract class AlertHandler implements IAlertHandler{
    protected nextHandler: AlertHandler;
    protected context = AlertContext;

    public setNext(handler : AlertHandler) {
        this.nextHandler = handler;
        return handler;
    }

    public handle(sensorData: ISensorReading): any {
        if (this.nextHandler) {
            return this.nextHandler.handle(sensorData);
        }
        return null;
    }
}


