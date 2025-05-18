interface INotification {
    UniqueIdentifier: string;
    IsRead?: boolean;
    Title?: string;
    SubTitle?: string;
    Type?: EnumAppNotificationType;
}
