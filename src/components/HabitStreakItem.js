import React from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Text, StyleSheet, View } from 'react-native';
import { getIcon } from '../utils/iconMap';
import { Flame, Check } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { format } from 'date-fns';
import ScaleButton from './ScaleButton';

const HabitStreakItem = ({ habit, onPress }) => {
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

    const streak = getStreak();

    return (
        <ScaleButton
            onPress={onPress}
            style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
            activeOpacity={0.9}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={[styles.iconBox, { backgroundColor: `${habit.color}20` }]}>
                    <Text style={{ fontSize: 20 }}>{getIcon(habit.icon)}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.name, { color: textColor }]}>{habit.name}</Text>
                    <Text style={[styles.subtitle, { color: subTextColor }]}>{habit.category || 'General'}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.streakCount, { color: streak > 0 ? '#fb923c' : subTextColor }]}>
                            {streak}
                        </Text>
                        <Flame size={16} color={streak > 0 ? '#fb923c' : subTextColor} fill={streak > 0 ? '#fb923c' : 'none'} />
                    </View>
                    <Text style={[styles.streakLabel, { color: subTextColor }]}>Current Streak</Text>
                </View>

                <ScaleButton
                    onPress={() => {
                        // Haptics handled by ScaleButton
                        toggleHabit(habit.id, today);
                    }}
                    style={[
                        styles.checkButton,
                        {
                            backgroundColor: isCompleted ? habit.color : 'transparent',
                            borderColor: isCompleted ? habit.color : subTextColor
                        }
                    ]}
                    scaleTo={0.8}
                >
                    {isCompleted && (
                        <Animated.View entering={ZoomIn.springify().damping(12)}>
                            <Check color="#000" size={16} />
                        </Animated.View>
                    )}
                </ScaleButton>
            </View>
        </ScaleButton>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    subtitle: {
        fontSize: 12,
        color: '#a1a1aa',
    },
    streakCount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    streakLabel: {
        fontSize: 10,
        color: '#52525b',
    },
    checkButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default HabitStreakItem;
