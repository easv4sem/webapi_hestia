interface INotificationRepository {
    readAllNotifications(): Promise<INotification[]>;
    readNotificationById(id: string): Promise<INotification>;
    readAllUnreadNotifications(): Promise<INotification[]>;
    postNotification(notification: INotification): Promise<INotification>;
    putNotification(notification: INotification): Promise<INotification>;
    deleteNotificationById(id: string): Promise<boolean>;
}

export default INotificationRepository;