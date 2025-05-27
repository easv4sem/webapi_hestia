import {ESensorTypes} from "../../Enums/ESensorTypes.js";

export interface ISensorReading {
    SensorUniqueIdentifier : string;
    PIUniqueIdentifier?: string;
    Mac: string;
    Type: ESensorTypes;
    TimeStamp: string;
    Data: any;
}