import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Share, Pressable } from 'react-native';
import { Check, Flame, Archive, Target } from 'lucide-react-native';
import Heatmap from './Heatmap';
import { useHabits } from '../context/HabitContext';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconMap';
import * as Haptics from 'expo-haptics';
import AnimatedPressable from './AnimatedPressable';
import Animated, { ZoomIn } from 'react-native-reanimated';

const HabitCard = ({ habit, onPress, onShare }) => {
    const { toggleHabit, archiveHabit, restoreHabit, settings, isHabitDue } = useHabits();
    // ... (rest of logic unchanged until rendering)
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const cardBg = isLight ? '#ffffff' : 'rgba(30, 30, 30, 0.6)';
    const cardBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const iconBoxBg = isLight ? `${habit.color}15` : `${habit.color}20`;

    const isCompleted = habit.type === 'numeric'
        ? (habit.completedDates?.[dateStr] || 0) >= habit.goal
        : (habit.completedDates?.[dateStr] || habit.logs?.[dateStr]);

    const handleLongPress = () => {
        if (habit.archived) {
            Alert.alert(
                "Manage Habit",
                "What would you like to do?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Restore", onPress: () => restoreHabit(habit.id) }
                ]
            );
        } else {
            Alert.alert(
                "Manage Habit",
                "What would you like to do?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Share", onPress: () => onShare && onShare(habit) },
                    { text: "Archive", onPress: () => archiveHabit(habit.id), style: 'destructive' }
                ]
            );
        }
    };

    const getStreak = () => {
        let streak = 0;
        let d = new Date();
        const dates = habit.completedDates || habit.logs || {};

        if (!dates[format(d, 'yyyy-MM-dd')]) {
            d.setDate(d.getDate() - 1);
        }

        while (dates[format(d, 'yyyy-MM-dd')]) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
        return streak;
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onLongPress={handleLongPress}
            style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
        >
            <View style={styles.header}>
                <View style={styles.infoContainer}>
                    <View style={[styles.iconBox, { backgroundColor: iconBoxBg, borderColor: `${habit.color}40` }]}>
                        <Text style={{ fontSize: 20 }}>
                            {getIcon(habit.icon)}
                        </Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.title, { color: textColor }]}>{habit.name}</Text>
                            {habit.category && (
                                <View style={[styles.categoryTag, { borderColor: habit.color }]}>
                                    <Text style={[styles.categoryText, { color: habit.color }]}>{habit.category}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.streakContainer}>
                            {settings.showStreakCount && (
                                <>
                                    <Flame size={14} color="#fb923c" />
                                    <Text style={styles.streakText}>{getStreak()} Day Streak</Text>
                                </>
                            )}
                            {settings.showStreakGoal && (
                                <>
                                    <Target size={14} color={subTextColor} style={{ marginLeft: 8 }} />
                                    <Text style={styles.streakText}>Target: {getStreak() < 7 ? 7 : (getStreak() < 30 ? 30 : (getStreak() < 100 ? 100 : 365))}</Text>
                                </>
                            )}
                        </View>
                    </View>
                </View>


                {habit.type === 'numeric' ? (
                    <AnimatedPressable
                        onPress={() => {
                            toggleHabit(habit.id, today);
                        }}
                        style={[
                            styles.checkButton,
                            {
                                backgroundColor: isCompleted ? habit.color : 'transparent',
                                borderColor: habit.color
                            }
                        ]}
                    >
                        <Animated.View
                            key={isCompleted ? 'completed' : 'pending'}
                            entering={ZoomIn.springify().damping(12)}
                        >
                            <Text style={{ color: isCompleted ? '#000' : habit.color, fontWeight: 'bold', fontSize: 18 }}>+</Text>
                        </Animated.View>
                    </AnimatedPressable>
                ) : (
                    <AnimatedPressable
                        onPress={() => {
                            toggleHabit(habit.id, today);
                        }}
                        style={[
                            styles.checkButton,
                            {
                                backgroundColor: isCompleted ? habit.color : 'transparent',
                                borderColor: isCompleted ? habit.color : subTextColor
                            }
                        ]}
                    >
                        {isCompleted && (
                            <Animated.View entering={ZoomIn.springify().damping(12)}>
                                <Check color="#000" size={20} />
                            </Animated.View>
                        )}
                    </AnimatedPressable>
                )}
            </View>

            {habit.type === 'numeric' && (
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressTextContainer}>
                        <Text style={[styles.progressValue, { color: textColor }]}>
                            {habit.completedDates?.[dateStr] || 0} / {habit.goal} {habit.unit}
                        </Text>
                        <Text style={styles.progressPercentage}>
                            {Math.min(100, Math.round(((habit.completedDates?.[dateStr] || 0) / habit.goal) * 100))}%
                        </Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${Math.min(100, ((habit.completedDates?.[dateStr] || 0) / habit.goal) * 100)}%`,
                                    backgroundColor: habit.color
                                }
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Conditionally render Heatmap or Week View based on settings */}
            {settings.cardStyle === 'brief' ? (
                <View style={styles.weekContainer}>
                    {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i)); // -6, -5, ... 0 (Today)
                        const dateString = format(d, 'yyyy-MM-dd');
                        const isDayDone = habit.completedDates?.[dateString] || habit.logs?.[dateString];
                        const isToday = i === 6;

                        return (
                            <View key={i} style={styles.dayColumn}>
                                <Text style={[styles.dayLabel, { color: subTextColor, fontWeight: isToday ? 'bold' : 'normal' }]}>
                                    {format(d, 'EEEEE')}
                                </Text>
                                <View
                                    style={[
                                        styles.dayDot,
                                        {
                                            backgroundColor: isDayDone ? habit.color : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'),
                                            borderColor: isToday ? textColor : 'transparent',
                                            borderWidth: isToday ? 1 : 0
                                        }
                                    ]}
                                />
                            </View>
                        );
                    })}
                </View>
            ) : (
                <Heatmap
                    completedDates={habit.completedDates || habit.logs || {}}
                    color={habit.color}
                    showMonthLabels={settings.showMonthLabels}
                    showDayLabels={settings.showDayLabels}
                    theme={currentTheme}
                    weekStart={settings.weekStart}
                    isHabitDue={(date) => isHabitDue(habit, date)}
                    highlightCurrentDay={settings.highlightCurrentDay}
                />
            )}

            <View style={[styles.footer, { borderTopColor: cardBorder }]}>
                <Text style={styles.progressText}>
                    Total: <Text style={{ color: textColor }}>{Object.keys(habit.completedDates || habit.logs || {}).length} Days</Text>
                </Text>
            </View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontSize: 11,
        color: '#a1a1aa',
    },
    checkButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    progressText: {
        fontSize: 11,
        color: '#a1a1aa',
    },
    categoryTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        marginTop: 0,
        marginBottom: 12,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    progressValue: {
        fontSize: 11,
        fontWeight: '600',
    },
    progressPercentage: {
        color: '#a1a1aa',
        fontSize: 11,
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginBottom: 4,
    },
    dayColumn: {
        alignItems: 'center',
        gap: 6,
    },
    dayLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
    },
    dayDot: {
        width: 24, // Slightly larger for tapability/visibility
        height: 24,
        borderRadius: 6, // Rounded square look
    }
});

export default HabitCard;
