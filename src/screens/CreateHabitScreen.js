import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useAlert } from '../context/AlertContext';
import { X, Check, Star, Heart, Zap, Coffee, Book, Music, Dumbbell, Briefcase, Home, Smile, Sun, Moon, Cloud, Droplets, Flame, Award, Target, Flag, Clock, ChevronRight, Plus, ArrowLeft, Brain, GlassWater, HelpCircle } from 'lucide-react-native';
import TimePickerModal from '../components/TimePickerModal';
import IconPicker from '../components/IconPicker';
import { getIcon } from '../utils/iconMap';
import { useHabits } from '../context/HabitContext';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const COLORS = [
    '#EF5350', // Muted Red
    '#FF7043', // Muted Orange
    '#FFA726', // Muted Amber
    '#9CCC65', // Muted Lime
    '#26A69A', // Muted Teal
    '#29B6F6', // Muted Light Blue
    '#5C6BC0', // Muted Indigo
    '#AB47BC', // Muted Purple
    '#EC407A', // Muted Pink
    '#78909C', // Blue Grey
    '#BDBDBD', // Grey
    '#8D6E63'  // Brown
];

const FOCUS_AREAS = [
    {
        id: 'health',
        title: 'Health & Fitness',
        icon: 'heart',
        color: '#EF5350',
        bg: 'rgba(239, 83, 80, 0.1)',
        habits: [
            { name: 'Morning Jog', icon: 'heart', color: '#EF5350' },
            { name: 'Gym Workout', icon: 'dumbbell', color: '#FF7043' },
            { name: 'Eat Vegetables', icon: 'sun', color: '#9CCC65' },
            { name: 'No Sugar', icon: 'flag', color: '#EF5350' },
            { name: 'Yoga', icon: 'sun', color: '#FFA726' },
        ]
    },
    {
        id: 'mindfulness',
        title: 'Mindfulness',
        icon: 'moon',
        color: '#7E57C2',
        bg: 'rgba(126, 87, 194, 0.1)',
        habits: [
            { name: 'Meditation', icon: 'moon', color: '#7E57C2' },
            { name: 'Deep Breathing', icon: 'cloud', color: '#29B6F6' },
            { name: 'Gratitude', icon: 'star', color: '#FFA726' },
        ]
    },
    {
        id: 'learn',
        title: 'Learn Something',
        icon: 'book',
        color: '#FFA726',
        bg: 'rgba(255, 167, 38, 0.1)',
        habits: [
            { name: 'Read Book', icon: 'book', color: '#FFA726' },
            { name: 'Learn Language', icon: 'flag', color: '#42A5F5' },
            { name: 'Study Code', icon: 'zap', color: '#26A69A' },
            { name: 'Practice Instrument', icon: 'music', color: '#EF5350' },
        ]
    },
    {
        id: 'water',
        title: 'Drink Water',
        icon: 'droplets',
        color: '#42A5F5',
        bg: 'rgba(66, 165, 245, 0.1)',
        preset: { name: 'Drink Water', icon: 'droplets', color: '#42A5F5', type: 'numeric', goal: 2000, unit: 'ml', category: 'Health' }
    },
    {
        id: 'productivity',
        title: 'Productivity',
        icon: 'briefcase',
        color: '#26A69A',
        bg: 'rgba(38, 166, 154, 0.1)',
        habits: [
            { name: 'Deep Work', icon: 'briefcase', color: '#26A69A' },
            { name: 'Plan Day', icon: 'target', color: '#009688' },
            { name: 'Inbox Zero', icon: 'briefcase', color: '#5C6BC0' },
            { name: 'Wake Up Early', icon: 'sun', color: '#FF7043' },
        ]
    },
    {
        id: 'custom',
        title: 'Custom',
        icon: 'plus',
        color: '#78909C',
        bg: 'rgba(120, 144, 156, 0.1)',
        isCustom: true
    }
];

const CreateHabitScreen = ({ visible, onClose, onSave }) => {
    const { settings, userProfile, updateUserProfile } = useHabits();

    // Steps: 'selection' -> 'suggestions' -> 'water-personalization' -> 'form'
    const [step, setStep] = useState('selection');
    const [selectedFocus, setSelectedFocus] = useState(null);

    // Form State
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
    const { addHabit } = useHabits();
    const { showAlert } = useAlert();
    const [reminderTime, setReminderTime] = useState(null);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isIconPickerVisible, setIconPickerVisible] = useState(false);

    // Water Personalization
    const [waterConfig, setWaterConfig] = useState({ weight: '', unit: 'kg', activity: 'normal' }); // activity: low, normal, high

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : '#18181b';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const inputBg = isLight ? '#f4f4f5' : '#27272a';
    const borderColor = isLight ? '#e4e4e7' : '#3f3f46';
    const closeButtonBg = isLight ? '#f4f4f5' : '#27272a';

    // Reset when modal opens/closes
    useEffect(() => {
        if (visible) {
            setStep('selection');
            resetForm();
            setWaterConfig({
                weight: userProfile?.weight ? String(userProfile.weight) : '',
                unit: userProfile?.unit || 'kg',
                activity: userProfile?.activity || 'normal'
            });
        }
    }, [visible]);

    const resetForm = () => {
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
        setSelectedFocus(null);
    };

    const handleFocusSelect = (focus) => {
        if (focus.isCustom) {
            resetForm();
            setStep('form');
        } else if (focus.preset) {
            // It's a preset (like Water)
            resetForm();
            setName(focus.preset.name);
            setSelectedIcon(focus.preset.icon);
            setSelectedColor(focus.preset.color);
            setSelectedCategory(focus.preset.category || 'Health');
            setHabitType(focus.preset.type || 'binary');
            setUnit(focus.preset.unit || '');

            if (focus.id === 'water') {
                if (userProfile?.weight) {
                    // Calculate based on existing profile
                    const weightInKg = userProfile.unit === 'lbs' ? userProfile.weight * 0.453592 : userProfile.weight;
                    const calculatedGoal = Math.round(weightInKg * 35); // 35ml per kg
                    setGoal(String(calculatedGoal));
                    // Alert user? Maybe just a visual cue or toast, but here we just pre-fill.
                    // We can add a "description" explaining the recommendation.
                    setDescription(`Recommended goal based on your weight of ${userProfile.weight}${userProfile.unit}.`);
                    setStep('form');
                } else {
                    // Need personalization
                    setStep('water-personalization');
                }
            } else {
                setGoal(focus.preset.goal ? String(focus.preset.goal) : '');
                setStep('form');
            }
        } else {
            // Show suggestions
            setSelectedFocus(focus);
            setStep('suggestions');
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const handleSuggestionSelect = (habit) => {
        resetForm();
        setName(habit.name);
        setSelectedIcon(habit.icon);
        setSelectedColor(habit.color);
        // Map focus title to category
        const mapCategory = {
            'health': 'Health',
            'fitness': 'Fitness',
            'mindfulness': 'Mindfulness',
            'learn': 'Learning',
            'productivity': 'Work' // or generic
        };
        const cat = mapCategory[selectedFocus.id] || selectedFocus.title.split(' ')[0]; // fallback
        setSelectedCategory(cat);

        setStep('form');
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

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
            target: Target, flag: Flag, plus: Plus
        }[iconName] || Star;
        return <IconComponent size={size} color={color} />;
    };

    const renderSelectionStep = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor, fontSize: 22 }]}>What's your focus?</Text>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg }]}>
                    <X color={subTextColor} size={24} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: subTextColor }]}>Choose a goal to get started.</Text>

            <View style={styles.focusList}>
                {FOCUS_AREAS.map((focus) => (
                    <TouchableOpacity
                        key={focus.id}
                        style={[styles.focusCard, { backgroundColor: inputBg, borderColor }]}
                        onPress={() => handleFocusSelect(focus)}
                    >
                        <View style={[styles.focusIcon, { backgroundColor: focus.bg }]}>
                            {renderIcon(focus.icon, 24, focus.color)}
                        </View>
                        <Text style={[styles.focusTitle, { color: textColor }]}>{focus.title}</Text>
                        <ChevronRight color={subTextColor} size={20} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const handleWaterPersonalizationNext = () => {
        if (!waterConfig.weight) return;

        const weight = parseFloat(waterConfig.weight);
        if (isNaN(weight) || weight <= 0) return;

        // Save to profile
        updateUserProfile({ weight, unit: waterConfig.unit, activity: waterConfig.activity });

        // Calculate goal
        const weightInKg = waterConfig.unit === 'lbs' ? weight * 0.453592 : weight;

        // Multiplier based on activity
        let multiplier = 35;
        if (waterConfig.activity === 'low') multiplier = 30; // Sedentary
        if (waterConfig.activity === 'high') multiplier = 40; // Active/Athlete

        const calculatedGoal = Math.round(weightInKg * multiplier);

        setGoal(String(calculatedGoal));
        setDescription(`Recommended goal based on your weight and activity level.`);
        setStep('form');
    };

    const renderWaterPersonalizationStep = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep('selection')} style={[styles.closeButton, { backgroundColor: closeButtonBg, marginRight: 12 }]}>
                    <ArrowLeft color={subTextColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor, flex: 1 }]}>Personalize Goal</Text>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg }]}>
                    <X color={subTextColor} size={24} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
                To recommend existing daily intake, we need a few details.
            </Text>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: subTextColor }]}>Your Weight</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TextInput
                        style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor, flex: 1 }]}
                        placeholder="0"
                        placeholderTextColor={subTextColor}
                        keyboardType="numeric"
                        value={waterConfig.weight}
                        onChangeText={(t) => setWaterConfig(prev => ({ ...prev, weight: t }))}
                        autoFocus
                    />
                    <View style={{ flexDirection: 'row', backgroundColor: inputBg, borderRadius: 12, padding: 4, borderColor, borderWidth: 1 }}>
                        {['kg', 'lbs'].map(u => (
                            <TouchableOpacity
                                key={u}
                                style={[
                                    { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
                                    waterConfig.unit === u && { backgroundColor: selectedColor }
                                ]}
                                onPress={() => setWaterConfig(prev => ({ ...prev, unit: u }))}
                            >
                                <Text style={[
                                    { color: subTextColor, fontWeight: '600' },
                                    waterConfig.unit === u && { color: '#000' }
                                ]}>{u.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={[styles.label, { color: subTextColor }]}>Activity Level</Text>
                <View style={{ gap: 8 }}>
                    {[
                        { id: 'low', label: 'Low', desc: 'Sedentary job, little exercise' },
                        { id: 'normal', label: 'Moderate', desc: 'Light activity or exercise 1-3x/week' },
                        { id: 'high', label: 'High', desc: 'Active job or lots of exercise' }
                    ].map(level => (
                        <TouchableOpacity
                            key={level.id}
                            style={[
                                { padding: 16, borderRadius: 16, borderWidth: 1, borderColor },
                                waterConfig.activity === level.id && { backgroundColor: selectedColor + '20', borderColor: selectedColor }
                            ]}
                            onPress={() => setWaterConfig(prev => ({ ...prev, activity: level.id }))}
                        >
                            <Text style={[
                                { fontSize: 16, fontWeight: '600', color: textColor },
                                waterConfig.activity === level.id && { color: selectedColor }
                            ]}>{level.label}</Text>
                            <Text style={{ fontSize: 13, color: subTextColor, marginTop: 4 }}>{level.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: waterConfig.weight ? selectedColor : inputBg, marginTop: 24 }]}
                onPress={handleWaterPersonalizationNext}
                disabled={!waterConfig.weight}
            >
                <Text style={[styles.saveButtonText, !waterConfig.weight && { color: subTextColor }]}>
                    Continue
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderSuggestionsStep = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep('selection')} style={[styles.closeButton, { backgroundColor: closeButtonBg, marginRight: 12 }]}>
                    <ArrowLeft color={subTextColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor, flex: 1 }]}>{selectedFocus?.title}</Text>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg }]}>
                    <X color={subTextColor} size={24} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: subTextColor }]}>Pick a habit to build.</Text>

            <View style={styles.focusList}>
                {selectedFocus?.habits?.map((habit, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.focusCard, { backgroundColor: inputBg, borderColor }]}
                        onPress={() => handleSuggestionSelect(habit)}
                    >
                        <View style={[styles.focusIcon, { backgroundColor: habit.color + '20' }]}>
                            {renderIcon(habit.icon, 24, habit.color)}
                        </View>
                        <Text style={[styles.focusTitle, { color: textColor }]}>{habit.name}</Text>
                        <Plus color={selectedColor} size={20} />
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[styles.focusCard, { backgroundColor: inputBg, borderColor, marginTop: 12, borderStyle: 'dashed', borderWidth: 1 }]}
                    onPress={() => {
                        resetForm();
                        setStep('form');
                    }}
                >
                    <View style={[styles.focusIcon, { backgroundColor: subTextColor + '20' }]}>
                        <Plus color={subTextColor} size={24} />
                    </View>
                    <Text style={[styles.focusTitle, { color: subTextColor }]}>Create Custom</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderFormStep = () => (
        <>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setStep('selection')} style={[styles.closeButton, { backgroundColor: closeButtonBg, marginRight: 12 }]}>
                    <ArrowLeft color={subTextColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: textColor }]}>Create Habit</Text>
                <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg }]}>
                    <X color={subTextColor} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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

                {/* Everything else is same as before */}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={[styles.label, { color: subTextColor, marginBottom: 0, marginRight: 8 }]}>Habit Type</Text>
                        <TouchableOpacity onPress={() => showAlert(
                            'Habit Types',
                            'Select the tracking method that best fits your goal:\n\n• Yes/No: Best for daily tasks like "Exercise" or "Meditation".\n\n• Numeric: Best for quantifiable goals like "Drink 2000ml Water" or "Read 10 Pages".',
                            [{ text: 'Understood' }]
                        )}>
                            <HelpCircle size={16} color={subTextColor} />
                        </TouchableOpacity>
                    </View>
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
                                <X color="#EF5350" size={20} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                    <TimePickerModal
                        visible={showTimePicker}
                        onClose={() => setShowTimePicker(false)}
                        onSave={(date) => {
                            setReminderTime(date);
                            setShowTimePicker(false);
                        }}
                        initialTime={reminderTime}
                    />
                </View>
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
        </>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={[styles.content, { backgroundColor }]}>
                    {step === 'selection' && renderSelectionStep()}
                    {step === 'suggestions' && renderSuggestionsStep()}
                    {step === 'water-personalization' && renderWaterPersonalizationStep()}
                    {step === 'form' && renderFormStep()}
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
        height: '92%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
    },

    // Focus List Styles
    focusList: {
        gap: 12,
    },
    focusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 4,
    },
    focusIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    focusTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },

    // Form Styles (Existing)
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
