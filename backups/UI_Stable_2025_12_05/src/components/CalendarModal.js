import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { useHabits } from '../context/HabitContext';

const { width } = Dimensions.get('window');

const CalendarModal = ({ visible, habit: initialHabit, onClose }) => {
    const { habits, toggleHabit, settings } = useHabits();
    const habit = habits.find(h => h.id === initialHabit?.id) || initialHabit;
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const modalBg = isLight ? '#ffffff' : '#18181b';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const iconColor = isLight ? '#000000' : '#ffffff';
    const disabledIconColor = isLight ? '#d4d4d8' : '#3f3f46';

    if (!habit) return null;

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    const startDay = getDay(startOfMonth(currentMonth)); // 0 = Sunday, 1 = Monday, etc.
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

    const handleDayPress = (date) => {
        // Prevent toggling future dates
        if (date > new Date()) return;
        toggleHabit(habit.id, date);
    };

    const renderCalendarGrid = () => {
        const grid = [];
        // Add empty placeholders for days before start of month
        for (let i = 0; i < adjustedStartDay; i++) {
            grid.push(<View key={`empty-${i}`} style={styles.dayCell} />);
        }

        daysInMonth.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCompleted = habit.completedDates?.[dateStr] || habit.logs?.[dateStr];
            const isToday = isSameDay(date, new Date());
            const isFuture = date > new Date();

            grid.push(
                <TouchableOpacity
                    key={dateStr}
                    style={[
                        styles.dayCell,
                        isCompleted && { backgroundColor: habit.color },
                        isToday && !isCompleted && [styles.todayCell, { borderColor: habit.color }],
                        isFuture && styles.futureCell
                    ]}
                    onPress={() => handleDayPress(date)}
                    disabled={isFuture}
                >
                    <Text style={[
                        styles.dayText,
                        { color: textColor },
                        isCompleted && { color: '#000', fontWeight: 'bold' },
                        isToday && !isCompleted && { color: habit.color },
                        isFuture && { color: subTextColor }
                    ]}>
                        {format(date, 'd')}
                    </Text>
                </TouchableOpacity>
            );
        });

        return grid;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: textColor }]}>{habit.name}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <X color={subTextColor} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                                <ChevronLeft color={iconColor} size={24} />
                            </TouchableOpacity>
                            <Text style={[styles.monthTitle, { color: textColor }]}>{format(currentMonth, 'MMMM yyyy')}</Text>
                            <TouchableOpacity
                                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                disabled={isSameMonth(currentMonth, new Date())}
                            >
                                <ChevronRight color={isSameMonth(currentMonth, new Date()) ? disabledIconColor : iconColor} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.weekDaysRow}>
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                                <Text key={day} style={[styles.weekDayText, { color: subTextColor }]}>{day}</Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrid}>
                            {renderCalendarGrid()}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        minHeight: 500,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        marginBottom: 8,
    },
    todayCell: {
        borderWidth: 1,
    },
    futureCell: {
        opacity: 0.5,
    },
    dayText: {
        fontSize: 16,
    }
});

export default CalendarModal;
