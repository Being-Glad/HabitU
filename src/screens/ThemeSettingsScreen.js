
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { Share2, Lock, Check, ArrowLeft } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { useAlert } from '../context/AlertContext';
import { MonetizationService } from '../services/MonetizationService';
import { Alert } from 'react-native';
import CelebrationModal from '../components/CelebrationModal';

const ACCENT_COLORS = [
    { name: 'Teal', value: '#26A69A' }, // Muted Teal
    { name: 'Blue', value: '#42A5F5' }, // Muted Blue
    { name: 'Purple', value: '#AB47BC' }, // Muted Purple
    { name: 'Rose', value: '#EC407A' }, // Muted Rose
    { name: 'Orange', value: '#FF7043' }, // Muted Orange
    { name: 'Green', value: '#66BB6A' }, // Muted Green
    { name: 'Yellow', value: '#FBC02D' }, // Muted Gold
    { name: 'Red', value: '#EF5350' }, // Muted Red
    { name: 'Pink', value: '#F06292' }, // Muted Pink
    { name: 'Indigo', value: '#5C6BC0' }, // Muted Indigo
    { name: 'Cyan', value: '#26C6DA' }, // Muted Cyan
    { name: 'Lime', value: '#9CCC65' }, // Muted Lime
    { name: 'Amber', value: '#FFA726' }, // Muted Amber
];

const BACKGROUND_THEMES = [
    { id: 'light', name: 'Light', value: '#ffffff', free: true },
    { id: 'dark', name: 'Dark (Default)', value: '#0f0f0f', free: true },
    { id: 'midnight', name: 'Midnight (OLED)', value: '#000000', free: false },
    { id: 'slate', name: 'Slate', value: '#0f172a', free: false },
    { id: 'coffee', name: 'Coffee', value: '#1c1917', free: false },
];

const ThemeSettingsScreen = ({ onClose }) => {
    const { settings, updateSettings, unlockTheme, isThemeUnlocked, unlockedThemes } = useHabits();
    const { showAlert } = useAlert();
    const currentAccent = settings.accentColor || '#2dd4bf';
    const currentTheme = settings.theme || 'dark';

    const isLight = currentTheme === 'light';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const backgroundColor = BACKGROUND_THEMES.find(t => t.id === currentTheme)?.value || '#0f0f0f';

    const [showCelebration, setShowCelebration] = React.useState(false);
    const [celebrationMessage, setCelebrationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAccentChange = (color, index) => {
        // First 5 accents are free (indexes 0-4)
        const isLocked = index >= 5 && !(unlockedThemes[color] && unlockedThemes[color] > Date.now());

        if (!isLocked) {
            updateSettings({ accentColor: color });
        } else {
            showAlert(
                "Premium Color Locked",
                "Share HabitU with a friend to unlock this color for 3 days!",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: isLoading ? "Verifying..." : "Share App",
                        onPress: async () => {
                            if (isLoading) return; // Prevent double tap

                            // 1. Start simulated "verification" UI
                            setIsLoading(true);

                            // 2. Perform Share
                            // We need to run this WITHOUT blocking the UI thread ideally,
                            // but Share.share is async. The delay is inside the service now.
                            // However, we want the loader to show *after* user returns from share sheet?
                            // Actually, React Native pauses execution when share sheet opens.
                            // The delay in service happens AFTER return. So loader will spin then.

                            const success = await MonetizationService.unlockViaShare(color);

                            setIsLoading(false);

                            if (success) {
                                unlockTheme(color, ACCENT_COLORS[index].name);
                                updateSettings({ accentColor: color });

                                // 3. Celebration!
                                setCelebrationMessage("Color unlocked for 3 days. Enjoy!");
                                setShowCelebration(true);
                            }
                        }
                    }
                ]
            );
        }
    };

    const handleThemeChange = (themeId) => {
        const theme = BACKGROUND_THEMES.find(t => t.id === themeId);
        // Using isThemeUnlocked for consistency
        if (!theme.free && !isThemeUnlocked(themeId)) {
            showAlert(
                "Premium Theme Locked",
                "Unlock this premium theme by sharing the app with a friend!",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: isLoading ? "Verifying..." : "Share to Unlock",
                        onPress: async () => {
                            if (isLoading) return;
                            setIsLoading(true);

                            const success = await MonetizationService.unlockViaShare(themeId);

                            setIsLoading(false);

                            if (success) {
                                unlockTheme(themeId, theme.name);
                                setCelebrationMessage(`You've unlocked the ${theme.name} theme.`);
                                setShowCelebration(true);
                            }
                        }
                    }
                ]
            );
            return;
        }
        updateSettings({ theme: themeId });
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
                            const expiry = unlockedThemes[color.value];
                            const isLocked = index >= 5 && !(expiry && expiry > Date.now());

                            // Calculate remaining time
                            let remainingText = "";
                            if (!isLocked && index >= 5 && expiry) {
                                const diffHrs = (expiry - Date.now()) / (1000 * 60 * 60);
                                const diffDays = Math.ceil(diffHrs / 24);
                                remainingText = diffDays > 0 ? `${diffDays}d` : `${Math.ceil(diffHrs)}h`;
                            }

                            return (
                                <TouchableOpacity
                                    key={color.value}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color.value },
                                        currentAccent === color.value && [styles.selectedColor, { borderColor: textColor }]
                                    ]}
                                    onPress={() => handleAccentChange(color.value, index, color.name)}
                                >
                                    {isLocked && <Lock color="#fff" size={16} />}
                                    {!isLocked && remainingText ? (
                                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 }}>{remainingText}</Text>
                                    ) : (
                                        currentAccent === color.value && <Check color="#fff" size={20} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={[styles.sectionHeader, { color: subTextColor }]}>Background</Text>
                <View style={[styles.section, { backgroundColor: cardColor }]}>
                    {BACKGROUND_THEMES.map((theme, index) => {
                        const expiry = unlockedThemes[theme.id];
                        const isUnlocked = isThemeUnlocked(theme.id);

                        let remainingText = "";
                        // If it's a paid theme, unlocked, and has an expiry date
                        if (!theme.free && isUnlocked && expiry) {
                            const diffHrs = (expiry - Date.now()) / (1000 * 60 * 60);
                            const diffDays = Math.ceil(diffHrs / 24);
                            remainingText = diffDays > 0 ? `${diffDays}d` : `${Math.ceil(diffHrs)}h`;
                        }

                        return (
                            <View key={theme.id}>
                                <TouchableOpacity
                                    style={styles.themeOption}
                                    onPress={() => handleThemeChange(theme.id)}
                                >
                                    <View style={[styles.themePreview, { backgroundColor: theme.value, borderColor }]} />
                                    <Text style={[styles.themeLabel, { color: textColor }]}>{theme.name}</Text>

                                    {/* Status Icons/Text */}
                                    {!isUnlocked && <Lock color={subTextColor} size={16} style={{ marginRight: 8 }} />}

                                    {isUnlocked && remainingText ? (
                                        <Text style={{ color: currentAccent, fontSize: 13, fontWeight: '600', marginRight: 12 }}>{remainingText}</Text>
                                    ) : (
                                        currentTheme === theme.id && <Check color={currentAccent} size={20} />
                                    )}
                                </TouchableOpacity>
                                {index < BACKGROUND_THEMES.length - 1 && <View style={[styles.separator, { backgroundColor: borderColor }]} />}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <CelebrationModal
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
                message={celebrationMessage}
            />
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
        paddingBottom: 150,
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
