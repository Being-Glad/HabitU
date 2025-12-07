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

// Low level
export const scheduleNotification = async (title, body, hour, minute, weekday = null) => {
    const h = Number(hour);
    const m = Number(minute);

    const trigger = weekday !== null
        ? { hour: h, minute: m, weekday, seconds: 0, repeats: true }
        : { hour: h, minute: m, seconds: 0, repeats: true };

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
    } catch (e) {
        console.error('[NotificationService] Failed to cancel all', e);
    }
};

/**
 * NEW: High Level Habit Logic
 */

export const cancelHabitReminders = async (notificationIds) => {
    if (!notificationIds || !Array.isArray(notificationIds)) return;
    for (const id of notificationIds) {
        await cancelNotification(id);
    }
};

export const scheduleHabitReminders = async (habit) => {
    if (!habit.reminders || habit.reminders.length === 0 || habit.archived) {
        return [];
    }

    const newIds = [];
    for (const reminderTime of habit.reminders) {
        const date = new Date(reminderTime);
        if (!isNaN(date.getTime())) {
            const id = await scheduleNotification(
                `Time to ${habit.name}!`,
                habit.description || 'Keep up your streak!',
                date.getHours(),
                date.getMinutes()
            );
            newIds.push(id);
        }
    }
    return newIds;
};

export const updateHabitReminders = async (oldHabit, newHabit) => {
    // 1. Cancel old
    if (oldHabit && oldHabit.notificationIds) {
        await cancelHabitReminders(oldHabit.notificationIds);
    }
    // 2. Schedule new
    const newIds = await scheduleHabitReminders(newHabit);
    return newIds;
};
