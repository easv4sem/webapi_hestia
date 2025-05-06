import {IDeviceRepository} from "./IDeviceRepository.js";
import {IDevice} from "../Entities/Interfaces/IDevice";
import {IMariaDBService} from "../Data/MariaDBService";

export class DeviceRepositoryMariaDB implements IDeviceRepository {

    protected readonly database : IMariaDBService

    constructor(databseService: IMariaDBService) {
        this.database = databseService;
    }

    read(id: number, range: number) {
        throw new Error("Method not implemented.");
    }

    async readAllDevices() : Promise<IDevice[]>  {
        return await this.database.query<IDevice[]>("SELECT * FROM deviceDB.devices")
    }

    async readDeviceById(id: number) : Promise<IDevice> {
        return await this.database.query<IDevice>("SELECT * FROM deviceDB.devices WHERE PIE_ID = ?", [id])
    }

    async readDeviceByMacAddress(macAddress: string) : Promise<IDevice> {
        return await this.database.query<IDevice>("SELECT * FROM deviceDB.devices WHERE MAC = ?", [macAddress])
    }

}