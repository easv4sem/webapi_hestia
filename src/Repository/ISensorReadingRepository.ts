import * as QueryString from "node:querystring";

export interface ISensorReadingRepository {

    // @ts-ignore
    readAllSensors(id: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[], range: string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[]);


}