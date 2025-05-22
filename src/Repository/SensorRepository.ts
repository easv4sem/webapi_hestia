import { ISensorReadingRepository } from "./ISensorReadingRepository";
import * as QueryString from "node:querystring";
import {IMariaDBService, MariaDBService} from "../Data/MariaDBService.js";


export class SensorRepository implements ISensorReadingRepository {

    private readonly databaseService : IMariaDBService = new MariaDBService();

    // @ts-ignore
    async insertSensorReadings(id: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[], range: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[]) {

        const todaysDate = new Date();
        const todaysDateString: string = todaysDate.toISOString().split("T")[0];


        const dateRange = new Date();
        dateRange.setDate(todaysDate.getDate() - (<number><unknown>range));
        let dateRangeString = dateRange.toISOString().split("T")[0];

        const query = "SELECT * FROM device_data WHERE PIE_ID = ? AND DATE <= ? AND DATE >= ?";

        return await this.databaseService.query(query, [id, todaysDateString, dateRangeString]);
    }

}