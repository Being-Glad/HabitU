import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Hooks
import { useHabitPersistence } from '../hooks/useHabitPersistence';
import { useHabitStats } from '../hooks/useHabitStats';
import { useWidgetSync } from '../hooks/useWidgetSync';
import { useCloudSync } from '../hooks/useCloudSync';

// Services (for static constants/helpers if needed)
import { CATEGORIES as CATS } from '../context/HabitContext'; // Need to preserve exports? 
// Ah, `CATEGORIES` was exported from HabitContext. We should define it here.

export const CATEGORIES = ['Health', 'Fitness', 'Mindfulness', 'Work', 'Learning', 'Social', 'Finance', 'Other'];

const HabitContext = createContext();

export const useHabits = () => useContext(HabitContext);

export const HabitProvider = ({ children }) => {

    // 1. Persistence & State
    const {
        habits,
        settings,
        userProfile,
        unlockedThemes,
        loading,
        addHabit,
        updateHabit,
        deleteHabit,
        setHabitsDirectly,
        updateSettings,
        updateUserProfile,
        unlockTheme,
        resetApp
    } = useHabitPersistence();

    // 2. Stats & Logic (Memoized)
    const {
        calculateStreak,
        calculateHabitStrength,
        isHabitDue,
        getGlobalStats
    } = useHabitStats(habits);

    // 3. Side Effects (Background Syncs)
    useWidgetSync(habits, settings);
    useCloudSync(habits);

    // --- Legacy Logic Reconstruction ---

    const toggleHabit = useCallback((habitId, date = new Date()) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const dateStr = format(date, 'yyyy-MM-dd');
        const currentVal = habit.type === 'numeric'
            ? (habit.completedDates?.[dateStr] || 0)
            : (habit.completedDates?.[dateStr] ? 1 : 0);

        if (habit.type === 'numeric') {
            if (currentVal > 0) {
                logHabitProgress(habitId, date, -currentVal); // Remove all (Undo)
            } else {
                logHabitProgress(habitId, date, habit.goal); // Mark done
            }
        } else {
            // Binary
            logHabitProgress(habitId, date, 1);
        }
    }, [habits]);

    const logHabitProgress = useCallback((habitId, date, value = 1) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const dateStr = format(date, 'yyyy-MM-dd');
        const newCompletedDates = { ...(habit.completedDates || habit.logs || {}) };

        if (habit.type === 'numeric') {
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

        // Use the direct setter update from Persistence Hook that saves but doesn't trigger full habit re-schedule
        // Actually, `updateHabit` in useHabitPersistence checks if `reminders` changed. 
        // If we just pass `completedDates`, it won't re-schedule. Efficient!
        updateHabit(habitId, { completedDates: newCompletedDates });

    }, [habits, updateHabit]);

    const archiveHabit = (habitId) => {
        updateHabit(habitId, { archived: true });
    };

    const restoreHabit = (habitId) => {
        updateHabit(habitId, { archived: false });
    };

    // Helpers
    const isThemeUnlocked = (themeId) => {
        if (!['coffee', 'midnight', 'slate'].includes(themeId)) return true;
        const expiry = unlockedThemes[themeId];
        return expiry && expiry > Date.now();
    };

    const isInsightsUnlocked = () => {
        const expiry = unlockedThemes['insights'];
        return expiry && expiry > Date.now();
    };

    const importHabits = async (newHabits) => {
        if (!Array.isArray(newHabits)) return false;
        await setHabitsDirectly(newHabits);
        return true;
    };

    const reorderHabits = async (newHabits) => {
        await setHabitsDirectly(newHabits);
    };

    const exportData = async () => {
        const data = {
            habits,
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    };

    // Provide the exact same interface as before to ensure 0 Refactoring needed in UI
    const value = {
        habits,
        settings,
        loading,
        userProfile,
        unlockedThemes,

        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        logHabitProgress,
        archiveHabit,
        restoreHabit,
        importHabits,
        reorderHabits,
        exportData,
        resetApp,

        updateSettings,
        updateUserProfile,
        unlockTheme,
        isThemeUnlocked,
        isInsightsUnlocked,

        isHabitDue,
        calculateHabitStrength,
        calculateStreak,
        getGlobalStats
    };

    return (
        <HabitContext.Provider value={value}>
            {children}
        </HabitContext.Provider>
    );
};
