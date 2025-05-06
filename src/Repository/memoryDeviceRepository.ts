import { ISensorData, IDaoRawSensorData } from "../Entities/Interfaces/ISensorData";

const mockdb: ISensorData[] = [
    {"ID": 1, "PIE_ID": 1, "TEMP": 21.7, "AIR_HUMID": 63.68, "PPM": 520.16, "SOIL_MOISTURE": 88.12, "PRESSURE": 1015.84, "DATE": new Date("2025-04-29T12:56:25")},
    {"ID": 2, "PIE_ID": 1, "TEMP": 23.59, "AIR_HUMID": 57.6, "PPM": 813.41, "SOIL_MOISTURE": 26.3, "PRESSURE": 985.01, "DATE": new Date("2025-04-29T11:56:25")},
    {"ID": 3, "PIE_ID": 1, "TEMP": 21.3, "AIR_HUMID": 38.38, "PPM": 564.43, "SOIL_MOISTURE": 66.53, "PRESSURE": 985.82, "DATE": new Date("2025-04-29T10:56:25")},
    {"ID": 4, "PIE_ID": 1, "TEMP": 26.9, "AIR_HUMID": 52.95, "PPM": 461.33, "SOIL_MOISTURE": 36.98, "PRESSURE": 1001.99, "DATE": new Date("2025-04-29T09:56:25")},
    {"ID": 5, "PIE_ID": 1, "TEMP": 23.54, "AIR_HUMID": 63.71, "PPM": 749.71, "SOIL_MOISTURE": 15.31, "PRESSURE": 992.97, "DATE": new Date("2025-04-29T08:56:25")},
    {"ID": 6, "PIE_ID": 1, "TEMP": 25.34, "AIR_HUMID": 71.4, "PPM": 469.1, "SOIL_MOISTURE": 54.97, "PRESSURE": 992.06, "DATE": new Date("2025-04-29T07:56:25")},
    {"ID": 7, "PIE_ID": 1, "TEMP": 23.65, "AIR_HUMID": 48.88, "PPM": 954.42, "SOIL_MOISTURE": 93.12, "PRESSURE": 1009.8, "DATE": new Date("2025-04-29T06:56:25")},
    {"ID": 8, "PIE_ID": 1, "TEMP": 27.27, "AIR_HUMID": 38.79, "PPM": 295.58, "SOIL_MOISTURE": 84.51, "PRESSURE": 981.13, "DATE": new Date("2025-04-29T05:56:25")},
    {"ID": 9, "PIE_ID": 1, "TEMP": 26.81, "AIR_HUMID": 67.95, "PPM": 832.8, "SOIL_MOISTURE": 13.96, "PRESSURE": 985.62, "DATE": new Date("2025-04-29T04:56:25")},
    {"ID": 10, "PIE_ID": 1, "TEMP": 26.08, "AIR_HUMID": 46.83, "PPM": 423.67, "SOIL_MOISTURE": 59.56, "PRESSURE": 984.68, "DATE": new Date("2025-04-29T03:56:25")},
    {"ID": 1, "PIE_ID": 2, "TEMP": 21.7, "AIR_HUMID": 63.68, "PPM": 520.16, "SOIL_MOISTURE": 88.12, "PRESSURE": 1015.84, "DATE": new Date("2025-04-29T12:56:25")},
    {"ID": 2, "PIE_ID": 2, "TEMP": 23.59, "AIR_HUMID": 57.6, "PPM": 813.41, "SOIL_MOISTURE": 26.3, "PRESSURE": 985.01, "DATE": new Date("2025-04-29T11:56:25")},
    {"ID": 3, "PIE_ID": 2, "TEMP": 21.3, "AIR_HUMID": 38.38, "PPM": 564.43, "SOIL_MOISTURE": 66.53, "PRESSURE": 985.82, "DATE": new Date("2025-04-29T10:56:25")},
    {"ID": 4, "PIE_ID": 2, "TEMP": 26.9, "AIR_HUMID": 52.95, "PPM": 461.33, "SOIL_MOISTURE": 36.98, "PRESSURE": 1001.99, "DATE": new Date("2025-04-29T09:56:25")},
    {"ID": 5, "PIE_ID": 2, "TEMP": 23.54, "AIR_HUMID": 63.71, "PPM": 749.71, "SOIL_MOISTURE": 15.31, "PRESSURE": 992.97, "DATE": new Date("2025-04-29T08:56:25")},
    {"ID": 6, "PIE_ID": 2, "TEMP": 25.34, "AIR_HUMID": 71.4, "PPM": 469.1, "SOIL_MOISTURE": 54.97, "PRESSURE": 992.06, "DATE": new Date("2025-04-29T07:56:25")},
    {"ID": 7, "PIE_ID": 2, "TEMP": 23.65, "AIR_HUMID": 48.88, "PPM": 954.42, "SOIL_MOISTURE": 93.12, "PRESSURE": 1009.8, "DATE": new Date("2025-04-29T06:56:25")},
    {"ID": 8, "PIE_ID": 2, "TEMP": 27.27, "AIR_HUMID": 38.79, "PPM": 295.58, "SOIL_MOISTURE": 84.51, "PRESSURE": 981.13, "DATE": new Date("2025-04-29T05:56:25")},
    {"ID": 9, "PIE_ID": 2, "TEMP": 26.81, "AIR_HUMID": 67.95, "PPM": 832.8, "SOIL_MOISTURE": 13.96, "PRESSURE": 985.62, "DATE": new Date("2025-04-29T04:56:25")},
    {"ID": 10, "PIE_ID": 2, "TEMP": 26.08, "AIR_HUMID": 46.83, "PPM": 423.67, "SOIL_MOISTURE": 59.56, "PRESSURE": 984.68, "DATE": new Date("2025-04-29T03:56:25")}
]

export function getDataByPieId(pieId: number): ISensorData[] {
    return mockdb.filter(sensorData => sensorData.PIE_ID === pieId);
}

export function getSensorDataOnly(): IDaoRawSensorData[] {
    return mockdb
        .map(sensorData => ({
            TEMP: sensorData.TEMP,
            AIR_HUMID: sensorData.AIR_HUMID,
            PPM: sensorData.PPM,
            SOIL_MOISTURE: sensorData.SOIL_MOISTURE,
            PRESSURE: sensorData.PRESSURE
        }));
}