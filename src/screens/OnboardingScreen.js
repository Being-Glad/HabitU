import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TextInput, FlatList, LayoutAnimation, UIManager, Platform, Alert } from 'react-native';
import { ArrowRight, ArrowLeft, Check, Activity, BookOpen, Moon, Droplets, Briefcase } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';

import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';


import ScrollPicker from '../components/ScrollPicker';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
const AMPM = ['AM', 'PM'];

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const GOALS = [
    { id: 'health', label: 'Health & Fitness', icon: Activity, color: '#EF5350', habit: { name: 'Exercise', icon: 'activity', color: '#EF5350', category: 'Fitness' } },
    { id: 'mind', label: 'Mindfulness', icon: Moon, color: '#7E57C2', habit: { name: 'Meditate', icon: 'moon', color: '#7E57C2', category: 'Mindfulness' } },
    { id: 'learning', label: 'Learn Something', icon: BookOpen, color: '#FFA726', habit: { name: 'Read', icon: 'book', color: '#FFA726', category: 'Learning' } },
    { id: 'hydration', label: 'Drink Water', icon: Droplets, color: '#42A5F5', habit: { name: 'Drink Water', icon: 'droplet', color: '#42A5F5', category: 'Health', type: 'numeric', goal: 2000, unit: 'ml' } },
    { id: 'productivity', label: 'Productivity', icon: Briefcase, color: '#26A69A', habit: { name: 'Deep Work', icon: 'briefcase', color: '#26A69A', category: 'Work' } },
];

const OnboardingScreen = ({ onComplete }) => {
    const { addHabit } = useHabits();
    const [step, setStep] = useState(1);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [frequency, setFrequency] = useState(null);

    // ...



    const [selectedDays, setSelectedDays] = useState([]);
    const [weeklyCount, setWeeklyCount] = useState(3);

    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [wakeTime, setWakeTime] = useState('');
    const [bedTime, setBedTime] = useState('');

    const [customTimePicker, setCustomTimePicker] = useState(null); // { id, index, hour, minute, ampm }
    const [personalizationStep, setPersonalizationStep] = useState(0);
    const scrollViewRef = React.useRef(null);

    const [customAnswers, setCustomAnswers] = useState({});

    const GOAL_CONFIG = {
        health: {
            title: "Let's get moving.",
            subtitle: "Tailor your fitness plan.",
            fields: [
                { id: 'activity', label: 'Preferred Activity', type: 'select', options: ['Gym', 'Run', 'Yoga', 'Home Workout', 'Walk', 'Other'] },
                { id: 'duration', label: 'Duration', type: 'number', min: 5, max: 180, step: 5, unit: 'mins', defaultValue: 45 },
                { id: 'time', label: 'Preferred Time', type: 'time', placeholder: '07:00 AM' }
            ]
        },
        mind: {
            title: "Find your center.",
            subtitle: "Customize your mindfulness practice.",
            fields: [
                { id: 'activity', label: 'Practice Type', type: 'select', options: ['Meditate', 'Journal', 'Breathwork', 'Gratitude', 'Other'] },
                { id: 'duration', label: 'Duration', type: 'number', min: 5, max: 60, step: 5, unit: 'mins', defaultValue: 10 },
                { id: 'time', label: 'Preferred Time', type: 'time', placeholder: '08:00 AM' }
            ]
        },
        learning: {
            title: "Expand your mind.",
            subtitle: "What are you learning?",
            fields: [
                { id: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. Spanish, Coding, History' },
                { id: 'duration', label: 'Duration', type: 'number', min: 15, max: 240, step: 15, unit: 'mins', defaultValue: 30 },
                { id: 'time', label: 'Preferred Time', type: 'time', placeholder: '08:00 PM' }
            ]
        },
        productivity: {
            title: "Get things done.",
            subtitle: "Define your focus.",
            fields: [
                { id: 'focus', label: 'Focus Area', type: 'text', placeholder: 'e.g. Deep Work, Inbox Zero' },
                {
                    id: 'session',
                    type: 'time_range',
                    startLabel: 'Start Focus',
                    endLabel: 'End Focus',
                    startId: 'startTime',
                    endId: 'endTime'
                }
            ]
        }
    };



    const handleNext = () => {
        if (step === 1) {
            if (selectedGoal) {
                setStep(1.5);
            }
        } else if (step === 1.5) {
            // Validate inputs if needed
            if (selectedGoal === 'hydration' && !weight) return;
            // For others, maybe optional? Or require at least one?
            setStep(2);
        } else if (step === 2) {
            // Create the habit
            const goalData = GOALS.find(g => g.id === selectedGoal);
            if (goalData) {
                let habitFrequency = { type: frequency, days: [] };

                if (frequency === 'custom') {
                    habitFrequency = {
                        type: 'weekly',
                        days: selectedDays.length > 0 ? selectedDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    };
                } else if (frequency === 'weekly') {
                    habitFrequency = {
                        type: 'weekly',
                        days: [], // Empty means flexible
                        goal: weeklyCount
                    };
                }

                let finalHabit = { ...goalData.habit };

                // Apply customizations
                if (selectedGoal === 'hydration' && weight) {
                    const calculatedGoal = Math.round(parseInt(weight) * 35);
                    finalHabit.goal = calculatedGoal;
                    finalHabit.description = `Drink ${calculatedGoal}ml daily based on your weight (${weight}kg).`;
                    if (wakeTime && bedTime) {
                        finalHabit.description += `\nSuggested: Drink ~250ml every hour between ${wakeTime} and ${bedTime}.`;
                    }
                } else {
                    const answers = customAnswers;
                    const config = GOAL_CONFIG[selectedGoal];

                    if (config) {
                        // Customize Name
                        let activity = answers.activity;
                        if (activity === 'Other') activity = answers.activity_custom;

                        if (activity) finalHabit.name = activity;
                        if (answers.topic) finalHabit.name = `Learn ${answers.topic}`;
                        if (answers.focus) finalHabit.name = answers.focus;

                        // Customize Description
                        let desc = [];
                        if (answers.duration) desc.push(`Target: ${answers.duration} mins`);
                        if (answers.goal) desc.push(`Goal: ${answers.goal}`);
                        if (answers.time) desc.push(`Time: ${answers.time}`);

                        if (desc.length > 0) finalHabit.description = desc.join(' • ');

                        // If duration is numeric, maybe set it as a goal?
                        // For now, keep it simple (binary habit with description).
                        // Unless user wants numeric (e.g. pages).
                        if (answers.duration && !finalHabit.goal) {
                            // We could make it numeric, but "Duration" is usually a timer.
                            // Let's stick to description for now.
                        }
                    }
                }

                addHabit({
                    ...finalHabit,
                    frequency: habitFrequency
                });
                onComplete();
            }
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your main focus?</Text>
            <Text style={styles.subtitle}>Choose a goal to get started.</Text>

            <ScrollView style={styles.optionsList}>
                {GOALS.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoal === goal.id;
                    return (
                        <TouchableOpacity
                            key={goal.id}
                            style={[
                                styles.optionCard,
                                isSelected && { borderColor: goal.color, backgroundColor: `${goal.color}10` }
                            ]}
                            onPress={() => setSelectedGoal(goal.id)}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${goal.color}20` }]}>
                                <Icon color={goal.color} size={24} />
                            </View>
                            <Text style={[styles.optionText, isSelected && { color: goal.color }]}>{goal.label}</Text>
                            {isSelected && <Check color={goal.color} size={20} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const handleBack = () => {
        if (step === 1.5) {
            setStep(1);
            setSelectedGoal(null);
            setPersonalizationStep(0); // Reset animation
            setCustomAnswers({}); // Reset answers
            setWeight(''); setAge(''); setWakeTime(''); setBedTime(''); // Reset hydration
        } else if (step === 2) {
            setStep(1.5);
        }
    };

    // ... (rest of code)

    const openTimePicker = (fieldId, index) => {
        // Default to current time or 07:00 AM
        const now = new Date();
        let h = now.getHours();
        const m = Math.round(now.getMinutes() / 5) * 5;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'

        const currentVal = customAnswers[fieldId] || (fieldId === 'wake' ? wakeTime : (fieldId === 'bed' ? bedTime : null));

        let initialHour = String(h).padStart(2, '0');
        let initialMinute = String(m).padStart(2, '0');
        let initialAmPm = ampm;

        if (currentVal) {
            // Parse "07:00 AM"
            const [time, p] = currentVal.split(' ');
            const [hh, mm] = time.split(':');
            initialHour = hh;
            initialMinute = mm;
            initialAmPm = p;
        }

        setCustomTimePicker({
            id: fieldId,
            index,
            hour: initialHour,
            minute: initialMinute,
            ampm: initialAmPm
        });
    };

    const handleTimeSave = () => {
        if (!customTimePicker) return;
        const timeStr = `${customTimePicker.hour}:${customTimePicker.minute} ${customTimePicker.ampm}`;
        handleFieldUpdate(customTimePicker.id, timeStr, customTimePicker.index);
        setCustomTimePicker(null);
    };

    // Generic handler for all fields (Hydration + Others)
    const handleFieldUpdate = (fieldId, value, index) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // Update state
        if (selectedGoal === 'hydration') {
            if (fieldId === 'weight') setWeight(value);
            else if (fieldId === 'age') setAge(value);
            else if (fieldId === 'wake') setWakeTime(value);
            else if (fieldId === 'bed') setBedTime(value);
        } else {
            setCustomAnswers(prev => ({ ...prev, [fieldId]: value }));
        }

        // Advance step if this is the current step
        if (index === personalizationStep) {
            setPersonalizationStep(index + 1);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };





    const renderPersonalization = () => {
        let title = "";
        let subtitle = "";
        let fields = [];

        if (selectedGoal === 'hydration') {
            title = "Let's personalize it.";
            subtitle = "We'll calculate your daily water goal.";
            fields = [
                { id: 'weight', label: 'Weight', type: 'number', min: 40, max: 150, step: 1, unit: 'kg', value: weight || 70 },
                { id: 'age', label: 'Age', type: 'number', min: 10, max: 100, step: 1, unit: 'yrs', value: age || 25 },
                { id: 'time_range', label: 'Wake & Bed Time', type: 'time_range', wake: wakeTime, bed: bedTime }
            ];
        } else {
            const config = GOAL_CONFIG[selectedGoal];
            if (!config) return null;
            title = config.title;
            subtitle = config.subtitle;
            fields = config.fields;
        }

        return (
            <View style={styles.stepContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 150 }}
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {fields.map((field, index) => {
                        if (index > personalizationStep) return null;

                        return (
                            <View key={field.id} style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>{field.label}</Text>

                                {field.type === 'select' ? (
                                    <View>
                                        <View style={styles.chipContainer}>
                                            {field.options.map(opt => (
                                                <TouchableOpacity
                                                    key={opt}
                                                    style={[
                                                        styles.chip,
                                                        customAnswers[field.id] === opt && { backgroundColor: '#2dd4bf', borderColor: '#2dd4bf' }
                                                    ]}
                                                    onPress={() => handleFieldUpdate(field.id, opt, index)}
                                                >
                                                    <Text style={[
                                                        styles.chipText,
                                                        customAnswers[field.id] === opt && { color: '#000', fontWeight: 'bold' }
                                                    ]}>{opt}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {customAnswers[field.id] === 'Other' && (
                                            <TextInput
                                                style={[styles.input, { marginTop: 12 }]}
                                                placeholder="Type your own..."
                                                placeholderTextColor="#52525b"
                                                value={customAnswers[`${field.id}_custom`] || ''}
                                                onChangeText={(text) => setCustomAnswers(prev => ({ ...prev, [`${field.id}_custom`]: text }))}
                                            />
                                        )}
                                    </View>
                                ) : field.type === 'number' ? (
                                    <ScrollPicker
                                        min={field.min} max={field.max} step={field.step} unit={field.unit}
                                        value={selectedGoal === 'hydration' ? field.value : (customAnswers[field.id] || field.defaultValue)}
                                        onValueChange={(val) => handleFieldUpdate(field.id, val, index)}
                                    />
                                ) : field.type === 'time' ? (
                                    <TouchableOpacity
                                        style={styles.input}
                                        onPress={() => {
                                            console.log('Opening TimePicker for:', field.id);
                                            openTimePicker(field.id, index);
                                        }}
                                    >
                                        <Text style={{ color: customAnswers[field.id] ? '#fff' : '#52525b' }}>
                                            {customAnswers[field.id] || field.placeholder}
                                        </Text>
                                    </TouchableOpacity>
                                ) : field.type === 'time_range' ? (
                                    <View style={styles.row}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={styles.inputLabel}>{field.startLabel || 'Wake Up'}</Text>
                                            <TouchableOpacity
                                                style={styles.input}
                                                onPress={() => openTimePicker(field.startId || 'wake', index)}
                                            >
                                                <Text style={{ color: (field.startId ? customAnswers[field.startId] : wakeTime) ? '#fff' : '#52525b' }}>
                                                    {(field.startId ? customAnswers[field.startId] : wakeTime) || '07:00 AM'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={styles.inputLabel}>{field.endLabel || 'Bed Time'}</Text>
                                            <TouchableOpacity
                                                style={styles.input}
                                                onPress={() => openTimePicker(field.endId || 'bed', index)}
                                            >
                                                <Text style={{ color: (field.endId ? customAnswers[field.endId] : bedTime) ? '#fff' : '#52525b' }}>
                                                    {(field.endId ? customAnswers[field.endId] : bedTime) || '11:00 PM'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <TextInput
                                        style={styles.input}
                                        placeholder={field.placeholder}
                                        placeholderTextColor="#52525b"
                                        keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                                        value={customAnswers[field.id] || ''}
                                        onChangeText={(text) => handleFieldUpdate(field.id, text, index)}
                                        onSubmitEditing={() => handleFieldUpdate(field.id, customAnswers[field.id], index)}
                                    />
                                )}
                            </View>
                        );
                    })}

                    {selectedGoal === 'hydration' && personalizationStep >= 2 && weight && (
                        <View style={styles.calcResult}>
                            <Text style={styles.calcText}>
                                Recommended: <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>{Math.round(parseInt(weight) * 35)} ml</Text> / day
                            </Text>
                        </View>
                    )}
                </ScrollView>


            </View>
        );
    };

    const renderStep2 = () => {
        const goalData = GOALS.find(g => g.id === selectedGoal);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return (
            <View style={styles.stepContainer}>
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Text style={styles.title}>How often?</Text>
                    <Text style={styles.subtitle}>Commit to your new habit: {goalData?.habit.name}</Text>

                    <View style={styles.freqContainer}>
                        {['daily', 'weekly', 'custom'].map(freq => (
                            <View key={freq}>
                                <TouchableOpacity
                                    style={[
                                        styles.freqCard,
                                        frequency === freq && { borderColor: '#2dd4bf', backgroundColor: 'rgba(45, 212, 191, 0.1)' }
                                    ]}
                                    onPress={() => {
                                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                        setFrequency(freq);
                                        // Auto-scroll logic can remain or be adjusted if needed
                                    }}
                                >
                                    <Text style={[styles.freqTitle, frequency === freq && { color: '#2dd4bf' }]}>
                                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                    </Text>
                                    <Text style={styles.freqDesc}>
                                        {freq === 'daily' ? 'Build a streak every day' : (freq === 'weekly' ? 'Flexible schedule' : 'Pick specific days')}
                                    </Text>
                                </TouchableOpacity>

                                {frequency === 'weekly' && freq === 'weekly' && (
                                    <View style={{ marginTop: 12, marginBottom: 20, paddingHorizontal: 10 }}>
                                        <Text style={[styles.inputLabel, { marginBottom: 12 }]}>Days per week</Text>
                                        <ScrollPicker
                                            min={1} max={7} step={1} unit="days"
                                            value={weeklyCount}
                                            onValueChange={setWeeklyCount}
                                        />
                                    </View>
                                )}

                                {frequency === 'custom' && freq === 'custom' && (
                                    <View style={styles.daysContainer}>
                                        {days.map(day => (
                                            <TouchableOpacity
                                                key={day}
                                                style={[
                                                    styles.dayButton,
                                                    selectedDays.includes(day) && { backgroundColor: '#2dd4bf', borderColor: '#2dd4bf' }
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
                                                    selectedDays.includes(day) && { color: '#000', fontWeight: 'bold' }
                                                ]}>{day.charAt(0)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        );
    };

    const isStepValid = () => {
        if (step === 1) return !!selectedGoal;

        if (step === 1.5) {
            if (selectedGoal === 'hydration') {
                return weight && age && wakeTime && bedTime;
            }

            const config = GOAL_CONFIG[selectedGoal];
            if (!config) return false;

            return config.fields.every(field => {
                if (field.type === 'time_range') {
                    const start = field.startId ? customAnswers[field.startId] : wakeTime;
                    const end = field.endId ? customAnswers[field.endId] : bedTime;
                    return start && end;
                }
                if (field.type === 'number') {
                    // Number fields usually have defaults, but if not, check value
                    const val = customAnswers[field.id];
                    return val !== undefined && val !== null && val !== '';
                }
                // Text, Select, Time
                return customAnswers[field.id] && customAnswers[field.id] !== '';
            });
        }

        if (step === 2) {
            if (frequency === 'custom') return selectedDays.length > 0;
            return true; // Daily and Weekly (with default count) are always valid
        }

        return false;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {step > 1 ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} /> // Spacer
                )}

                <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 2) * 100}%` }]} />
            </View>

            {step === 1 ? renderStep1() : (step === 1.5 ? renderPersonalization() : renderStep2())}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, !isStepValid() && styles.buttonDisabled]}
                    onPress={handleNext}
                    disabled={!isStepValid()}
                >
                    <Text style={styles.buttonText}>{step === 2 ? 'Start Journey' : 'Next'}</Text>
                    <ArrowRight color="#000" size={20} />
                </TouchableOpacity>
            </View>

            {customTimePicker && (
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerContainer}>
                        <Text style={styles.pickerTitle}>Select Time</Text>

                        <View style={styles.pickerRow}>
                            {/* Unified Highlight Bar */}
                            <View style={styles.pickerHighlightBar} pointerEvents="none" />

                            <ScrollPicker
                                options={HOURS}
                                value={customTimePicker.hour}
                                onValueChange={(val) => setCustomTimePicker(prev => ({ ...prev, hour: val }))}
                                containerStyle={{ width: 70 }}
                                showOverlay={false}
                            />
                            <Text style={styles.pickerColon}>:</Text>
                            <ScrollPicker
                                options={MINUTES}
                                value={customTimePicker.minute}
                                onValueChange={(val) => setCustomTimePicker(prev => ({ ...prev, minute: val }))}
                                containerStyle={{ width: 70 }}
                                showOverlay={false}
                            />
                            <View style={{ width: 20 }} />
                            <ScrollPicker
                                options={AMPM}
                                value={customTimePicker.ampm}
                                onValueChange={(val) => setCustomTimePicker(prev => ({ ...prev, ampm: val }))}
                                containerStyle={{ width: 70 }}
                                showOverlay={false}
                            />
                        </View>

                        <View style={styles.pickerActions}>
                            <TouchableOpacity style={styles.pickerButton} onPress={() => setCustomTimePicker(null)}>
                                <Text style={styles.pickerButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.pickerButton, { backgroundColor: '#2dd4bf' }]} onPress={handleTimeSave}>
                                <Text style={[styles.pickerButtonText, { color: '#000', fontWeight: 'bold' }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        paddingTop: 50,
    },
    header: {
        paddingHorizontal: 20,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    progressBar: {
        height: 4,
        backgroundColor: '#27272a',
        marginHorizontal: 20,
        borderRadius: 2,
        marginBottom: 40,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#26A69A',
        borderRadius: 2,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#a1a1aa',
        marginBottom: 32,
    },
    optionsList: {
        flex: 1,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18181b',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionText: {
        flex: 1,
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
    },
    freqContainer: {
        gap: 16,
    },
    freqCard: {
        backgroundColor: '#18181b',
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    freqTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    freqDesc: {
        color: '#a1a1aa',
        fontSize: 14,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    button: {
        backgroundColor: '#26A69A',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingHorizontal: 4,
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#a1a1aa',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#fff',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    calcResult: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        alignItems: 'center',
    },
    calcText: {
        color: '#fff',
        fontSize: 18,
    },

    // Custom Time Picker Styles
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    pickerContainer: {
        width: width - 40,
        backgroundColor: '#18181b',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    pickerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 24,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
        marginBottom: 24,
        position: 'relative', // For absolute positioning of highlight bar
    },
    pickerHighlightBar: {
        position: 'absolute',
        top: 150 / 2 - 22.5, // Center vertically (height/2 - itemHeight/2)
        left: 0,
        right: 0,
        height: 45,
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#2dd4bf',
        borderRadius: 8,
    },
    pickerColon: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginHorizontal: 10,
    },
    pickerActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    pickerButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#27272a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    chipText: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: '500',
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#27272a',
    },
    skipText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OnboardingScreen;
