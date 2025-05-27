import Logger from "../Infrastructure/Logger/logger.js";
import express from "express";
import {ICalculationRequest} from "../Entities/Interfaces/ICalculationRequest.js";
import {isNonEmptyArray, isValidDate, isValidNumber} from "../Utilities/validateData.js";
import {getDataByPieId} from "../Repository/Device/memoryDeviceRepository.js";
import {IDaoRawSensorData, ISensorData} from "../Entities/Interfaces/ISensorData.js";
import {AnalyticsServices} from "../Service/analyticsServices.js";

export class AnalyticsController {

    public async calculateRequest(req: express.Request, res: express.Response) {
        let request = req.body as ICalculationRequest;

        if( this.validateSensorData(req, res) === res.status(400)){
            return res.send
        }

        //TODO: IMPLEMENT ACTUAL REPO HERE!!!
        const dataMemory: ISensorData[] = getDataByPieId(request.PIE_ID);
        //PIE_ID, DAYS_BACK
        //END TODO

        // ✅ Dynamic extraction of sensor data into arrays
        const sensorFields = request.SENSOR; // e.g., ["TEMP", "PPM", ...]
        const sensorValuesMap: Record<string, number[]> = {};
        const requestedCalcFields = request.CALCULATION; // e.g., ["average", "min", "max" ...]

        for (const field of sensorFields) {
            sensorValuesMap[field] = dataMemory
                .map(entry => entry[field.toUpperCase() as keyof IDaoRawSensorData])
                .filter(value => typeof value === "number") as number[];
        }

        const anaService = new AnalyticsServices();

        requestedCalcFields.forEach(field => {
            for (const sensorField of sensorFields) {
                const values = sensorValuesMap[sensorField];
                if (values && values.length > 0) {
                    switch (field.toUpperCase()) {
                        case "SUM":
                            sensorValuesMap[`${sensorField}_sum`] = [anaService.sum(values)];
                            break;
                        case "AVERAGE":
                            sensorValuesMap[`${sensorField}_average`] = [anaService.average(values)];
                            break;
                        case "MIN":
                            sensorValuesMap[`${sensorField}_min`] = [anaService.min(values)];
                            break;
                        case "MAX":
                            sensorValuesMap[`${sensorField}_max`] = [anaService.max(values)];
                            break;
                        case "COUNT":
                            sensorValuesMap[`${sensorField}_count`] = [anaService.count(values)];
                            break;
                        default:
                            Logger.error(`Unknown calculation type: ${field}`);
                    }
                }
            }
        })

        console.table(sensorValuesMap);


        return res.status(200).json(sensorValuesMap);

        // Valid request
    }

    private validateSensorData(req: express.Request, res: express.Response) {
        const request = req.body as ICalculationRequest;

        // Check if PIE_ID is a valid number
        if (!isValidNumber(request.PIE_ID)) {
            Logger.error('Invalid PIE_ID: ', req.body);
            return res.status(400).json({
                error: 'Invalid fields: PIE_ID is required and must be a number.',
            });
        }

        // Check if SENSOR is an array and not empty
        if (!isNonEmptyArray(request.SENSOR)) {
            Logger.error('Invalid SENSOR: ', req.body);
            return res.status(400).json({
                error: 'Invalid fields: SENSOR must be a non-empty array.',
            });
        }

        // Check if CALCULATION is an array and not empty
        if (!isNonEmptyArray(request.CALCULATION)) {
            Logger.error('Invalid CALCULATION: ', req.body);
            return res.status(400).json({
                error: 'Invalid fields: CALCULATION must be a non-empty array.',
            });
        }

        // Check if LOOK_UP_DATE is a valid date
        //Suggested to treat as a unknown, then convert to string, makes it compatiable with Date objects (In theory?)
        if (!isValidDate(request.LOOK_UP_DATE as unknown as string)) {
            Logger.error('Invalid LOOK_UP_DATE: ', req.body);
            return res.status(400).json({
                error: 'Invalid fields: LOOK_UP_DATE is required and must be a valid date.',
            });
        }

        // Check if RANGE_DAYS_BACK is a valid number (positive, can allow zero if needed)
        if (!isValidNumber(request.RANGE_DAYS_BACK, true)) {
            Logger.error('Invalid RANGE_DAYS_BACK: ', req.body);
            return res.status(400).json({
                error: 'Invalid fields: RANGE_DAYS_BACK is required and must be a number.',
            });
        }
    }
}
