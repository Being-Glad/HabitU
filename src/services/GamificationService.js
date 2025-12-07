import { format, subDays } from 'date-fns';

class GamificationService {

    isHabitDue(habit, date) {
        if (!habit.frequency) return true; // Default to daily

        const { type, days, interval, startDate } = habit.frequency;

        if (type === 'daily') return true;

        if (type === 'weekly') {
            if (days && days.length > 0) {
                const dayName = format(date, 'EEE');
                return days.includes(dayName);
            }
            return true;
        }

        if (type === 'interval') {
            if (!startDate) return true;
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const current = new Date(date);
            current.setHours(0, 0, 0, 0);

            const diffTime = Math.abs(current - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays % interval === 0;
        }

        return true;
    }

    calculateStreak(habit) {
        let streak = 0;
        let d = new Date();
        const dates = habit.completedDates || habit.logs || {};

        // Safety break
        let safetyCounter = 0;
        const MAX_DAYS = 365 * 2;

        while (true) {
            if (safetyCounter++ > MAX_DAYS) break;

            const dateStr = format(d, 'yyyy-MM-dd');
            const isDone = dates[dateStr];
            const isDue = this.isHabitDue(habit, d);
            const isToday = format(d, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            if (isDone) {
                streak++;
            } else {
                if (isDue) {
                    if (!isToday) {
                        break; // Missed a past due day
                    }
                    // If today is due but not done, don't break, just don't count it.
                }
                // If not due, bridge the gap.
            }
            d.setDate(d.getDate() - 1);
        }
        return streak;
    }

    calculateHabitStrength(habit) {
        const today = new Date();
        let score = 0;
        let totalWeight = 0;

        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            if (!this.isHabitDue(habit, date)) continue;

            const weight = i < 7 ? 1.5 : 1;
            totalWeight += weight;

            const isCompleted = habit.type === 'numeric'
                ? (habit.completedDates?.[dateStr] || 0) >= habit.goal
                : (habit.completedDates?.[dateStr] || habit.logs?.[dateStr]);

            if (isCompleted) {
                score += weight;
            }
        }

        return totalWeight === 0 ? 0 : Math.round((score / totalWeight) * 100);
    }

    getGlobalStats(habits) {
        const activeHabits = habits.filter(h => !h.archived);
        if (activeHabits.length === 0) return { score: 0, perfectDays: [], topHabits: [] };

        // 1. Overall Score
        const totalStrength = activeHabits.reduce((sum, h) => sum + this.calculateHabitStrength(h), 0);
        const overallScore = Math.round(totalStrength / activeHabits.length);

        // 2. Perfect Days (Last 30 days)
        const perfectDays = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const dueHabits = activeHabits.filter(h => this.isHabitDue(h, date));

            // If no habits were due that day, it doesn't count as "Perfect" (or maybe it does? Current logic says no if length 0)
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
            .sort((a, b) => this.calculateHabitStrength(b) - this.calculateHabitStrength(a))
            .slice(0, 3)
            .map(h => ({ ...h, streak: this.calculateStreak(h) }));

        return { score: overallScore, perfectDays, topHabits };
    }
}

export default new GamificationService();
