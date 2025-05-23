import {ISensor} from "../../Entities/Models/Sensor/ISensor";
import {ISensorRepository} from "../../Repository/Sensor/ISensorRepository";
import Logger from "../../Infrastructure/Logger/logger";

export interface ISensorController {
    getAllSensors(req : any, res : any): Promise<Response>;
    getSensorById(req : any, res : any): Promise<Response>;
    getSensorBySerialNumber(req : any, res : any): Promise<Response>;
    postSensor(req : any, res : any): Promise<Response>;
    putSensor(req : any, res : any): Promise<Response>;
    deleteSensorById(req : any, res : any): Promise<Response>;
}


export class SensorController implements ISensorController {

    private readonly sensorRepository: ISensorRepository;

    constructor(sensorRepository: ISensorRepository) {
        this.sensorRepository = sensorRepository;
        this.getAllSensors = this.getAllSensors.bind(this);
        this.getSensorById = this.getSensorById.bind(this);
        this.getSensorBySerialNumber = this.getSensorBySerialNumber.bind(this);
        this.postSensor = this.postSensor.bind(this);
        this.putSensor = this.putSensor.bind(this);
        this.deleteSensorById = this.deleteSensorById.bind(this);
    }

    async getAllSensors(req: any, res: any): Promise<Response> {

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
    async getSensorById(req: any, res: any): Promise<Response> {

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
    async getSensorBySerialNumber(req: any, res: any): Promise<Response> {
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
    async postSensor(req: any, res: any): Promise<Response> {

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
    async putSensor(req: any, res: any): Promise<Response> {
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
    async deleteSensorById(req: any, res: any): Promise<Response> {
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