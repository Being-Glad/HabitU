import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Check, Lock } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { MonetizationService } from '../services/MonetizationService';
import { Alert } from 'react-native';

const ACCENT_COLORS = [
    { name: 'Teal', value: '#0d9488' }, // Darker Teal (700)
    { name: 'Blue', value: '#2563eb' }, // Darker Blue (600)
    { name: 'Purple', value: '#9333ea' }, // Darker Purple (600)
    { name: 'Rose', value: '#e11d48' }, // Darker Rose (600)
    { name: 'Orange', value: '#ea580c' }, // Darker Orange (600)
    { name: 'Green', value: '#16a34a' }, // Darker Green (600)
    { name: 'Yellow', value: '#ca8a04' }, // Darker Yellow/Gold (600)
    { name: 'Red', value: '#dc2626' }, // Darker Red (600)
    { name: 'Pink', value: '#db2777' }, // Darker Pink (600)
    { name: 'Indigo', value: '#4f46e5' }, // Darker Indigo (600)
    { name: 'Cyan', value: '#0891b2' }, // Darker Cyan (600)
    { name: 'Lime', value: '#65a30d' }, // Darker Lime (600)
    { name: 'Amber', value: '#d97706' }, // Darker Amber (600)
];

const BACKGROUND_THEMES = [
    { id: 'light', name: 'Light', value: '#ffffff' },
    { id: 'dark', name: 'Dark (Default)', value: '#0f0f0f' },
    { id: 'midnight', name: 'Midnight (OLED)', value: '#000000' },
    { id: 'slate', name: 'Slate', value: '#0f172a' },
    { id: 'coffee', name: 'Coffee', value: '#1c1917' },
];

const ThemeSettingsScreen = ({ onClose }) => {
    const { settings, updateSettings, unlockTheme, isThemeUnlocked, unlockedThemes } = useHabits();
    const currentAccent = settings.accentColor || '#2dd4bf';
    const currentTheme = settings.theme || 'dark';

    const isLight = currentTheme === 'light';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const backgroundColor = BACKGROUND_THEMES.find(t => t.id === currentTheme)?.value || '#0f0f0f';

    const handleAccentChange = (color, index) => {
        // First 5 accents are free (indexes 0-4)
        const isLocked = index >= 5 && !(unlockedThemes[color] && unlockedThemes[color] > Date.now());

        if (!isLocked) {
            updateSettings({ accentColor: color });
        } else {
            Alert.alert(
                "Premium Color Locked",
                "Share HabitU with a friend to unlock this color for 3 days!",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Share App",
                        onPress: async () => {
                            const success = await MonetizationService.unlockViaShare(color);
                            if (success) {
                                unlockTheme(color); // We reuse unlockTheme for accents
                                updateSettings({ accentColor: color });
                                Alert.alert("Unlocked!", "Color unlocked for 3 days. Enjoy!");
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleThemeChange = async (themeId) => {
        if (isThemeUnlocked(themeId)) {
            updateSettings({ theme: themeId });
        } else {
            Alert.alert(
                "Premium Theme Locked",
                "Share HabitU with a friend to unlock this theme for 3 days!",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Share App",
                        onPress: async () => {
                            const success = await MonetizationService.unlockViaShare(themeId);
                            if (success) {
                                unlockTheme(themeId);
                                updateSettings({ theme: themeId });
                                Alert.alert("Unlocked!", "Theme unlocked for 3 days. Enjoy!");
                            }
                        }
                    }
                ]
            );
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: cardColor }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Theme</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionHeader, { color: subTextColor }]}>Accent Color</Text>
                <View style={[styles.section, { backgroundColor: cardColor }]}>
                    <View style={styles.colorGrid}>
                        {ACCENT_COLORS.map((color, index) => {
                            const isLocked = index >= 5 && !(unlockedThemes[color] && unlockedThemes[color] > Date.now());
                            return (
                                <TouchableOpacity
                                    key={color.value}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color.value },
                                        currentAccent === color.value && [styles.selectedColor, { borderColor: textColor }]
                                    ]}
                                    onPress={() => handleAccentChange(color.value, index)}
                                >
                                    {isLocked && <Lock color="#fff" size={16} />}
                                    {currentAccent === color.value && !isLocked && <Check color="#fff" size={20} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: subTextColor }]}>Background</Text>
                <View style={[styles.section, { backgroundColor: cardColor }]}>
                    {BACKGROUND_THEMES.map((theme, index) => (
                        <View key={theme.id}>
                            <TouchableOpacity
                                style={styles.themeOption}
                                onPress={() => handleThemeChange(theme.id)}
                            >
                                <View style={[styles.themePreview, { backgroundColor: theme.value, borderColor }]} />
                                <Text style={[styles.themeLabel, { color: textColor }]}>{theme.name}</Text>
                                {!isThemeUnlocked(theme.id) && <Lock color={subTextColor} size={16} style={{ marginRight: 8 }} />}
                                {currentTheme === theme.id && <Check color={currentAccent} size={20} />}
                            </TouchableOpacity>
                            {index < BACKGROUND_THEMES.length - 1 && <View style={[styles.separator, { backgroundColor: borderColor }]} />}
                        </View>
                    ))}
                </View>
            </ScrollView>
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
    content: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    section: {
        borderRadius: 16,
        marginBottom: 32,
        padding: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'center',
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColor: {
        borderWidth: 3,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    themePreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 12,
    },
    themeLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        marginVertical: 4,
    }
});

export default ThemeSettingsScreen;
