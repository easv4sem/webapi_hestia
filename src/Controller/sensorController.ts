import {ISensor} from "../Entities/Models/ISensor";
import {ISensorRepository} from "../Repository/ISensorRepository";
import Logger from "../Infrastructure/Logger/logger.js";

export interface ISensorController {
    getAllSensors(res, req): Promise<Response>;
    getSensorById(res, req): Promise<Response>;
    getSensorBySerialNumber(res, req): Promise<Response>;
    postSensor(res, req): Promise<Response>;
    putSensor(res, req): Promise<Response>;
    deleteSensorById(res, req): Promise<Response>;
}


export class SensorController implements ISensorController {

    private readonly sensorRepository: ISensorRepository;

    constructor(sensorRepository: ISensorRepository) {
        this.sensorRepository = sensorRepository;

    }

    async getAllSensors(res: any, req: any): Promise<Response> {

        try {

            const sensors = await this.sensorRepository.getAllSensors();
            if (!sensors || sensors === undefined ) {
                return res.status(404).send("No sensors found");
            }

            return res.status(200).send(sensors);

        } catch (error) {
            Logger.error("Error getting all sensors: ", error);
            return res.status(500).send("Internal server error");
        }



    }
    async getSensorById(res: any, req: any): Promise<Response> {

        try {

            if (!req.params?.id) {
                return res.status(400).send("Sensor id is required as a parameter");
            }

            const sensor: ISensor = await this.sensorRepository.getSensorById(req.params.id);
            if (!sensor) {
                return res.status(404).send("Sensor not found");
            }

            return res.status(200).send(sensor);

        } catch (error) {
            Logger.error("Error getting sensor by id: ", error);
            return res.status(500).send("Internal server error");
        }

    }
    async getSensorBySerialNumber(res: any, req: any): Promise<Response> {
        try {

            if (!req.params?.serial) {
                return res.status(400).send("Sensor serial is required as a parameter");
            }

            const sensor: ISensor = await this.sensorRepository.getSensorById(req.params.serial);
            if (!sensor) {
                return res.status(404).send("Sensor not found");
            }

            return res.status(200).send(sensor);

        } catch (error) {
            Logger.error("Error getting sensor by serial: ", error);
            return res.status(500).send("Internal server error");
        }
    }
    async postSensor(res: any, req: any): Promise<Response> {

        try {

            if (!req.body?.sensor) {
                return res.status(400).send("Sensor data is required");
            }

            // check if the sensor already exists
            const existingSensor: ISensor = await this.sensorRepository.getSensorBySerialNumber(req.body.sensor.serial);

            if (existingSensor) {
                return res.status(409).send("Sensor already exists");
            }

            const sensor: ISensor = await this.sensorRepository.postSensor(req.body);
            return res.status(201).send(sensor);

        } catch (error) {
            Logger.error("Error inserting sensor: ", error);
            return res.status(500).send("Internal server error");
        }

    }
    async putSensor(res: any, req: any): Promise<Response> {
        try {

            if (!req.body?.sensor) {
                return res.status(400).send("Sensor data is required");
            }

            // check if the sensor already exists
            const existingSensor: ISensor = await this.sensorRepository.getSensorById(req.body.sensor.id);

            if (!existingSensor) {
                return res.status(404).send("Sensor not found");
            }

            const sensor: ISensor = await this.sensorRepository.putSensor(req.body);
            return res.status(200).send(sensor);

        } catch (error) {
            Logger.error("Error updating sensor: ", error);
            return res.status(500).send("Internal server error");
        }
    }
    async deleteSensorById(res: any, req: any): Promise<Response> {
        try {

            if (!req.params?.id) {
                return res.status(400).send("Sensor id is required as a parameter");
            }

            const sensor: ISensor = await this.sensorRepository.getSensorById(req.params.id);
            if (!sensor) {
                return res.status(404).send("Sensor not found");
            }

            const result = await this.sensorRepository.deleteSensorById(req.params.id);
            if (!result) {
                return res.status(500).send("Failed to delete sensor");
            }

            return res.status(200).send("Sensor deleted successfully");

        } catch (error) {
            Logger.error("Error deleting sensor: ", error);
            return res.status(500).send("Internal server error");
        }
    }


}