import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, subDays } from 'date-fns';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { registerForPushNotificationsAsync, scheduleNotification, cancelNotification, cancelAllNotifications } from '../services/NotificationService';
import { useAuth } from './AuthContext';

import { HabitWidget } from '../widget/HabitWidget';
import { HabitListWidget } from '../widget/HabitListWidget';
import { HabitGridWidget } from '../widget/HabitGridWidget';
import { HabitWeekWidget } from '../widget/HabitWeekWidget';
import { HabitStreakWidget } from '../widget/HabitStreakWidget';

const HabitContext = createContext();

export const useHabits = () => useContext(HabitContext);

export const CATEGORIES = ['Health', 'Fitness', 'Mindfulness', 'Work', 'Learning', 'Social', 'Finance', 'Other'];

export const HabitProvider = ({ children }) => {
    const { user } = useAuth();
    const [habits, setHabits] = useState([]);

    // Sync when user logs in
    useEffect(() => {
        if (user && !user.isGuest) {
            syncWithCloud(habits);
        }
    }, [user]);

    // ... (rest of useEffects)
    const [settings, setSettings] = useState({
        weekStart: 'Monday',
        highlightCurrentDay: true,
        showStreakCount: true,
        showStreakGoal: true,
        showMonthLabels: true,
        showDayLabels: true,
        theme: 'dark',
        accentColor: '#2dd4bf',
        cardStyle: 'heatmap',
        viewMode: 'list', // 'list' | 'grid' | 'streak'
    });
    const [unlockedThemes, setUnlockedThemes] = useState({}); // { themeId: expiryTimestamp }
    const [userProfile, setUserProfile] = useState({}); // { weight: 70, unit: 'kg', activityLevel: 'active' }
    const [loading, setLoading] = useState(true);

    const [notificationIds, setNotificationIds] = useState({}); // { themeId: notificationIdentifier }

    // Persist notification IDs? Maybe not strictly necessary if we just overwrite, 
    // but good practice to cancel old ones to avoid duplicates if user toggles rapidly.

    const unlockTheme = async (themeId, themeName = 'Item') => {
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        const expiry = Date.now() + threeDays;
        setUnlockedThemes(prev => ({ ...prev, [themeId]: expiry }));

        console.log(`[HabitContext] Unlocking ${themeId} (${themeName}) until ${new Date(expiry).toISOString()}`);
    };

    const isThemeUnlocked = (themeId) => {
        if (!['coffee', 'midnight', 'slate'].includes(themeId)) return true; // Default themes are always unlocked
        const expiry = unlockedThemes[themeId];
        return expiry && expiry > Date.now();
    };

    const isInsightsUnlocked = () => {
        const expiry = unlockedThemes['insights'];
        return expiry && expiry > Date.now();
    };

    const isHabitDue = (habit, date) => {
        if (!habit.frequency) return true; // Default to daily if missing

        const { type, days, interval, startDate } = habit.frequency;

        if (type === 'daily') return true;

        if (type === 'weekly') {
            // If specific days are selected, check them.
            if (days && days.length > 0) {
                const dayName = format(date, 'EEE'); // 'Mon', 'Tue', etc.
                return days.includes(dayName);
            }
            // If no days selected (Flexible Weekly), it's available every day
            return true;
        }

        if (type === 'interval') {
            if (!startDate) return true; // Fallback
            const start = new Date(startDate);
            // Reset time components for accurate day diff
            start.setHours(0, 0, 0, 0);
            const current = new Date(date);
            current.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(current - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays % interval === 0;
        }

        return true;
    };

    const calculateHabitStrength = (habit) => {
        const today = new Date();
        let score = 0;
        let totalWeight = 0;

        // Analyze last 30 days
        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            // Skip if habit wasn't due this day
            if (!isHabitDue(habit, date)) continue;

            const weight = i < 7 ? 1.5 : 1; // Recent days count more
            totalWeight += weight;

            const isCompleted = habit.type === 'numeric'
                ? (habit.completedDates?.[dateStr] || 0) >= habit.goal
                : (habit.completedDates?.[dateStr] || habit.logs?.[dateStr]);

            if (isCompleted) {
                score += weight;
            }
        }

        return totalWeight === 0 ? 0 : Math.round((score / totalWeight) * 100);
    };

    const calculateStreak = (habit) => {
        let streak = 0;
        let d = new Date();
        const dates = habit.completedDates || habit.logs || {};

        // 1. Check if the streak is currently active (i.e., completed today OR completed the last due day)
        // If today is NOT due and NOT completed, we shouldn't reset streak yet, unless we missed the *previous* due day.
        // Actually, simpler approach:
        // Iterate backwards.
        // If Done: Streak++
        // If Not Done:
        //    If Due: Break
        //    If Not Due: Continue (Bridge the gap)

        // However, we need to find the "start" point. 
        // If today is not done and not due, start from yesterday.
        // If today is not done but IS due, streak is 0 (unless we allow "grace" period of "today is not over yet").
        // Usually, "Current Streak" includes today if done, or is kept from yesterday.

        // Let's start from Today.
        // If Today is Done -> Count it, move to yesterday.
        // If Today is Not Done ->
        //    If Today is Due -> Streak is 0? Or do we show yesterday's streak until midnight?
        //    Standard: Show yesterday's streak if today is pending.
        //    So, if !Done && Due -> Don't count today, check yesterday.
        //    If !Done && !Due -> Don't count today, check yesterday.

        // So, we start checking from Today. If !Done, we just skip it (don't increment, don't break) and check yesterday.
        // BUT, if Today is Due and !Done, and we check yesterday and it's a streak of 5...
        // Does the user see "5 day streak"? Yes, until they miss it (tomorrow).

        // Refined Loop:
        // Start d = Today.
        // Loop while true:
        //   isDone = check(d)
        //   isDue = checkDue(d)
        //   
        //   if isDone:
        //      streak++
        //   else:
        //      if isDue:
        //         // If it's Today, we don't break yet (pending).
        //         // If it's past day, Break.
        //         if (isSameDay(d, new Date())) {
        //             // Today pending, ignore.
        //         } else {
        //             break; // Missed a due day!
        //         }
        //      else:
        //         // Not Due, Not Done. Bridge gap.
        //         // Continue.

        //   d = prevDay(d)

        // Wait, if I have a streak of Mon(Done), Tue(Skip), Wed(Pending/Due).
        // Check Wed: !Done, Due(Today) -> Continue.
        // Check Tue: !Done, !Due -> Continue.
        // Check Mon: Done -> Streak=1.
        // Result: 1. Correct.

        // What if Mon(Done), Tue(Skip), Wed(Done).
        // Check Wed: Done -> Streak=1.
        // Check Tue: !Done, !Due -> Continue.
        // Check Mon: Done -> Streak=2.
        // Result: 2. Correct.

        // What if Mon(Done), Tue(Done-Extra), Wed(Done).
        // Check Wed: Done -> Streak=1.
        // Check Tue: Done -> Streak=2.
        // Check Mon: Done -> Streak=3.
        // Result: 3. Correct.

        while (true) {
            const dateStr = format(d, 'yyyy-MM-dd');
            const isDone = dates[dateStr];
            const isDue = isHabitDue(habit, d);
            const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            if (isDone) {
                streak++;
            } else {
                if (isDue) {
                    if (!isToday) {
                        break; // Missed a past due day
                    }
                    // If today is due but not done, we just don't count it, but don't break streak from yesterday.
                }
                // If not due and not done, just continue (bridge).
            }

            // Safety break for infinite loop (e.g. going back years)
            // Or just stop if we go back too far (e.g. before creation?)
            // For performance, maybe limit to 365 days or check creation date.
            // Let's just limit to 365 for now to be safe.
            if (streak > 365 * 2) break; // 2 years

            // Optimization: If we've gone back 30 days with NO streak and NO due days? 
            // No, we just decrement.
            d.setDate(d.getDate() - 1);

            // Removed createdAt check to allow backfilling history
            // if (new Date(habit.createdAt) > d) {
            //    break;
            // }
        }
        return streak;
    };

    const getGlobalStats = () => {
        const activeHabits = habits.filter(h => !h.archived);
        if (activeHabits.length === 0) return { score: 0, perfectDays: [], topHabits: [] };

        // 1. Overall Score
        const totalStrength = activeHabits.reduce((sum, h) => sum + calculateHabitStrength(h), 0);
        const overallScore = Math.round(totalStrength / activeHabits.length);

        // 2. Perfect Days (Last 30 days)
        const perfectDays = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const dueHabits = activeHabits.filter(h => isHabitDue(h, date));
            if (dueHabits.length === 0) continue;

            const allDone = dueHabits.every(h => {
                return h.type === 'numeric'
                    ? (h.completedDates?.[dateStr] || 0) >= h.goal
                    : (h.completedDates?.[dateStr] || h.logs?.[dateStr]);
            });

            if (allDone) perfectDays.push(dateStr);
        }

        // 3. Top Habits
        const topHabits = [...activeHabits]
            .sort((a, b) => calculateHabitStrength(b) - calculateHabitStrength(a))
            .slice(0, 3)
            .map(h => ({ ...h, streak: calculateStreak(h) })); // Calculate streak dynamically

        return { score: overallScore, perfectDays, topHabits };
    };



    useEffect(() => {
        loadData();
        registerForPushNotificationsAsync();

        // Reload data when app comes to foreground
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                loadData();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Self-healing: Ensure notifications match state on load (Fixes ghost notifications)
    useEffect(() => {
        if (!loading && habits.length > 0) {
            rescheduleAllHabits();
        }
    }, [loading]);

    const rescheduleAllHabits = async (habitsToSync = null) => {
        console.log('[HabitContext] Rescheduling all notifications (Nuclear Sync)...');
        await cancelAllNotifications(); // Wipes the slate clean

        // Use provided list or current state
        const habitsToProcess = habitsToSync || habits;
        const updatedHabits = [...habitsToProcess];

        let hasChanges = false;

        for (let i = 0; i < updatedHabits.length; i++) {
            const habit = updatedHabits[i];

            // Only schedule if active and has reminders
            if (habit.reminders && habit.reminders.length > 0 && !habit.archived) {
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

                // Always update IDs to match exactly what we just scheduled
                if (JSON.stringify(habit.notificationIds) !== JSON.stringify(newIds)) {
                    updatedHabits[i] = { ...habit, notificationIds: newIds };
                    hasChanges = true;
                }
            } else if (habit.notificationIds && habit.notificationIds.length > 0) {
                // Clear IDs if no reminders
                updatedHabits[i] = { ...habit, notificationIds: [] };
                hasChanges = true;
            }
        }

        // Save if we generated new IDs or if we were passed a new list (implicit change)
        if (hasChanges || habitsToSync) {
            console.log('[HabitContext] Sync complete. Saving updated habits.');
            setHabits(updatedHabits);
            saveHabitsToStorage(updatedHabits);
        }
    };

    // Auto-save habits when they change
    useEffect(() => {
        if (!loading && habits.length > 0) { // Don't save empty state on initial load
            saveHabitsToStorage(habits);
        }
    }, [habits, loading]);

    // Auto-save settings when they change
    useEffect(() => {
        if (!loading) {
            AsyncStorage.setItem('settings', JSON.stringify(settings));
        }
    }, [settings, loading]);

    // Auto-save unlocked themes
    useEffect(() => {
        if (!loading) {
            AsyncStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));
        }
    }, [unlockedThemes, loading]);

    // Auto-save user profile
    useEffect(() => {
        if (!loading) {
            AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
    }, [userProfile, loading]);

    // Helper to save habits and update widgets
    const saveHabitsToStorage = async (newHabits) => {
        try {
            await AsyncStorage.setItem('habits', JSON.stringify(newHabits));

            // Update Widgets - explicit rendering
            const configStr = await AsyncStorage.getItem('widget_config');
            if (configStr) {
                const config = JSON.parse(configStr);
                const activeHabits = newHabits.filter(h => !h.archived);

                // Calculate streaks for widget display
                const habitsWithStreak = activeHabits.map(h => ({
                    ...h,
                    streak: calculateStreak(h)
                }));

                console.log('[HabitContext] Updating Widgets. Config:', JSON.stringify(config));

                // Use sequential loop to avoid race conditions in native rendering
                for (const widgetId of Object.keys(config)) {
                    const configEntry = config[widgetId];
                    let habitId = null;
                    let widgetName = 'HabitWidget';

                    if (typeof configEntry === 'object') {
                        habitId = configEntry.habitId;
                        widgetName = configEntry.widgetName || 'HabitWidget';
                    } else {
                        habitId = configEntry; // Legacy
                    }

                    console.log(`[HabitContext] Processing Widget ${widgetId} -> Habit ${habitId} (${widgetName})`);

                    if (widgetName === 'HabitListWidget') {
                        // List widget doesn't need specific habitId
                        try {
                            await requestWidgetUpdate({
                                widgetName: 'HabitListWidget',
                                renderWidget: () => <HabitListWidget habits={habitsWithStreak} />,
                                widgetId: parseInt(widgetId, 10)
                            });
                        } catch (err) {
                            console.error(`[HabitContext] Failed to update List Widget ${widgetId}`, err);
                        }
                    } else {
                        const habit = habitsWithStreak.find(h => h.id === habitId);
                        if (habit) {
                            const commonProps = {
                                name: habit.name,
                                streak: habit.streak,
                                color: habit.color,
                                completedDates: habit.completedDates || habit.logs || {},
                                icon: habit.icon,
                                habitId: habit.id,
                                weekStart: settings.weekStart,
                                showStreak: settings.showStreakCount,
                                showLabels: settings.showDayLabels
                            };

                            let WidgetComponent = HabitWidget;
                            if (widgetName === 'HabitGridWidget') WidgetComponent = HabitGridWidget;
                            if (widgetName === 'HabitWeekWidget') WidgetComponent = HabitWeekWidget;
                            if (widgetName === 'HabitStreakWidget') WidgetComponent = HabitStreakWidget;

                            console.log(`[HabitContext] Rendering ${widgetName} for Widget ${widgetId} with Habit ${habit.name}`);

                            try {
                                await requestWidgetUpdate({
                                    widgetName: widgetName,
                                    renderWidget: () => <WidgetComponent {...commonProps} />,
                                    widgetId: parseInt(widgetId, 10)
                                });
                            } catch (err) {
                                console.error(`[HabitContext] Failed to update Widget ${widgetId}`, err);
                            }
                        } else {
                            console.warn(`[HabitContext] Habit ${habitId} not found for Widget ${widgetId}`);
                        }
                    }

                    // Artificial delay to prevent native view recycling race conditions
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        } catch (e) {
            console.error('Failed to save habits', e);
        }
        syncWithCloud(newHabits);
    };

    const loadData = async () => {
        try {
            const storedHabits = await AsyncStorage.getItem('habits');
            const storedSettings = await AsyncStorage.getItem('settings');
            const storedUnlocks = await AsyncStorage.getItem('unlockedThemes');
            const storedProfile = await AsyncStorage.getItem('userProfile');

            if (storedHabits) setHabits(JSON.parse(storedHabits));
            if (storedSettings) setSettings(JSON.parse(storedSettings));
            if (storedProfile) setUserProfile(JSON.parse(storedProfile));
            if (storedUnlocks) {
                const unlocks = JSON.parse(storedUnlocks);
                // Filter out expired unlocks
                const now = Date.now();
                const validUnlocks = {};
                Object.keys(unlocks).forEach(key => {
                    if (unlocks[key] > now) {
                        validUnlocks[key] = unlocks[key];
                    }
                });
                setUnlockedThemes(validUnlocks);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Sync when habits change (debounce?)
    // For now, let's just sync on load and maybe on explicit save?
    // Real-time sync might be too much for this step.

    const syncWithCloud = async (currentHabits) => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                const { SyncService } = require('../services/SyncService');
                const syncedHabits = await SyncService.syncHabits(user.uid, currentHabits);
                if (syncedHabits && JSON.stringify(syncedHabits) !== JSON.stringify(currentHabits)) {
                    setHabits(syncedHabits);
                }

                const maxStreak = currentHabits.length > 0
                    ? Math.max(...currentHabits.map(h => h.streak || 0))
                    : 0;

                await SyncService.updateUserStats(user.uid, { streak: maxStreak });
            }
        } catch (e) {
            console.log('Sync error', e);
        }
    };

    const saveData = async () => {
        try {
            await AsyncStorage.setItem('habits', JSON.stringify(habits));
            await AsyncStorage.setItem('settings', JSON.stringify(settings));
            await AsyncStorage.setItem('unlockedThemes', JSON.stringify(unlockedThemes));

            const configStr = await AsyncStorage.getItem('widget_config');
            if (configStr) {
                const config = JSON.parse(configStr);
                Object.keys(config).forEach(widgetId => {
                    requestWidgetUpdate({
                        widgetName: 'HabitWidget',
                        renderWidget: () => null,
                        widgetId: widgetId
                    });
                });
            }
        } catch (e) {
            console.error('Failed to save data', e);
        }
        syncWithCloud(habits);
    };



    const addHabit = async (habit) => {
        const habitId = Date.now().toString();
        const newHabit = {
            id: habitId,
            name: habit.name,
            description: habit.description || '',
            icon: habit.icon || 'star',
            color: habit.color || '#4ADE80',
            category: habit.category || 'Other',
            type: habit.type || 'binary',
            goal: habit.goal || 1,
            unit: habit.unit || '',
            frequency: habit.frequency || { type: 'daily', days: [] },
            reminders: habit.reminders || [],
            notificationIds: [], // Will be filled by rescheduleAllHabits
            archived: false,
            createdAt: new Date().toISOString(),
            completedDates: {},
            streak: 0,
        };

        // Optimistic Update
        const newHabitsList = [...habits, newHabit];
        setHabits(newHabitsList);
        saveHabitsToStorage(newHabitsList);

        // Background Sync
        rescheduleAllHabits(newHabitsList);
    };

    const toggleHabit = (habitId, date = new Date()) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const dateStr = format(date, 'yyyy-MM-dd');
        const currentVal = habit.type === 'numeric'
            ? (habit.completedDates?.[dateStr] || 0)
            : (habit.completedDates?.[dateStr] ? 1 : 0);

        if (habit.type === 'numeric') {
            // If already met goal (or has progress), clear it (Undo)
            // If empty, fill it (Complete) - or maybe just add 1?
            // User asked for "Undo".
            // If I click a date on calendar, I expect toggle.
            if (currentVal > 0) {
                logHabitProgress(habitId, date, -currentVal); // Remove all
            } else {
                logHabitProgress(habitId, date, habit.goal); // Mark done
            }
        } else {
            // Binary
            logHabitProgress(habitId, date, 1);
        }
    };

    const logHabitProgress = (habitId, date, value = 1) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setHabits(habits.map(h => {
            if (h.id === habitId) {
                const newCompletedDates = { ...(h.completedDates || h.logs || {}) };

                if (h.type === 'numeric') {
                    const currentVal = newCompletedDates[dateStr] || 0;
                    const newVal = currentVal + value;
                    if (newVal <= 0) {
                        delete newCompletedDates[dateStr];
                    } else {
                        newCompletedDates[dateStr] = newVal;
                    }
                } else {
                    // Binary
                    if (newCompletedDates[dateStr]) {
                        delete newCompletedDates[dateStr];
                    } else {
                        newCompletedDates[dateStr] = true;
                    }
                }
                return { ...h, completedDates: newCompletedDates };
            }
            return h;
        }));
    };

    const deleteHabit = async (habitId) => {
        const updatedHabits = habits.filter(h => h.id !== habitId);

        // Optimistic Update
        setHabits(updatedHabits);
        saveHabitsToStorage(updatedHabits);

        // Background Sync
        rescheduleAllHabits(updatedHabits);
    };

    const archiveHabit = (habitId) => {
        setHabits(habits.map(h => h.id === habitId ? { ...h, archived: true } : h));
    };

    const updateHabit = async (habitId, updates) => {
        const updatedHabits = habits.map(h => h.id === habitId ? { ...h, ...updates } : h);

        // Optimistic Update
        setHabits(updatedHabits);
        saveHabitsToStorage(updatedHabits);

        // Background Sync
        rescheduleAllHabits(updatedHabits);
    };

    const restoreHabit = async (habitId) => {
        const updatedHabits = habits.map(h => h.id === habitId ? { ...h, archived: false } : h);

        // Optimistic Update
        setHabits(updatedHabits);
        saveHabitsToStorage(updatedHabits);

        // Background Sync
        rescheduleAllHabits(updatedHabits);
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const updateUserProfile = (newProfile) => {
        setUserProfile(prev => ({ ...prev, ...newProfile }));
    };

    const importHabits = async (newHabits) => {
        try {
            // Basic validation
            if (!Array.isArray(newHabits)) throw new Error('Invalid format');
            setHabits(newHabits);
            await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
            return true;
        } catch (e) {
            console.error('Import failed', e);
            return false;
        }
    };

    const reorderHabits = async (newHabits) => {
        setHabits(newHabits);
        await AsyncStorage.setItem('habits', JSON.stringify(newHabits));
    };

    const exportData = async () => {
        try {
            const data = {
                habits,
                settings,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(data, null, 2);
        } catch (e) {
            console.error('Export failed', e);
            return null;
        }
    };

    const resetApp = async () => {
        try {
            await cancelAllNotifications();
            await AsyncStorage.clear();
            setHabits([]);
            // Note: AsyncStorage.clear() will also wipe 'user' and 'settings', but state remains until reload.
            // This is desired for a "Delete Forever" that exits the app.
        } catch (e) {
            console.error('Reset app failed', e);
            throw e;
        }
    };

    return (
        <HabitContext.Provider value={{ habits, settings, addHabit, toggleHabit, logHabitProgress, deleteHabit, archiveHabit, restoreHabit, updateHabit, updateSettings, isHabitDue, calculateHabitStrength, calculateStreak, getGlobalStats, importHabits, exportData, reorderHabits, loading, unlockTheme, isThemeUnlocked, unlockedThemes, isInsightsUnlocked, userProfile, updateUserProfile, resetApp }}>
            {children}
        </HabitContext.Provider>
    );
};
