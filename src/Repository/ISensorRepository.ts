import {ISensor} from "../Entities/Models/ISensor";

export interface ISensorRepository {
    getAllSensors(): Promise<ISensor[]>;
    getSensorById(sensorId: string): Promise<ISensor>;
    getSensorBySerialNumber(serialNumber: string): Promise<ISensor>;
    postSensor(sensor: ISensor): Promise<ISensor>;
    putSensor(sensor: ISensor): Promise<ISensor>;
    deleteSensorById(sensorId: string): Promise<boolean>;
}