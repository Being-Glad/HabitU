import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, ScrollView, Alert } from 'react-native';
import { X, Check, SkipForward, Edit2, Archive, Trash2, Calendar, TrendingUp, Share2 } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, getDay } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { getIcon } from '../utils/iconMap';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HabitActionModal = ({ habit: initialHabit, visible, onClose, onAction }) => {
    const { habits, toggleHabit, deleteHabit, calculateHabitStrength, calculateStreak } = useHabits();

    const habit = useMemo(() => {
        return habits.find(h => h.id === initialHabit?.id) || initialHabit;
    }, [habits, initialHabit]);

    const stats = useMemo(() => {
        if (!habit) return { strength: 0, streak: 0 };
        const strength = calculateHabitStrength(habit);
        const streak = calculateStreak(habit);
        return { strength, streak };
    }, [habit, calculateHabitStrength, calculateStreak]);

    if (!habit) return null;

    const isCompletedToday = habit.completedDates && habit.completedDates[format(new Date(), 'yyyy-MM-dd')];

    const renderMiniHeatmap = () => {
        const today = new Date();
        // Show current month and previous month
        const months = [subMonths(today, 1), today];

        return (
            <View style={styles.heatmapContainer}>
                {months.map((monthDate, mIndex) => {
                    const start = startOfMonth(monthDate);
                    const end = endOfMonth(monthDate);
                    const days = eachDayOfInterval({ start, end });
                    const startDay = getDay(start);
                    const padding = Array(startDay).fill(null);
                    const allDays = [...padding, ...days];

                    return (
                        <View key={mIndex} style={styles.monthContainer}>
                            <Text style={styles.monthTitle}>{format(monthDate, 'MMMM')}</Text>
                            <View style={styles.daysGrid}>
                                {allDays.map((day, index) => {
                                    if (!day) return <View key={`pad-${index}`} style={styles.dayCell} />;

                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const isCompleted = habit.completedDates?.[dateStr];
                                    const isToday = isSameDay(day, today);

                                    return (
                                        <TouchableOpacity
                                            key={dateStr}
                                            style={styles.dayCell}
                                            onPress={() => toggleHabit(habit.id, day)}
                                        >
                                            <View style={[
                                                styles.dayDot,
                                                isCompleted && { backgroundColor: habit.color },
                                                !isCompleted && isToday && { borderWidth: 2, borderColor: habit.color },
                                                !isCompleted && !isToday && { backgroundColor: '#27272a' }
                                            ]} />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const handleToggle = () => {
        toggleHabit(habit.id);
        // Don't close immediately so they can see the update
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Habit",
            "Are you sure? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteHabit(habit.id);
                        onClose();
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
                            <Text style={{ fontSize: 24 }}>{getIcon(habit.icon)}</Text>
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.habitName}>{habit.name}</Text>
                            <Text style={styles.habitStreak}>
                                {stats.streak} Day Streak • {stats.strength}% Strength
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X color="#a1a1aa" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Action: Complete */}
                    <TouchableOpacity
                        style={[
                            styles.completeButton,
                            isCompletedToday ? { backgroundColor: '#27272a', borderWidth: 1, borderColor: habit.color } : { backgroundColor: habit.color }
                        ]}
                        onPress={handleToggle}
                    >
                        {isCompletedToday ? (
                            <>
                                <Text style={[styles.completeButtonText, { color: habit.color }]}>Completed!</Text>
                                <Check color={habit.color} size={20} />
                            </>
                        ) : (
                            <>
                                <Text style={styles.completeButtonText}>Check In</Text>
                                <Check color="#000" size={20} />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Mini Heatmap */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Recent Activity</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {renderMiniHeatmap()}
                        </ScrollView>
                    </View>

                    {/* Quick Actions Grid */}
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={styles.actionItem} onPress={() => onAction('edit', habit)}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3f3f46' }]}>
                                <Edit2 color="#fff" size={20} />
                            </View>
                            <Text style={styles.actionLabel}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => onAction('calendar', habit)}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3f3f46' }]}>
                                <Calendar color="#fff" size={20} />
                            </View>
                            <Text style={styles.actionLabel}>History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => onAction('share', habit)}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3f3f46' }]}>
                                <Share2 color="#fff" size={20} />
                            </View>
                            <Text style={styles.actionLabel}>Share</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={() => onAction('archive', habit)}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3f3f46' }]}>
                                <Archive color="#fff" size={20} />
                            </View>
                            <Text style={styles.actionLabel}>Archive</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
                            <View style={[styles.actionIcon, { backgroundColor: '#ef444420' }]}>
                                <Trash2 color="#ef4444" size={20} />
                            </View>
                            <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#18181b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    habitName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    habitStreak: {
        fontSize: 14,
        color: '#a1a1aa',
    },
    closeButton: {
        padding: 8,
        backgroundColor: '#27272a',
        borderRadius: 12,
    },
    completeButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
        gap: 8,
    },
    completeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heatmapContainer: {
        flexDirection: 'row',
        gap: 24,
    },
    monthContainer: {
        width: SCREEN_WIDTH * 0.4,
    },
    monthTitle: {
        fontSize: 12,
        color: '#71717a',
        marginBottom: 8,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    dayCell: {
        width: '12%', // Approx 7 days per row
        aspectRatio: 1,
    },
    dayDot: {
        flex: 1,
        borderRadius: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionItem: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 12,
        color: '#a1a1aa',
        fontWeight: '500',
    }
});

export default HabitActionModal;
