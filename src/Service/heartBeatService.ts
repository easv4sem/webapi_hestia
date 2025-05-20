import { deviceStatus } from "../Entities/Models/DeviceStatus";
import { IDevice } from "../Entities/Models/IDevice";
import { IDeviceRepository } from "../Repository/IDeviceRepository";

export default class StartHeartBeatMonitor {
    private _deviceRepository: IDeviceRepository;
    private intervalId?: NodeJS.Timeout;

    getInterval(): number {
        return 5000;
    }

    constructor(deviceRepository: IDeviceRepository) {
        this._deviceRepository = deviceRepository;
    }

    public start() {
        this.intervalId = setInterval(async () => {
            console.log("HeartBeat Monitor: Checking device health...");

            if (deviceStatus.size === 0) {
                try {
                    const devices: IDevice[] = await this._deviceRepository.readAllDevices();

                    devices.forEach((device) => {
                        deviceStatus.set(device.Mac, {
                            LastHeartbeat: device.LastHeartbeat
                        });
                    });

                    console.log(`Loaded ${devices.length} devices into heartbeat map.`);
                } catch (err) {
                    console.error("Failed to load devices for heartbeat check:", err);
                }
            }

            deviceStatus.forEach((status, mac) => {
                const currentTime = new Date();
                const lastHeartbeat = new Date(status.LastHeartbeat);
                const timeDiff = Math.abs(currentTime.getTime() - lastHeartbeat.getTime());
                const diffMinutes = Math.floor((timeDiff / 1000) / 60);

                if (diffMinutes > 5) {
                    console.log(`Device ${mac} is offline. Last heartbeat was ${diffMinutes} minutes ago.`);
                    // Here you can add logic to handle the offline device, e.g., send a notification
                } else {
                    console.log(`Device ${mac} is online. Last heartbeat was ${diffMinutes} minutes ago.`);
                }
            });

        }, this.getInterval());
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            console.log("Heartbeat monitor stopped.");
        }
    }
}
