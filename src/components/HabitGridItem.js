import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { getIcon } from '../utils/iconMap';
import { useHabits } from '../context/HabitContext';
import { format } from 'date-fns';
import AnimatedPressable from './AnimatedPressable';

const HabitGridItem = ({ habit, onPress }) => {
    const { toggleHabit, settings } = useHabits();
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');
    const isCompleted = habit.type === 'numeric'
        ? (habit.completedDates?.[dateStr] || 0) >= habit.goal
        : (habit.completedDates?.[dateStr] || habit.logs?.[dateStr]);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const cardBg = isLight ? '#ffffff' : 'rgba(30, 30, 30, 0.6)';
    const cardBorder = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';

    const handlePress = () => {
        // Haptics handled by AnimatedPressable
        toggleHabit(habit.id, today);
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            style={[
                styles.card,
                {
                    backgroundColor: isCompleted ? habit.color : cardBg,
                    borderColor: isCompleted ? habit.color : cardBorder,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3.84,
                    elevation: 2,
                }
            ]}
        >
            <Text style={{ fontSize: 32, marginBottom: 8 }}>
                {getIcon(habit.icon)}
            </Text>
            <Text style={[styles.name, { color: isCompleted ? '#000' : textColor }]} numberOfLines={1}>
                {habit.name}
            </Text>
            <Text style={[styles.status, { color: isCompleted ? 'rgba(0,0,0,0.7)' : subTextColor }]}>
                {isCompleted ? 'Done!' : 'Tap to complete'}
            </Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 16,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 6,
        borderWidth: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    status: {
        fontSize: 10,
        marginTop: 4,
    }
});

export default HabitGridItem;
