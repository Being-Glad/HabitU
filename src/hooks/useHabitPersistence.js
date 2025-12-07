import { useState, useEffect } from 'react';
import StorageService from '../services/StorageService';
import * as NotificationService from '../services/NotificationService';
import { AppState } from 'react-native';

export const useHabitPersistence = () => {
    const [habits, setHabits] = useState([]);
    const [settings, setSettings] = useState({});
    const [userProfile, setUserProfile] = useState({});
    const [unlockedThemes, setUnlockedThemes] = useState({});
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const [loadedHabits, loadedSettings, loadedProfile, loadedThemes] = await Promise.all([
            StorageService.getHabits(),
            StorageService.getSettings(),
            StorageService.getUserProfile(),
            StorageService.getUnlockedThemes()
        ]);

        setHabits(loadedHabits);
        setSettings(loadedSettings);
        setUserProfile(loadedProfile);
        setUnlockedThemes(loadedThemes);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        NotificationService.registerForPushNotificationsAsync();

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                loadData();
            }
        });

        return () => subscription.remove();
    }, []);

    // --- Actions ---

    const addHabit = async (habitData) => {
        const habitId = Date.now().toString();
        const newHabit = {
            id: habitId,
            ...habitData,
            notificationIds: [],
            completedDates: {},
            streak: 0,
            archived: false,
            createdAt: new Date().toISOString(),
        };

        // Schedule Notifications
        const notificationIds = await NotificationService.scheduleHabitReminders(newHabit);
        const habitWithNotifs = { ...newHabit, notificationIds };

        const newHabits = [...habits, habitWithNotifs];
        setHabits(newHabits);
        await StorageService.saveHabits(newHabits);
    };

    const updateHabit = async (habitId, updates) => {
        const oldHabit = habits.find(h => h.id === habitId);
        if (!oldHabit) return;

        let notificationIds = oldHabit.notificationIds;

        // If reminders changed, update notifications
        if (updates.reminders) {
            const tempHabit = { ...oldHabit, ...updates };
            notificationIds = await NotificationService.updateHabitReminders(oldHabit, tempHabit);
        }

        const updatedHabit = { ...oldHabit, ...updates, notificationIds };
        const newHabits = habits.map(h => h.id === habitId ? updatedHabit : h);

        setHabits(newHabits);
        await StorageService.saveHabits(newHabits);
    };

    const deleteHabit = async (habitId) => {
        const habitToDelete = habits.find(h => h.id === habitId);
        if (habitToDelete) {
            await NotificationService.cancelHabitReminders(habitToDelete.notificationIds);
        }

        const newHabits = habits.filter(h => h.id !== habitId);
        setHabits(newHabits);
        await StorageService.saveHabits(newHabits);
    };

    // Toggle/Log uses updateHabit implicitly or explicit state update?
    // Usually logHabitProgress changes `completedDates`.
    // We should probably expose a specialized method for efficiency, 
    // but updating state is fast enough.

    const setHabitsDirectly = async (newHabits) => {
        setHabits(newHabits);
        await StorageService.saveHabits(newHabits);
    };

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        await StorageService.saveSettings(updated);
    };

    const updateUserProfile = async (newProfile) => {
        const updated = { ...userProfile, ...newProfile };
        setUserProfile(updated);
        await StorageService.saveUserProfile(updated);
    };

    const unlockTheme = async (themeId) => {
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        const expiry = Date.now() + threeDays;
        const updated = { ...unlockedThemes, [themeId]: expiry };
        setUnlockedThemes(updated);
        await StorageService.saveUnlockedThemes(updated);
    };

    // Helper for specialized state updates (like logging progress) without triggering full notification checks
    const updateHabitStateOnly = async (habitId, newState) => {
        const newHabits = habits.map(h => h.id === habitId ? { ...h, ...newState } : h);
        setHabits(newHabits);
        await StorageService.saveHabits(newHabits);
    }

    // Reset App
    const resetApp = async () => {
        await NotificationService.cancelAllNotifications();
        await StorageService.clearAll();
        setHabits([]);
        // Reload defaults
        const defaults = await StorageService.getSettings(); // will return default object
        setSettings(defaults);
    }

    return {
        habits,
        settings,
        userProfile,
        unlockedThemes,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        setHabitsDirectly,
        updateHabitStateOnly,
        updateSettings,
        updateUserProfile,
        unlockTheme,
        resetApp
    };
};
