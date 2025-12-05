import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Alert, Platform, StatusBar } from 'react-native';
import { ArrowLeft, ChevronRight, Calendar, Sun, Activity, Target, LayoutGrid, Type, List, Flame, Grid } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import AnimatedPressable from '../components/AnimatedPressable';

const GeneralSettingsScreen = ({ onClose }) => {
    const { settings, updateSettings } = useHabits();
    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const accentColor = settings.accentColor || '#2dd4bf';

    const toggleSetting = (key) => {
        updateSettings({ [key]: !settings[key] });
    };

    const setWeekStart = () => {
        const newStart = settings.weekStart === 'Monday' ? 'Sunday' : 'Monday';
        updateSettings({ weekStart: newStart });
    };

    const renderToggleGridItem = (icon, label, key) => (
        <AnimatedPressable
            style={[styles.gridItem, { backgroundColor: cardColor }]}
            onPress={() => toggleSetting(key)}
        >
            <View style={[styles.gridHeader]}>
                <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
                    {icon}
                </View>
                <Switch
                    trackColor={{ false: isLight ? '#e4e4e7' : '#3f3f46', true: accentColor }}
                    thumbColor={settings[key] ? '#fff' : '#f4f3f4'}
                    onValueChange={() => toggleSetting(key)}
                    value={settings[key]}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
            </View>
            <Text style={[styles.gridLabel, { color: textColor }]}>{label}</Text>
        </AnimatedPressable>
    );

    const renderPreferenceItem = (icon, label, value, onPress, isSwitch = false, switchKey = null) => (
        <AnimatedPressable
            style={[styles.preferenceRow, { borderBottomColor: borderColor }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconContainerSmall, { backgroundColor: accentColor + '15' }]}>
                    {icon}
                </View>
                <Text style={[styles.settingLabel, { color: textColor }]}>{label}</Text>
            </View>
            {isSwitch ? (
                <Switch
                    trackColor={{ false: isLight ? '#e4e4e7' : '#3f3f46', true: accentColor }}
                    thumbColor={settings[switchKey] ? '#fff' : '#f4f3f4'}
                    onValueChange={() => toggleSetting(switchKey)}
                    value={settings[switchKey]}
                />
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.settingValue, { color: subTextColor }]}>{value}</Text>
                    <ChevronRight color={subTextColor} size={16} />
                </View>
            )}
        </AnimatedPressable>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <AnimatedPressable onPress={onClose} style={[styles.backButton, { backgroundColor: cardColor }]}>
                    <ArrowLeft color={textColor} size={24} />
                </AnimatedPressable>
                <Text style={[styles.headerTitle, { color: textColor }]}>General</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: accentColor }]}>PREFERENCES</Text>
                <View style={[styles.cardContainer, { backgroundColor: cardColor }]}>
                    {renderPreferenceItem(
                        <Calendar color={accentColor} size={18} />,
                        "Week Starts On",
                        settings.weekStart,
                        setWeekStart
                    )}
                    <View style={[styles.separator, { backgroundColor: borderColor }]} />
                    {renderPreferenceItem(
                        <Sun color={accentColor} size={18} />,
                        "Highlight Current Day",
                        null,
                        () => toggleSetting('highlightCurrentDay'),
                        true,
                        'highlightCurrentDay'
                    )}


                </View>

                {/* Layout Settings */}
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: accentColor, marginTop: 24 }]}>LAYOUT</Text>
                    <View style={[styles.cardContainer, { backgroundColor: cardColor, padding: 16 }]}>

                        {/* View Mode Selector */}
                        <Text style={[styles.settingLabel, { color: textColor, marginBottom: 12 }]}>View Options</Text>
                        <View style={[styles.segmentedControl, { marginBottom: 20 }]}>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    settings.viewMode === 'list' && { backgroundColor: accentColor }
                                ]}
                                onPress={() => updateSettings({ viewMode: 'list' })}
                            >
                                <List color={settings.viewMode === 'list' ? '#000' : textColor} size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    settings.viewMode === 'grid' && { backgroundColor: accentColor }
                                ]}
                                onPress={() => updateSettings({ viewMode: 'grid' })}
                            >
                                <Grid color={settings.viewMode === 'grid' ? '#000' : textColor} size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    settings.viewMode === 'streak' && { backgroundColor: accentColor }
                                ]}
                                onPress={() => updateSettings({ viewMode: 'streak' })}
                            >
                                <Flame color={settings.viewMode === 'streak' ? '#000' : textColor} size={20} />
                            </TouchableOpacity>
                        </View>

                        {/* Card Style Selector */}
                        <Text style={[styles.settingLabel, { color: textColor, marginBottom: 12 }]}>Home Screen Card Layout</Text>
                        <View style={styles.segmentedControl}>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    settings.cardStyle === 'heatmap' && { backgroundColor: accentColor }
                                ]}
                                onPress={() => updateSettings({ cardStyle: 'heatmap' })}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: settings.cardStyle === 'heatmap' ? '#000' : textColor }
                                ]}>Detailed</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.segmentButton,
                                    settings.cardStyle === 'brief' && { backgroundColor: accentColor }
                                ]}
                                onPress={() => updateSettings({ cardStyle: 'brief' })}
                            >
                                <Text style={[
                                    styles.segmentText,
                                    { color: settings.cardStyle === 'brief' ? '#000' : textColor }
                                ]}>Compact</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: accentColor, marginTop: 24 }]}>DASHBOARD</Text>
                <View style={[styles.cardContainer, { backgroundColor: cardColor }]}>
                    {renderPreferenceItem(<Activity color={accentColor} size={18} />, "Show Streak Count", null, () => toggleSetting('showStreakCount'), true, 'showStreakCount')}
                    <View style={[styles.separator, { backgroundColor: borderColor }]} />
                    {renderPreferenceItem(<Target color={accentColor} size={18} />, "Show Streak Goal", null, () => toggleSetting('showStreakGoal'), true, 'showStreakGoal')}
                    <View style={[styles.separator, { backgroundColor: borderColor }]} />
                    {renderPreferenceItem(<LayoutGrid color={accentColor} size={18} />, "Show Month Labels", null, () => toggleSetting('showMonthLabels'), true, 'showMonthLabels')}
                    <View style={[styles.separator, { backgroundColor: borderColor }]} />
                    {renderPreferenceItem(<Type color={accentColor} size={18} />, "Show Day Labels", null, () => toggleSetting('showDayLabels'), true, 'showDayLabels')}
                </View>
            </ScrollView>
        </SafeAreaView >
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
        fontFamily: 'System',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
        fontFamily: 'System',
        opacity: 0.8,
    },
    cardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    preferenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    separator: {
        height: 1,
        marginLeft: 56, // Align with text start
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainerSmall: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    gridItem: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        gap: 12,
    },
    gridHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 4,
    },
    // New styles for Card Style selector
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 0.5,
        opacity: 0.7,
    },
    settingItem: {
        marginBottom: 16,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        padding: 4,
        marginTop: 8,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
export default GeneralSettingsScreen;
