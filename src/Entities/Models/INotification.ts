import {EnumAppNotificationType} from "../Enums/EnumAppNotificationType";

export interface INotification {
    UniqueIdentifier: string;
    DateCreated: Date;
    PiUniqeIdentifier?: string;
    IsRead?: boolean;
    Title?: string;
    SubTitle?: string;
    Type?: EnumAppNotificationType;
}
