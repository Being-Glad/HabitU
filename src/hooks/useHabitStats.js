import { useMemo, useCallback } from 'react';
import GamificationService from '../services/GamificationService';

export const useHabitStats = (habits) => {

    const calculateStreak = useCallback((habit) => {
        return GamificationService.calculateStreak(habit);
    }, []);

    const calculateHabitStrength = useCallback((habit) => {
        return GamificationService.calculateHabitStrength(habit);
    }, []);

    const isHabitDue = useCallback((habit, date) => {
        return GamificationService.isHabitDue(habit, date);
    }, []);

    // Memoize global stats to avoid recalculating on every render
    const globalStats = useMemo(() => {
        return GamificationService.getGlobalStats(habits);
    }, [habits]);

    return {
        calculateStreak,
        calculateHabitStrength,
        isHabitDue,
        getGlobalStats: () => globalStats, // Return the memoized object directly or a getter? Getter is fine.
        globalStats
    };
};
