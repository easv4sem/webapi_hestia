
export interface ISensorReadingRepository {


    insertSensorReadings(sensorData: string);

    getReadingsFromDeviceMac(mac: string);

    getReadingsFromSensor(type: string);


}