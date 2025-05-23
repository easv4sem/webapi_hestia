import {EDeviceModes} from "../../Enums/EDeviceModes";

interface DeviceHeartBeat
{
    LastHeartbeat: Date;
    Mode: EDeviceModes;
    PIDisplayName : string;
    PIUniqueIdentifier : string;
}

export const deviceStatus = new Map <string, DeviceHeartBeat>();
