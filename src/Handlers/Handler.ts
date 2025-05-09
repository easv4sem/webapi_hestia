/**
 * The Handler interface declares a method for building the chain of handlers.
 * It also declares a method for executing a request.
 * https://refactoring.guru/design-patterns/chain-of-responsibility/typescript/example
 */

export interface IHandler {
    setNext(handler: IHandler): IHandler;
    handle(request : any, response : any): any;
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


