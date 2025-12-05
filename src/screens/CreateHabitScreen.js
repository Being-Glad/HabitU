import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform } from 'react-native';
import { X, Check, Star, Heart, Zap, Coffee, Book, Music, Dumbbell, Briefcase, Home, Smile, Sun, Moon, Cloud, Droplets, Flame, Award, Target, Flag, Clock, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconPicker from '../components/IconPicker';
import { getIcon } from '../utils/iconMap';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];

import { useHabits } from '../context/HabitContext';

const CreateHabitScreen = ({ visible, onClose, onSave }) => {
    const { settings } = useHabits();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('star');
    const [selectedColor, setSelectedColor] = useState('#10b981');
    const [frequency, setFrequency] = useState('daily');
    const [selectedDays, setSelectedDays] = useState([]);
    const [interval, setInterval] = useState('2');
    const [selectedCategory, setSelectedCategory] = useState('Health');
    const [habitType, setHabitType] = useState('binary');
    const [goal, setGoal] = useState('');
    const [unit, setUnit] = useState('');
    const [reminderTime, setReminderTime] = useState(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isIconPickerVisible, setIconPickerVisible] = useState(false);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : '#18181b';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const inputBg = isLight ? '#f4f4f5' : '#27272a';
    const borderColor = isLight ? '#e4e4e7' : '#3f3f46';
    const closeButtonBg = isLight ? '#f4f4f5' : '#27272a';

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name,
            description,
            icon: selectedIcon,
            color: selectedColor,
            category: selectedCategory,
            type: habitType,
            goal: habitType === 'numeric' ? parseFloat(goal) : 1,
            unit: habitType === 'numeric' ? unit : '',
            frequency: {
                type: frequency,
                days: frequency === 'weekly' ? selectedDays : [],
                interval: frequency === 'interval' ? parseInt(interval) : 1,
                startDate: new Date().toISOString()
            },
            reminders: reminderTime ? [reminderTime.toISOString()] : []
        });
        // Reset form
        setName('');
        setDescription('');
        setSelectedIcon('star');
        setSelectedColor('#10b981');
        setFrequency('daily');
        setSelectedDays([]);
        setInterval('2');
        setSelectedCategory('Health');
        setHabitType('binary');
        setGoal('');
        setUnit('');
        setReminderTime(null);
        onClose();
    };

    const onTimeChange = (event, selectedDate) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setReminderTime(selectedDate);
        }
    };

    const renderIcon = (iconName, size = 24, color = '#fff') => {
        const IconComponent = {
            star: Star, heart: Heart, zap: Zap, coffee: Coffee, book: Book, music: Music,
            dumbbell: Dumbbell, briefcase: Briefcase, home: Home, smile: Smile, sun: Sun,
            moon: Moon, cloud: Cloud, droplets: Droplets, flame: Flame, award: Award,
            target: Target, flag: Flag
        }[iconName] || Star;
        return <IconComponent size={size} color={color} />;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={[styles.content, { backgroundColor }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: textColor }]}>Create Habit</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg }]}>
                            <X color={subTextColor} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                                placeholder="e.g., Morning Meditation"
                                placeholderTextColor={subTextColor}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor, color: textColor }]}
                                placeholder="Why do you want to build this habit?"
                                placeholderTextColor={subTextColor}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Icon</Text>
                            <TouchableOpacity
                                style={[styles.selector, { backgroundColor: inputBg, borderColor }]}
                                onPress={() => setIconPickerVisible(true)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <View style={[styles.iconPreview, { borderColor: textColor }]}>
                                        <Text style={{ fontSize: 24 }}>{getIcon(selectedIcon)}</Text>
                                    </View>
                                    <Text style={[styles.selectorText, { color: textColor }]}>Select Icon</Text>
                                </View>
                                <ChevronRight color={subTextColor} size={20} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Color</Text>
                            <View style={styles.grid}>
                                {COLORS.map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorButton,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.selectedColor
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    >
                                        {selectedColor === color && <Check color="#000" size={16} />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Frequency</Text>
                            <View style={styles.frequencyContainer}>
                                {['daily', 'weekly', 'interval'].map(freq => (
                                    <TouchableOpacity
                                        key={freq}
                                        style={[
                                            styles.freqButton,
                                            { backgroundColor: inputBg, borderColor },
                                            frequency === freq && { backgroundColor: selectedColor, borderColor: selectedColor }
                                        ]}
                                        onPress={() => setFrequency(freq)}
                                    >
                                        <Text style={[
                                            styles.freqText,
                                            { color: subTextColor },
                                            frequency === freq && { color: '#000', fontWeight: 'bold' }
                                        ]}>
                                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {frequency === 'weekly' && (
                                <View style={styles.daysContainer}>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <TouchableOpacity
                                            key={day}
                                            style={[
                                                styles.dayButton,
                                                { backgroundColor: inputBg, borderColor },
                                                selectedDays.includes(day) && { backgroundColor: selectedColor, borderColor: selectedColor }
                                            ]}
                                            onPress={() => {
                                                if (selectedDays.includes(day)) {
                                                    setSelectedDays(selectedDays.filter(d => d !== day));
                                                } else {
                                                    setSelectedDays([...selectedDays, day]);
                                                }
                                            }}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                { color: subTextColor },
                                                selectedDays.includes(day) && { color: '#000', fontWeight: 'bold' }
                                            ]}>{day.charAt(0)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {frequency === 'interval' && (
                                <View style={styles.intervalContainer}>
                                    <Text style={[styles.intervalLabel, { color: textColor }]}>Every</Text>
                                    <TextInput
                                        style={[styles.intervalInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                                        keyboardType="numeric"
                                        value={interval}
                                        onChangeText={setInterval}
                                        placeholder="3"
                                        placeholderTextColor={subTextColor}
                                    />
                                    <Text style={[styles.intervalLabel, { color: textColor }]}>Days</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                                {['Health', 'Fitness', 'Mindfulness', 'Work', 'Learning', 'Social', 'Finance', 'Other'].map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryButton,
                                            { backgroundColor: inputBg, borderColor },
                                            selectedCategory === cat && { backgroundColor: selectedColor, borderColor: selectedColor }
                                        ]}
                                        onPress={() => setSelectedCategory(cat)}
                                    >
                                        <Text style={[
                                            styles.categoryText,
                                            { color: subTextColor },
                                            selectedCategory === cat && { color: '#000', fontWeight: 'bold' }
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Habit Type</Text>
                            <View style={styles.typeContainer}>
                                <TouchableOpacity
                                    style={[styles.typeButton, { backgroundColor: inputBg, borderColor }, habitType === 'binary' && { backgroundColor: selectedColor, borderColor: selectedColor }]}
                                    onPress={() => setHabitType('binary')}
                                >
                                    <Text style={[styles.typeText, { color: subTextColor }, habitType === 'binary' && { color: '#000', fontWeight: 'bold' }]}>Yes/No</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeButton, { backgroundColor: inputBg, borderColor }, habitType === 'numeric' && { backgroundColor: selectedColor, borderColor: selectedColor }]}
                                    onPress={() => setHabitType('numeric')}
                                >
                                    <Text style={[styles.typeText, { color: subTextColor }, habitType === 'numeric' && { color: '#000', fontWeight: 'bold' }]}>Numeric</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {habitType === 'numeric' && (
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={[styles.label, { color: subTextColor }]}>Goal</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                                        placeholder="e.g. 2000"
                                        placeholderTextColor={subTextColor}
                                        keyboardType="numeric"
                                        value={goal}
                                        onChangeText={setGoal}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={[styles.label, { color: subTextColor }]}>Unit</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                                        placeholder="e.g. ml"
                                        placeholderTextColor={subTextColor}
                                        value={unit}
                                        onChangeText={setUnit}
                                    />
                                </View>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: subTextColor }]}>Reminders</Text>
                            <TouchableOpacity
                                style={[styles.reminderButton, { backgroundColor: inputBg, borderColor }]}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Clock color={subTextColor} size={20} />
                                <Text style={[styles.reminderText, { color: textColor }]}>
                                    {reminderTime
                                        ? reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : 'Set Reminder'}
                                </Text>
                                {reminderTime && (
                                    <TouchableOpacity onPress={() => setReminderTime(null)} style={{ marginLeft: 'auto' }}>
                                        <X color="#ef4444" size={20} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={reminderTime || new Date()}
                                    mode="time"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={[styles.footer, { backgroundColor, borderTopColor: borderColor }]}>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: name.trim() ? selectedColor : inputBg }]}
                            onPress={handleSave}
                            disabled={!name.trim()}
                        >
                            <Text style={[styles.saveButtonText, !name.trim() && { color: subTextColor }]}>
                                Create Habit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <IconPicker
                visible={isIconPickerVisible}
                currentIcon={selectedIcon}
                onSelect={(icon) => {
                    setSelectedIcon(icon);
                    setIconPickerVisible(false);
                }}
                onClose={() => setIconPickerVisible(false)}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '90%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    colorButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    freqButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    freqText: {
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        borderTopWidth: 1,
    },
    saveButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    reminderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    reminderText: {
        fontSize: 16,
        marginLeft: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    typeText: {
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    dayText: {
        fontSize: 12,
    },
    intervalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    intervalLabel: {
        fontSize: 16,
    },
    intervalInput: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        width: 60,
        textAlign: 'center',
        borderWidth: 1,
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
        fontWeight: '500',
    },
    iconPreview: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CreateHabitScreen;
