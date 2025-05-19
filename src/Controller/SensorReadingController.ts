import { Request, Response } from "express";
import Logger from "../Infrastructure/Logger/logger.js";
import {ISensorReadingRepository} from "../Repository/ISensorReadingRepository";

export class SensorReadingController {

    private readonly sensorReadingRepository: ISensorReadingRepository;

    constructor(sensorReadingRepository: ISensorReadingRepository) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.getSensorData = this.getSensorData.bind(this);
    }

    public async getSensorData(req: Request, res: Response): Promise<Response> {

        try{

            if (!req.body){
                Logger.info(req.body);
                return res.status(400).send("Request body is required");
            }

            const result = await this.sensorReadingRepository.insertSensorReadings(req.body);

            Logger.info(result);

            return res.send(result);

        }catch(err){
            Logger.error("Error getting sensor data", err);
            return res.status(500).send("Error getting sensor data");
        }

    }

}