import { AlertHandler} from "../Handler";
import {ISensorData} from "../../Entities/Models/Sensor/ISensorData";
import {ESensorTypes} from "../../Entities/Enums/ESensorTypes";
import {BME280} from "../../config/configSensorLimits";
import {INotification} from "../../Entities/Models/Notification/INotification";
import {EnumAppNotificationType} from "../../Entities/Enums/EnumAppNotificationType";
import { randomUUID } from "node:crypto";

export class Bme280AlertHandler extends AlertHandler {
    maxtemp = BME280.MAXTEMPATURE;

    public override handle(sensorData: ISensorData, ): void {
        if (sensorData.Type === ESensorTypes.bme280) {
            const temperature = sensorData.Data.Temperature;

            if (temperature > this.maxtemp) {
                const notifiction: INotification = {
                    UniqueIdentifier: randomUUID(),
                    Type: EnumAppNotificationType.warning,
                    Title: `Device ${sensorData.PIUniqueIdentifier} has detected high tempatures, High risk of fire.`,
                    PiUniqeIdentifier: sensorData.PIUniqueIdentifier,
                    DateCreated: new Date(sensorData.TimeStamp),
                    IsRead: false
                }
            }


        }
        super.handle(sensorData);
    }
}