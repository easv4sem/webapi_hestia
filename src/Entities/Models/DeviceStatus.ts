interface DeviceHeartBeat
{
    LastHeartbeat: Date;
}

export const deviceStatus = new Map <string, DeviceHeartBeat>();
