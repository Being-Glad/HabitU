import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, StatusBar } from 'react-native';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';

const ArchivedHabitsScreen = ({ onClose }) => {
    const { habits, restoreHabit, deleteHabit, settings } = useHabits();
    const archivedHabits = habits.filter(h => h.archived);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const backButtonBg = isLight ? '#f4f4f5' : '#27272a';
    const iconBoxBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

    const handleRestore = (habit) => {
        Alert.alert(
            "Restore Habit",
            `Are you sure you want to restore "${habit.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Restore", onPress: () => restoreHabit(habit.id) }
            ]
        );
    };

    const handleDelete = (habit) => {
        Alert.alert(
            "Delete Permanently",
            `This will permanently delete "${habit.name}" and all its history. This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteHabit(habit.id)
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: backButtonBg }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Archived Habits</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {archivedHabits.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: subTextColor }]}>No archived habits</Text>
                    </View>
                ) : (
                    archivedHabits.map(habit => (
                        <View key={habit.id} style={[styles.card, { backgroundColor: cardColor }]}>
                            <View style={styles.cardInfo}>
                                <View style={[styles.iconBox, { backgroundColor: `${habit.color}20` }]}>
                                    <Text style={{ fontSize: 24 }}>
                                        {habit.icon === 'snowflake' ? '❄️' : habit.icon === 'dumbbell' ? '💪' : '✨'}
                                    </Text>
                                </View>
                                <View>
                                    <Text style={[styles.habitName, { color: textColor }]}>{habit.name}</Text>
                                    <Text style={[styles.habitStreak, { color: subTextColor }]}>{habit.streak} Day Streak</Text>
                                </View>
                            </View>
                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleRestore(habit)} style={[styles.actionButton, { backgroundColor: backButtonBg }]}>
                                    <RotateCcw color="#2dd4bf" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(habit)} style={[styles.actionButton, { backgroundColor: backButtonBg }]}>
                                    <Trash2 color="#ef4444" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    habitName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    habitStreak: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    }
});

export default ArchivedHabitsScreen;
