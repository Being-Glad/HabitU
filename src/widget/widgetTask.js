import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerWidgetTaskHandler, requestWidgetUpdate, FlexWidget, TextWidget } from 'react-native-android-widget';
import { HabitWidget } from './HabitWidget';
import { HabitListWidget } from './HabitListWidget';
import { HabitGridWidget } from './HabitGridWidget';
import { HabitWeekWidget } from './HabitWeekWidget';
import { HabitStreakWidget } from './HabitStreakWidget';
import { SelectHabitWidget } from './SelectHabitWidget';

// Helper to calculate streak dynamically
// Helper to calculate streak dynamically
function calculateStreak(habit) {
    let s = 0;
    let d = new Date();
    const dates = habit.completedDates || habit.logs || {};

    // Helper to format date as YYYY-MM-DD in LOCAL time
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Check if today is completed
    if (!dates[formatDate(d)]) {
        // If not, check yesterday
        d.setDate(d.getDate() - 1);
        if (!dates[formatDate(d)]) {
            return 0; // Streak broken
        }
    }

    // Count backwards
    while (dates[formatDate(d)]) {
        s++;
        d.setDate(d.getDate() - 1);
    }
    return s;
}

export function registerWidgetTask() {
    try {
        console.log('Registering Widget Task...');
        registerWidgetTaskHandler(async (props) => {
            try {
                const widgetInfo = props.widgetInfo;
                const widgetName = widgetInfo?.widgetName;

                switch (props.widgetAction) {
                    case 'WIDGET_ADDED':
                    case 'WIDGET_UPDATE':
                    case 'WIDGET_RESIZED':
                    case 'WIDGET_CLICK':
                        let habits = [];
                        try {
                            const saved = await AsyncStorage.getItem('habits');
                            if (saved) {
                                habits = JSON.parse(saved);
                            }
                        } catch (e) {
                            console.error('Failed to load habits for widget', e);
                        }

                        // Load widget configuration (mapping widgetId -> habitId)
                        let widgetConfig = {};
                        try {
                            const config = await AsyncStorage.getItem('widget_config');
                            if (config) {
                                widgetConfig = JSON.parse(config);
                            }
                        } catch (e) {
                            console.error('Failed to load widget config', e);
                        }

                        const widgetId = props.widgetInfo?.widgetId;
                        const strWidgetId = String(widgetId);

                        // Handle both old (string) and new (object) config formats
                        let mappedHabitId = null;
                        let mappedWidgetName = null;

                        const configEntry = widgetConfig[strWidgetId] || widgetConfig[widgetId];
                        if (configEntry) {
                            if (typeof configEntry === 'object') {
                                mappedHabitId = configEntry.habitId;
                                mappedWidgetName = configEntry.widgetName;
                            } else {
                                mappedHabitId = configEntry; // Old format
                            }
                        }

                        // If no habit is mapped for this widget (and it's not the list widget), show selection screen
                        if (widgetName !== 'HabitListWidget' && !mappedHabitId) {
                            const effectiveWidgetName = widgetName || 'HabitWidget';
                            props.renderWidget(<SelectHabitWidget widgetId={widgetId} widgetName={effectiveWidgetName} />);
                            return;
                        }

                        if (props.widgetAction === 'WIDGET_CLICK') {
                            // Handle click action
                            const habitId = props.clickActionData?.habitId;
                            if (habitId) {
                                const habitIndex = habits.findIndex(h => h.id === habitId);
                                if (habitIndex !== -1) {
                                    const habit = habits[habitIndex];
                                    const today = new Date();
                                    const year = today.getFullYear();
                                    const month = String(today.getMonth() + 1).padStart(2, '0');
                                    const day = String(today.getDate()).padStart(2, '0');
                                    const todayStr = `${year}-${month}-${day}`;

                                    const completedDates = habit.completedDates || habit.logs || {};

                                    if (completedDates[todayStr]) {
                                        delete completedDates[todayStr];
                                    } else {
                                        completedDates[todayStr] = true;
                                    }

                                    habit.completedDates = completedDates;
                                    // Recalculate streak after update
                                    habit.streak = calculateStreak(habit);
                                    habits[habitIndex] = habit;

                                    await AsyncStorage.setItem('habits', JSON.stringify(habits));
                                }
                            }
                        }

                        // Load settings
                        let settings = {};
                        try {
                            const settingsStr = await AsyncStorage.getItem('settings');
                            if (settingsStr) {
                                settings = JSON.parse(settingsStr);
                            }
                        } catch (e) {
                            console.error('Failed to load settings', e);
                        }

                        // Recalculate streaks for display
                        const habitsWithStreak = habits.map(h => ({
                            ...h,
                            streak: calculateStreak(h)
                        }));

                        // Helper to render the widget
                        const renderCurrentWidget = () => {
                            const commonProps = {
                                width: widgetInfo?.width,
                                height: widgetInfo?.height
                            };

                            if (widgetName === 'HabitListWidget') {
                                props.renderWidget(
                                    <HabitListWidget habits={habitsWithStreak} {...commonProps} />
                                );
                            } else if (widgetName === 'HabitGridWidget') {
                                const habit = habitsWithStreak.find(h => h.id === mappedHabitId) || { name: 'Habit Not Found', streak: 0, color: '#52525b', completedDates: {}, icon: 'star' };
                                props.renderWidget(
                                    <HabitGridWidget
                                        name={habit.name}
                                        streak={habit.streak}
                                        color={habit.color}
                                        completedDates={habit.completedDates || habit.logs || {}}
                                        icon={habit.icon}
                                        habitId={habit.id}
                                        weekStart={settings.weekStart}
                                        showStreak={settings.showStreakCount}
                                        showLabels={settings.showDayLabels}
                                        {...commonProps}
                                    />
                                );
                            } else if (widgetName === 'HabitWeekWidget') {
                                const habit = habitsWithStreak.find(h => h.id === mappedHabitId) || { name: 'Habit Not Found', streak: 0, color: '#52525b', completedDates: {}, icon: 'star' };
                                props.renderWidget(
                                    <HabitWeekWidget
                                        name={habit.name}
                                        streak={habit.streak}
                                        color={habit.color}
                                        completedDates={habit.completedDates || habit.logs || {}}
                                        icon={habit.icon}
                                        habitId={habit.id}
                                        weekStart={settings.weekStart}
                                        showStreak={settings.showStreakCount}
                                        showLabels={settings.showDayLabels}
                                        {...commonProps}
                                    />
                                );
                            } else if (widgetName === 'HabitStreakWidget') {
                                const habit = habitsWithStreak.find(h => h.id === mappedHabitId) || { name: 'Habit Not Found', streak: 0, color: '#52525b', completedDates: {}, icon: 'star' };
                                props.renderWidget(
                                    <HabitStreakWidget
                                        name={habit.name}
                                        streak={habit.streak}
                                        color={habit.color}
                                        icon={habit.icon}
                                        habitId={habit.id}
                                        {...commonProps}
                                    />
                                );
                            } else {
                                // Default to HabitWidget (Active Month)
                                const habit = habitsWithStreak.find(h => h.id === mappedHabitId) || { name: 'Habit Not Found', streak: 0, color: '#52525b', completedDates: {}, icon: 'star' };
                                props.renderWidget(
                                    <HabitWidget
                                        name={habit.name}
                                        streak={habit.streak}
                                        color={habit.color}
                                        completedDates={habit.completedDates || habit.logs || {}}
                                        icon={habit.icon}
                                        habitId={habit.id}
                                        weekStart={settings.weekStart}
                                        showStreak={settings.showStreakCount}
                                        showLabels={settings.showDayLabels}
                                        {...commonProps}
                                    />
                                );
                            }
                        };

                        // Render immediately to ensure responsiveness
                        renderCurrentWidget();

                        // If this was a click action, trigger updates for OTHER widgets in the background
                        if (props.widgetAction === 'WIDGET_CLICK') {
                            const allWidgetIds = Object.keys(widgetConfig);

                            // Sequential updates for background task too
                            for (const targetId of allWidgetIds) {
                                // Skip the current widget as it was just rendered
                                if (String(targetId) === String(widgetId)) continue;

                                const configEntry = widgetConfig[targetId];
                                let targetHabitId = null;
                                let targetWidgetName = 'HabitWidget'; // Default

                                if (configEntry && typeof configEntry === 'object') {
                                    targetHabitId = configEntry.habitId;
                                    targetWidgetName = configEntry.widgetName || 'HabitWidget';
                                } else {
                                    targetHabitId = configEntry; // Legacy
                                }

                                const targetHabit = habitsWithStreak.find(h => h.id === targetHabitId);

                                if (targetHabit) {
                                    const commonProps = {
                                        name: targetHabit.name,
                                        streak: targetHabit.streak,
                                        color: targetHabit.color,
                                        completedDates: targetHabit.completedDates || targetHabit.logs || {},
                                        icon: targetHabit.icon,
                                        habitId: targetHabit.id,
                                        weekStart: settings.weekStart,
                                        showStreak: settings.showStreakCount,
                                        showLabels: settings.showDayLabels
                                    };

                                    let WidgetComponent = HabitWidget;
                                    if (targetWidgetName === 'HabitListWidget') WidgetComponent = HabitListWidget;
                                    if (targetWidgetName === 'HabitGridWidget') WidgetComponent = HabitGridWidget;
                                    if (targetWidgetName === 'HabitWeekWidget') WidgetComponent = HabitWeekWidget;
                                    if (targetWidgetName === 'HabitStreakWidget') WidgetComponent = HabitStreakWidget;

                                    if (targetWidgetName === 'HabitListWidget') {
                                        try {
                                            requestWidgetUpdate({
                                                widgetName: 'HabitListWidget',
                                                renderWidget: () => <HabitListWidget habits={habitsWithStreak} />,
                                                widgetId: parseInt(targetId, 10),
                                                widgetAction: 'WIDGET_UPDATE'
                                            });
                                        } catch (e) {
                                            console.error('Failed to update list widget', e);
                                        }
                                    } else {
                                        try {
                                            requestWidgetUpdate({
                                                widgetName: targetWidgetName,
                                                renderWidget: () => <WidgetComponent {...commonProps} />,
                                                widgetId: parseInt(targetId, 10),
                                                widgetAction: 'WIDGET_UPDATE'
                                            });
                                        } catch (e) {
                                            console.error('Failed to update widget', targetId, e);
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error('Widget Task Error:', error);
                // Render error state
                props.renderWidget(
                    <FlexWidget
                        style={{
                            height: 'match_parent',
                            width: 'match_parent',
                            backgroundColor: '#18181b',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <TextWidget
                            text="Widget Error"
                            style={{ fontSize: 16, color: '#ef4444', fontWeight: 'bold' }}
                        />
                    </FlexWidget>
                );
            }
        });
    } catch (e) {
        console.error('CRITICAL: Failed to register widget task handler', e);
    }
}
