import { AlertHandler} from "../Handler.js";
import {ESensorTypes} from "../../Entities/Enums/ESensorTypes.js";
import {BME280} from "../../config/configSensorLimits.js";
import {INotification} from "../../Entities/Models/Notification/INotification.js";
import {EnumAppNotificationType} from "../../Entities/Enums/EnumAppNotificationType.js";
import { randomUUID } from "node:crypto";
import Logger from "../../Infrastructure/Logger/logger.js";
import {IDevice} from "../../Entities/Models/Device/IDevice.js";
import {EDeviceModes} from "../../Entities/Enums/EDeviceModes.js";
import {WithId} from "mongodb";
import {ISensorReading} from "../../Entities/Models/Sensor/ISensorReading.js";

export class Bme280AlertHandler extends AlertHandler {
    maxtemp = BME280.MAXTEMPATURE;
    maxVariation = BME280.MAX_VARIATION_FROM_OLD_VALUE_PERCENT;
    averageOverHours = BME280.AVERAGE_OVER_HOURS;

    public override async handle(sensorData: ISensorReading,): Promise<void> {
        let device: IDevice;

        try {
            device = await this.context.deviceRepository.readDeviceById(sensorData.PIUniqueIdentifier)
        } catch (err) {
            Logger.warn("[BME280Hanlder] Failed to readDeviceById from Sensordata", sensorData, err);
            return;
        }

        if (sensorData.Type === ESensorTypes.bme280) {
            this.processBme280AlertMaxTemp(sensorData, device);
        }

        super.handle(sensorData);
    }

    /**
     * Processes BME280 spike alerts based on the average temperature of the BME280.AVERAGE_OVER_HOURS.
     * This method checks if the current temperature reading deviates significantly
     * from the average temperature of the last BME280.AVERAGE_OVER_HOURS.
     * If the deviation exceeds a predefined threshold,
     * it creates a warning notification and updates the device mode to alert.
     * @param sensorData
     * @param device
     * @private
     */
    private async processBme280AlertSpikeAlert(sensorData: ISensorReading, device: IDevice): Promise<void> {
        let oldReadings: WithId<ISensorReading>[];
        const newReading = sensorData.Data.Temperature;
        const hoursAgo = new Date(sensorData.TimeStamp);
        hoursAgo.setHours(hoursAgo.getHours() - this.averageOverHours);

        try {
            // Fetch old readings from the databaseMac
            oldReadings = await this.context.sensorRepository.getReadingsFromDeviceMac(device.Mac);

            // Filter readings from the last 12 hours
            const recentReadings = oldReadings
                .filter(r => new Date(r.TimeStamp) >= hoursAgo)
                .map(r => r.Data.Temperature);

            if (recentReadings.length === 0) return;

            // Calculate average of past readings
            const sum = recentReadings.reduce((acc, val) => acc + val, 0);
            const avg = sum / recentReadings.length;

            // Calculate percentage change from average
            const percentChange = Math.abs((newReading - avg) / avg) * 100;

            if (percentChange > this.maxVariation) {
                const notification: INotification = {
                    UniqueIdentifier: randomUUID(),
                    Type: EnumAppNotificationType.warning,
                    Title: `Temperature Spike detected: ${device.PIDisplayName} has a ${percentChange.toFixed(2)}% change from ${this.averageOverHours}H average.`,
                    PiUniqeIdentifier: sensorData.PIUniqueIdentifier,
                    DateCreated: new Date(sensorData.TimeStamp),
                    IsRead: false
                };
                await this.context.notificationRepository.postNotification(notification);

                if (device.Mode !== EDeviceModes.Alert) {
                    device.Mode = EDeviceModes.Alert;
                    await this.context.deviceRepository.putDevice(device);
                }
            }
        } catch (err) {
            Logger.warn("[BME280Hanlder] Error in average-based spike", sensorData, err);
        }
    }


    private async processBme280AlertMaxTemp(sensorData: ISensorReading, device: IDevice): Promise<void> {
        const temperature = sensorData.Data.Temperature;
        const currentDevice = device;

        if (temperature > this.maxtemp) {
            try {
                const notifiction: INotification = {
                    UniqueIdentifier: randomUUID(),
                    Type: EnumAppNotificationType.warning,
                    Title: `Device ${device.PIDisplayName} has detected high temperatures, High risk of fire.`,
                    PiUniqeIdentifier: sensorData.PIUniqueIdentifier,
                    DateCreated: new Date(sensorData.TimeStamp),
                    IsRead: false
                };
                this.context.notificationRepository.postNotification(notifiction);
            } catch (err) {
                Logger.warn("[BME280Hanlder] Failed to postNotification", sensorData, err);
            }

            try {
                if (currentDevice && currentDevice.Mode !== EDeviceModes.Alert) {
                    currentDevice.Mode = EDeviceModes.Alert;
                    await this.context.deviceRepository.putDevice(currentDevice);
                }
            } catch (err) {
                Logger.warn("[BME280Hanlder] Failed to update device mode to alert", device, err);
            }
        }
    }
}