export const DEFAULT_NOTIFICATION_SETTINGS = {
    workNotification: true,
    breakNotification: true,
    sound: true,
    autoStart: false
};
export function getNotificationSettings() {
    if (typeof window === 'undefined')
        return DEFAULT_NOTIFICATION_SETTINGS;
    const raw = localStorage.getItem('notificationSettings');
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATION_SETTINGS;
}
export function saveNotificationSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
}
