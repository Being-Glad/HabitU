import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Save, GripVertical } from 'lucide-react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useHabits } from '../context/HabitContext';

const ReorderHabitsScreen = ({ onClose }) => {
    const { habits, reorderHabits, settings } = useHabits();
    const [localHabits, setLocalHabits] = useState([]);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const backButtonBg = isLight ? '#f4f4f5' : '#27272a';
    const accentColor = settings.accentColor || '#2dd4bf';

    useEffect(() => {
        // Filter out archived habits for reordering
        setLocalHabits(habits.filter(h => !h.archived));
    }, [habits]);

    const moveUp = (index) => {
        if (index === 0) return;
        const newHabits = [...localHabits];
        [newHabits[index - 1], newHabits[index]] = [newHabits[index], newHabits[index - 1]];
        setLocalHabits(newHabits);
    };

    const moveDown = (index) => {
        if (index === localHabits.length - 1) return;
        const newHabits = [...localHabits];
        [newHabits[index + 1], newHabits[index]] = [newHabits[index], newHabits[index + 1]];
        setLocalHabits(newHabits);
    };

    const handleSave = () => {
        const archivedHabits = habits.filter(h => h.archived);
        const finalHabits = [...localHabits, ...archivedHabits];

        reorderHabits(finalHabits);
        onClose();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: backButtonBg }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Reorder Habits</Text>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Save color="#000" size={20} />
                    <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={[styles.subtitle, { color: subTextColor }]}>Long press to drag and reorder.</Text>

                <DraggableFlatList
                    data={localHabits}
                    onDragEnd={({ data }) => setLocalHabits(data)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, drag, isActive, getIndex }) => (
                        <TouchableOpacity
                            onLongPress={drag}
                            disabled={isActive}
                            style={[
                                styles.item,
                                { backgroundColor: isActive ? accentColor : cardColor },
                                isActive && { transform: [{ scale: 1.05 }], shadowOpacity: 0.2 }
                            ]}
                        >
                            <View style={styles.itemContent}>
                                <Text style={[styles.habitName, { color: isActive ? '#000' : textColor }]}>
                                    <Text style={{ color: isActive ? '#000' : subTextColor, marginRight: 8 }}>{getIndex() + 1}. </Text>
                                    {item.name}
                                </Text>
                                <GripVertical color={isActive ? '#000' : subTextColor} size={24} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2dd4bf',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    saveText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    subtitle: {
        marginBottom: 24,
        textAlign: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    itemContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    habitName: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ReorderHabitsScreen;
