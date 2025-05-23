import {ESensorTypes} from "../../Enums/ESensorTypes";

export interface ISensorData {
    SensorUniqueIdentifier : string;
    PIUniqueIdentifier: string;
    Type: ESensorTypes;
    TimeStamp: string;
    Data: any;
}