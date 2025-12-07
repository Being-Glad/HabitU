import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const registerForPushNotificationsAsync = async () => {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        // alert('Failed to get push token for push notification!');
        return;
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return finalStatus;
};

export const scheduleNotification = async (title, body, hour, minute, weekday = null) => {
    const h = Number(hour);
    const m = Number(minute);

    console.log(`[NotificationService] Scheduling '${title}' for ${h}:${m} (Weekday: ${weekday})`);

    // Explicitly using CalendarTriggerInput structure.
    // Note: Android might ignore 'seconds' for daily triggers, leading to minute-granularity matches.
    const trigger = weekday !== null
        ? { hour: h, minute: m, weekday, seconds: 0, repeats: true }
        : { hour: h, minute: m, seconds: 0, repeats: true };

    console.log(`[NotificationService] Trigger:`, JSON.stringify(trigger));

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            channelId: 'default',
        },
        trigger,
    });

    console.log(`[NotificationService] Scheduled with ID: ${identifier}`);

    return identifier;
};

export const cancelNotification = async (identifier) => {
    if (!identifier) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
        // Ignore cancellation errors
    }
};

export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('[NotificationService] Cancelled all notifications');
    } catch (e) {
        console.error('[NotificationService] Failed to cancel all', e);
    }
};
