import {IDevice} from "../Entities/Models/IDevice";
import {RedisClient} from "../Data/ReadisClient.js";
import Logger from "../Infrastructure/Logger/logger.js";

export interface IDeviceRepositoryReadies {
    readDeviceAsyncByMac(mac: string): Promise<IDevice | undefined>;
    cashDevice(device: IDevice): Promise<IDevice>;
    delDeviceAsyncByMac(mac: string): Promise<boolean>;
    readAllDevicesAsync(): Promise<IDevice[]>;
    cashAllDevices(devices: IDevice[]): Promise<IDevice[]>;
}

export class DeviceRepositoryReadies implements IDeviceRepositoryReadies {

    private ReadiesClient: RedisClient;
    private static readonly DEVICE_TIME_TO_LIVE_SECONDS = 30; // 30 seconds
    private static readonly DEVICE_KEY_PREFIX = 'device:';
    private static readonly DEVICE_KEY_PREFIX_ALL_DEVICES = 'all:device:';



    constructor() {
        this.initializeRedisClient();
    }

    private async initializeRedisClient(): Promise<void> {
        this.ReadiesClient = await RedisClient.create();
    }


    public async readAllDevicesAsync(): Promise<IDevice[]> {
        try {
            const keys = await this.ReadiesClient.getValueKeys(DeviceRepositoryReadies.DEVICE_KEY_PREFIX_ALL_DEVICES + '*');
            const devices: IDevice[] = [];

            for (const key of keys) {
                const value = await this.ReadiesClient.getValue(key);
                if (value) {
                    devices.push(JSON.parse(value));
                }
            }

            return devices;
        } catch (error) {
            Logger.error('Error getting all devices from Redis:', error);
            return [];
        }
    }

    public async delDeviceAsyncByMac(mac: string): Promise<boolean> {
        try {
            // Delete the device from Redis all devices list
            await this.ReadiesClient.deleteValue(DeviceRepositoryReadies.DEVICE_KEY_PREFIX_ALL_DEVICES + mac);
            // Delete the device from Redis by MAC address
            return await this.ReadiesClient.deleteValue(DeviceRepositoryReadies.DEVICE_KEY_PREFIX + mac);
        } catch (error) {
            Logger.error('Error deleting value from Redis:', error);
            return false;
        }
    }

    public async readDeviceAsyncByMac (mac: string) : Promise<IDevice | undefined> {

        try {

            return await this.ReadiesClient.getValue(DeviceRepositoryReadies.DEVICE_KEY_PREFIX + mac).then((result) => {
                if (result) {
                    return JSON.parse(result);
                } else {
                    return undefined;
                }
            });

        } catch (error) {
            Logger.error('Error getting value from Redis:', error);
            return Promise.resolve(undefined);
        }
    }

    /**
     * Caches the device in Redis with a TTL of 30 seconds.
     * @param device The device to cache.
     * @returns The cached device.
     */
    public async cashAllDevices (devices: IDevice[]) : Promise<IDevice[]> {
        try {

            for (const device of devices) {
                const deviceString = JSON.stringify(device);
                await this.ReadiesClient.setValue(DeviceRepositoryReadies.DEVICE_KEY_PREFIX_ALL_DEVICES + device.Mac, deviceString,  DeviceRepositoryReadies.DEVICE_TIME_TO_LIVE_SECONDS, true);
            }
            Logger.info('All devices cached successfully');

            return devices;
        } catch (error) {
            Logger.error('Error setting value in Redis:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Caches the device in Redis with a TTL of 30 seconds.
     * @param device The device to cache.
     * @returns The cached device.
     */
    public cashDevice (device: IDevice) : Promise<IDevice> {

        try {

            const deviceString = JSON.stringify(device);
            const expireInMS = DeviceRepositoryReadies.DEVICE_TIME_TO_LIVE_SECONDS;

            this.ReadiesClient.setValue(DeviceRepositoryReadies.DEVICE_KEY_PREFIX + device.Mac, deviceString, expireInMS, true).then(() => {
                return device;
            });
        } catch (error) {
            Logger.error('Error setting value in Redis:', error);
            return Promise.reject(error);
        }

    }



}