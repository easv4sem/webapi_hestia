import { Request, Response } from "express";
import { SensorRepository } from "../Repository/SensorRepository.js";
import Logger from "../Infrastructure/Logger/logger.js";

export class SensorReadingController {

    private sensorRepository: SensorRepository = new SensorRepository();

    // @ts-ignore
    public async getSensorData(req: Request, res: Response): Promise<Response> {

        try{
            if (!req.query?.id){
                return res.status(400).send("Device ID is required");
            }

            if (!req.query?.range){
                return res.status(400).send("Range is required");
            }

            const result = await this.sensorRepository.readAllSensors(req.query.id, req.query.range);

            return res.send(result);
        }catch(err){
            Logger.error("Error getting sensor data", err);
            return res.status(500).send("Error getting sensor data");
        }

    }

}