import {EnumAppNotificationType} from "../Enums/EnumAppNotificationType";

export interface INotification {
    UniqueIdentifier: string;
    DateCreated: Date;
    IsRead?: boolean;
    Title?: string;
    SubTitle?: string;
    Type?: EnumAppNotificationType;
}
