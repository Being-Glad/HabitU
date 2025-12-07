import { requestWidgetUpdate } from 'react-native-android-widget';
import React from 'react';

// Import Widget Components
import { HabitWidget } from '../widget/HabitWidget';
import { HabitListWidget } from '../widget/HabitListWidget';
import { HabitGridWidget } from '../widget/HabitGridWidget';
import { HabitWeekWidget } from '../widget/HabitWeekWidget';
import { HabitStreakWidget } from '../widget/HabitStreakWidget';

import GamificationService from './GamificationService';

class WidgetService {

    /**
     * Updates all widgets based on the current configuration and habit state.
     * @param {Array} habits - List of all habits (should include latest streaks/logs)
     * @param {Object} config - Widget configuration object { widgetId: { habitId, widgetName } }
     * @param {Object} settings - App settings (weekStart, etc.)
     */
    async updateAllWidgets(habits, config, settings) {
        if (!config) return;

        const activeHabits = habits.filter(h => !h.archived);

        // Pre-calculate data needed for widgets
        const habitsWithStreak = activeHabits.map(h => ({
            ...h,
            streak: GamificationService.calculateStreak(h)
        }));

        console.log('[WidgetService] Updating Widgets...', Object.keys(config).length);

        // We can run these in parallel, but 'react-native-android-widget' sometimes has issues with 
        // massive parallel rendering. Let's do small batches or just waiting.
        // The original code used sequential with 50ms delay.
        // We will stick to sequential to be safe, but optimize where possible.

        for (const widgetId of Object.keys(config)) {
            const entry = config[widgetId];
            console.log(`[WidgetService] Rendering Widget ${widgetId} with config:`, JSON.stringify(entry));
            await this.renderWidget(widgetId, entry, habitsWithStreak, settings);
            // Small delay to ensure resources are freed/race conditions avoided in native layer
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    async renderWidget(widgetId, configEntry, habitsWithStreak, settings) {
        let habitId = null;
        let widgetName = 'HabitWidget';

        if (typeof configEntry === 'object') {
            habitId = configEntry.habitId;
            widgetName = configEntry.widgetName || 'HabitWidget';
        } else {
            habitId = configEntry; // Legacy format
        }

        if (widgetName === 'HabitListWidget') {
            try {
                await requestWidgetUpdate({
                    widgetName: 'HabitListWidget',
                    renderWidget: () => <HabitListWidget habits={habitsWithStreak} />,
                    widgetId: parseInt(widgetId, 10)
                });
            } catch (err) {
                console.error(`[WidgetService] Failed HabitListWidget ${widgetId}`, err);
            }
            return;
        }

        // Single Habit Widgets
        const habit = habitsWithStreak.find(h => h.id === habitId);
        if (habit) {
            const commonProps = {
                name: habit.name,
                streak: habit.streak,
                color: habit.color,
                completedDates: habit.completedDates || habit.logs || {},
                icon: habit.icon,
                habitId: habit.id,
                weekStart: settings?.weekStart || 'Monday',
                showStreak: settings?.showStreakCount !== false,
                showLabels: settings?.showDayLabels !== false
            };

            let WidgetComponent = HabitWidget;
            if (widgetName === 'HabitGridWidget') WidgetComponent = HabitGridWidget;
            if (widgetName === 'HabitWeekWidget') WidgetComponent = HabitWeekWidget;
            if (widgetName === 'HabitStreakWidget') WidgetComponent = HabitStreakWidget;

            try {
                await requestWidgetUpdate({
                    widgetName: widgetName,
                    renderWidget: () => <WidgetComponent {...commonProps} />,
                    widgetId: parseInt(widgetId, 10)
                });
            } catch (err) {
                console.error(`[WidgetService] Failed ${widgetName} ${widgetId}`, err);
            }
        } else {
            console.warn(`[WidgetService] Habit ${habitId} not found for Widget ${widgetId}`);
        }
    }
}

export default new WidgetService();
