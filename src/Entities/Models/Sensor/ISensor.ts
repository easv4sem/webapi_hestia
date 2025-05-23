import {ESensorTypes} from "../../Enums/ESensorTypes";

export interface ISensor {
    UniqueIdentifier : string;
    DisplayName?: string;
    SerialNumber?: string;
    LastChangeDate?: Date;
    Comment?: string;
    Type?: ESensorTypes;
}