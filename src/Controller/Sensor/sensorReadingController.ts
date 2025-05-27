import { Request, Response } from "express";
import Logger from "../../Infrastructure/Logger/logger.js";
import {ISensorReadingRepository} from "../../Repository/Sensor/ISensorReadingRepository.js";
import {ISensorReading} from "../../Entities/Models/Sensor/ISensorReading.js";

export class SensorReadingController {

    private readonly sensorReadingRepository: ISensorReadingRepository;

    constructor(sensorReadingRepository: ISensorReadingRepository) {
        this.sensorReadingRepository = sensorReadingRepository;
        this.getSensorData = this.getSensorData.bind(this);
        this.getReadingsFromDeviceMac = this.getReadingsFromDeviceMac.bind(this);
        this.getReadingsFromSensorType = this.getReadingsFromSensorType.bind(this);
        this.insertSensorReadings = this.insertSensorReadings.bind(this);
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
            Logger.error("Error inserting sensor data", err);
            return res.status(500).send("Error inserting sensor data");
        }

    }

    public async getReadingsFromDeviceMac(req: Request, res: Response): Promise<Response> {

        try {

            if (!req.params?.mac){
                Logger.info(req.params.mac);
                return res.status(400).send("Request body is required");
            }

            const sensorReading: ISensorReading = await this.sensorReadingRepository.getReadingsFromDeviceMac(req.params.mac);
            if (!sensorReading){
                return res.status(400).send("No sensor data");
            }

            return res.status(200).send(sensorReading);

        } catch (err){
            Logger.error("Error getting sensor data from mac", err);
            return res.status(500).send("Error getting sensor data from mac");
        }

    }

    public async getReadingsFromSensorType(req: Request, res: Response): Promise<Response> {

        try {
            if (!req.params?.type){
                Logger.info(req.params.type);
                return res.status(400).send("Type is required");
            }

            const type: number = parseInt(req.params.type);

            const sensorReading: ISensorReading = await this.sensorReadingRepository.getReadingsFromSensor(type);
            if (!sensorReading){
                return res.status(400).send("No sensor data");
            }

            Logger.info("Sensor Readings ", sensorReading);
            return res.status(200).send(sensorReading);

        }catch(err){
            Logger.error("Error getting sensor readings from type", err);
            return res.status(500).send("Error getting sensor readings from type");
        }

    }

    /**
     * Inserts sensor readings into the database.
     * This method expects the request body to contain the sensor readings in a specific format.
     * It will parse the readings and insert them into the database.
     * @param req
     * @param res
     */
    public async insertSensorReadings(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.body) {
                Logger.info(req.body);
                return res.status(400).send("Request body is required");
            }

            const result = await this.sensorReadingRepository.insertSensorReadings(req.body);

            Logger.info(result);


            return res.send(result);
        } catch (err) {
            Logger.error("[SensorReadingController] Error inserting sensor readings", err);
            return res.status(500).send("Error inserting sensor readings");
        }
    }

}