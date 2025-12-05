import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, ScrollView, Switch, Platform, Modal, Alert } from 'react-native';
import { X, ChevronRight, Clock, Check, Calendar, Hash, Repeat } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconPicker from '../components/IconPicker';
import { useHabits } from '../context/HabitContext';
import { getIcon } from '../utils/iconMap';

const COLORS = [
    '#f87171', '#fb923c', '#fbbf24', '#facc15', '#4ade80', '#2dd4bf',
    '#34d399', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa',
    '#c084fc', '#e879f9', '#f472b6', '#fb7185'
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EditHabitScreen = ({ habit, visible, onClose }) => {
    const { updateHabit, settings } = useHabits();

    const [name, setName] = useState('');
    const [color, setColor] = useState('#2dd4bf');
    const [icon, setIcon] = useState('activity');
    const [reminderTime, setReminderTime] = useState(new Date());

    // Frequency State
    const [frequency, setFrequency] = useState('daily'); // daily, weekly, interval
    const [selectedDays, setSelectedDays] = useState([]); // 0-6 for weekly
    const [interval, setInterval] = useState('2'); // for interval

    // Goal State
    const [type, setType] = useState('binary'); // binary, numeric
    const [goal, setGoal] = useState('1');
    const [unit, setUnit] = useState('times');

    const [isIconPickerVisible, setIconPickerVisible] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : '#0f0f0f';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const inputBg = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const closeButtonColor = isLight ? '#000000' : '#ffffff';

    useEffect(() => {
        if (habit) {
            setName(habit.name);
            setColor(habit.color);
            setIcon(habit.icon);
            setReminderTime(habit.reminders?.[0] ? new Date(habit.reminders[0]) : new Date());

            setFrequency(habit.frequency || 'daily');
            setSelectedDays(habit.frequencyDays || []);
            setInterval(habit.frequencyInterval ? habit.frequencyInterval.toString() : '2');

            setType(habit.type || 'binary');
            setGoal(habit.goal ? habit.goal.toString() : '1');
            setUnit(habit.unit || 'times');
        }
    }, [habit]);

    if (!habit) return null;

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        const updates = {
            name,
            color,
            icon,
            reminders: [reminderTime.toISOString()],
            frequency,
            type,
        };

        if (frequency === 'weekly') {
            updates.frequencyDays = selectedDays;
        } else if (frequency === 'interval') {
            updates.frequencyInterval = parseInt(interval) || 2;
        }

        if (type === 'numeric') {
            updates.goal = parseInt(goal) || 1;
            updates.unit = unit;
        }

        updateHabit(habit.id, updates);
        onClose();
    };

    const onTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || reminderTime;
        setShowTimePicker(Platform.OS === 'ios');
        setReminderTime(currentDate);
    };

    const toggleDay = (index) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter(d => d !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <X color={closeButtonColor} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Edit Habit</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Name Section */}
                    <Text style={[styles.label, { color: textColor }]}>Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Habit Name"
                        placeholderTextColor={subTextColor}
                    />

                    {/* Frequency Section */}
                    <Text style={[styles.label, { color: textColor }]}>Frequency</Text>
                    <View style={[styles.segmentContainer, { backgroundColor: inputBg, borderColor }]}>
                        {['daily', 'weekly', 'interval'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                style={[
                                    styles.segmentButton,
                                    frequency === f && { backgroundColor: color }
                                ]}
                                onPress={() => setFrequency(f)}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: frequency === f ? '#000' : subTextColor, fontWeight: frequency === f ? 'bold' : 'normal' }
                                ]}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {frequency === 'weekly' && (
                        <View style={styles.daysContainer}>
                            {DAYS.map((day, index) => {
                                const isSelected = selectedDays.includes(index);
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayButton,
                                            { backgroundColor: isSelected ? color : inputBg, borderColor }
                                        ]}
                                        onPress={() => toggleDay(index)}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            { color: isSelected ? '#000' : subTextColor, fontWeight: isSelected ? 'bold' : 'normal' }
                                        ]}>{day}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {frequency === 'interval' && (
                        <View style={styles.intervalContainer}>
                            <Text style={{ color: textColor }}>Every</Text>
                            <TextInput
                                style={[styles.smallInput, { backgroundColor: inputBg, color: textColor, borderColor }]}
                                value={interval}
                                onChangeText={setInterval}
                                keyboardType="numeric"
                                maxLength={3}
                            />
                            <Text style={{ color: textColor }}>days</Text>
                        </View>
                    )}

                    {/* Goal Section */}
                    <Text style={[styles.label, { color: textColor, marginTop: 24 }]}>Goal Type</Text>
                    <View style={[styles.segmentContainer, { backgroundColor: inputBg, borderColor }]}>
                        {['binary', 'numeric'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.segmentButton,
                                    type === t && { backgroundColor: color }
                                ]}
                                onPress={() => setType(t)}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: type === t ? '#000' : subTextColor, fontWeight: type === t ? 'bold' : 'normal' }
                                ]}>
                                    {t === 'binary' ? 'Yes/No' : 'Numeric'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {type === 'numeric' && (
                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={[styles.label, { color: textColor }]}>Target</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor, marginBottom: 0 }]}
                                    value={goal}
                                    onChangeText={setGoal}
                                    keyboardType="numeric"
                                    placeholder="e.g. 5"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[styles.label, { color: textColor }]}>Unit</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor, marginBottom: 0 }]}
                                    value={unit}
                                    onChangeText={setUnit}
                                    placeholder="e.g. cups"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>
                        </View>
                    )}

                    {/* Reminder & Icon Section */}
                    <View style={[styles.row, { marginTop: 24 }]}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={[styles.label, { color: textColor }]}>Reminder</Text>
                            <TouchableOpacity style={[styles.selector, { backgroundColor: inputBg, borderColor }]} onPress={() => setShowTimePicker(true)}>
                                <Text style={[styles.selectorText, { color: textColor }]}>
                                    {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Clock color={subTextColor} size={20} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={[styles.label, { color: textColor }]}>Icon</Text>
                            <TouchableOpacity
                                style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
                                onPress={() => setIconPickerVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ fontSize: 20 }}>{getIcon(icon)}</Text>
                                    <Text style={[styles.selectorText, { color: textColor }]}>Icon</Text>
                                </View>
                                <ChevronRight color={subTextColor} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showTimePicker && (
                        <DateTimePicker
                            value={reminderTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onTimeChange}
                            themeVariant={isLight ? "light" : "dark"}
                        />
                    )}

                    {/* Color Section */}
                    <Text style={[styles.label, { color: textColor, marginTop: 24 }]}>Color</Text>
                    <View style={styles.colorGrid}>
                        {COLORS.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[
                                    styles.colorItem,
                                    { backgroundColor: c },
                                    color === c && [styles.selectedColor, { borderColor: textColor }]
                                ]}
                                onPress={() => setColor(c)}
                            >
                                {color === c && <View style={styles.colorDot} />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={[styles.footer, { borderTopColor: borderColor }]}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>

                <IconPicker
                    visible={isIconPickerVisible}
                    currentIcon={icon}
                    onSelect={(newIcon) => {
                        setIcon(newIcon);
                        setIconPickerVisible(false);
                    }}
                    onClose={() => setIconPickerVisible(false)}
                />
            </SafeAreaView>
        </Modal>
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
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selector: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    selectorText: {
        fontSize: 16,
    },
    segmentContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        marginBottom: 16,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
    },
    intervalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    smallInput: {
        width: 60,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlign: 'center',
        borderWidth: 1,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    colorItem: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 2,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    saveButton: {
        backgroundColor: '#22c55e',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default EditHabitScreen;
