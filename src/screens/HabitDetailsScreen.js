import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, Platform } from 'react-native';
import { ArrowLeft, Edit2, Calendar as CalendarIcon, Trophy, TrendingUp, Activity } from 'lucide-react-native';
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { useHabits } from '../context/HabitContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HabitDetailsScreen = ({ habitId, onClose }) => {
    const { habits, calculateHabitStrength } = useHabits();
    const habit = habits.find(h => h.id === habitId);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (!habit) return null;

    const stats = useMemo(() => {
        const completedDates = Object.keys(habit.completedDates || habit.logs || {});
        const total = completedDates.length;

        // Calculate streaks
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Sort dates
        const sortedDates = completedDates.sort();

        // Simple streak calculation (this can be optimized)
        // ... (Logic for streaks would go here, reusing existing logic or enhancing it)
        // For now using the habit.streak if available or recalculating

        // Weekly consistency
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        completedDates.forEach(dateStr => {
            const day = getDay(new Date(dateStr));
            dayCounts[day]++;
        });
        const maxDayCount = Math.max(...dayCounts, 1);
        const weeklyConsistency = dayCounts.map(count => count / maxDayCount);

        return {
            total,
            currentStreak: habit.streak,
            bestStreak: habit.streak,
            strength: calculateHabitStrength(habit),
            weeklyConsistency
        };
    }, [habit]);

    const renderCalendar = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        // Padding for start of month
        const startDay = getDay(start); // 0-6
        const padding = Array(startDay).fill(null);

        const allDays = [...padding, ...days];

        return (
            <View style={styles.calendarContainer}>
                <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <Text style={styles.arrow}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <Text style={styles.arrow}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.weekDays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <Text key={i} style={styles.weekDayText}>{d}</Text>
                    ))}
                </View>
                <View style={styles.daysGrid}>
                    {allDays.map((day, index) => {
                        if (!day) return <View key={`pad-${index}`} style={styles.dayCell} />;

                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isCompleted = habit.completedDates?.[dateStr] || habit.logs?.[dateStr];

                        return (
                            <View key={dateStr} style={styles.dayCell}>
                                <View style={[
                                    styles.dayCircle,
                                    isCompleted && { backgroundColor: habit.color },
                                    isSameDay(day, new Date()) && !isCompleted && { borderWidth: 1, borderColor: habit.color }
                                ]}>
                                    <Text style={[
                                        styles.dayText,
                                        isCompleted && { color: '#000', fontWeight: 'bold' }
                                    ]}>{format(day, 'd')}</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderWeeklyChart = () => {
        const barWidth = (SCREEN_WIDTH - 80) / 7;
        const height = 100;
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        return (
            <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Weekly Consistency</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
                    {stats.weeklyConsistency.map((value, index) => (
                        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                            <View style={{
                                width: '100%',
                                height: Math.max(value * height, 4),
                                backgroundColor: value > 0 ? habit.color : '#27272a',
                                borderRadius: 4,
                                opacity: value > 0 ? 0.8 + (value * 0.2) : 1
                            }} />
                            <Text style={{ color: '#a1a1aa', fontSize: 12, marginTop: 8 }}>{days[index]}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{habit.name}</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Edit2 color="#a1a1aa" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Overview Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBg, { backgroundColor: `${habit.color}20` }]}>
                            <Trophy color={habit.color} size={24} />
                        </View>
                        <Text style={styles.statValue}>{stats.currentStreak}</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBg, { backgroundColor: '#3f3f46' }]}>
                            <Activity color="#fff" size={24} />
                        </View>
                        <Text style={styles.statValue}>{stats.strength}%</Text>
                        <Text style={styles.statLabel}>Habit Strength</Text>
                    </View>
                </View>

                {renderWeeklyChart()}

                {renderCalendar()}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        paddingTop: Platform.OS === 'android' ? 12 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#27272a',
        borderRadius: 12,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#27272a',
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#18181b',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#a1a1aa',
    },
    chartContainer: {
        backgroundColor: '#18181b',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 24,
    },
    calendarContainer: {
        backgroundColor: '#18181b',
        padding: 20,
        borderRadius: 24,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    arrow: {
        fontSize: 20,
        color: '#a1a1aa',
        padding: 8,
    },
    weekDays: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        color: '#52525b',
        fontSize: 12,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: '#fff',
        fontSize: 14,
    }
});

export default HabitDetailsScreen;
