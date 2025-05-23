import { z, ZodError } from 'zod';
import { AbstractHandler } from "../Handler";

export default class RequestBodyHandler extends AbstractHandler {
    private readonly schema: z.ZodObject<any, any>;

    constructor(schema: z.ZodObject<any, any>) {
        super();
        this.schema = schema;
    }

    handle(request: any, response: any): any {

        try {
            this.schema.parse(request.body);
            return super.handle(request, response);

        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: any) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`,
                }))

                response.status(400).json({error: 'Invalid data', details: errorMessages});

            } else {
                response.status(500).json({error: 'Internal Server Error'});
            }
        }
    }
}