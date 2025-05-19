import {EDeviceModes} from "../Enums/EDeviceModes";
import {ISensor} from "./ISensor";

export interface IDevice {
    PIUniqueIdentifier? : string,
    PIDisplayName? : string,
    Ip? : string,
    Port? : number,
    Mac : string,
    Latitude? : number,
    Longitude? : number,
    Version? : string,
    Sensors? : ISensor[],
    Mode? : EDeviceModes,
    LastHeartbeat?: Date
}



