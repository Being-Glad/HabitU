import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Shield, Brain, Zap, Heart, Droplets, TrendingUp } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';

const FAQScreen = ({ onClose }) => {
    const { settings } = useHabits();
    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const accentColor = settings.accentColor || '#2dd4bf';

    const renderSection = (icon, title, content) => (
        <View style={[styles.section, { backgroundColor: cardColor }]}>
            <View style={styles.sectionHeader}>
                <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
                    {icon}
                </View>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: subTextColor }]}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: cardColor }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>FAQ & Science</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderSection(
                    <Brain color={accentColor} size={24} />,
                    "The Science of Habits",
                    "HabitU is built on the 'Seinfeld Strategy' (Don't Break the Chain) and the principle of Variable Rewards. \n\n1. Visual Cues: The heatmap and streak counters provide immediate visual feedback.\n2. Dopamine Loops: Leveling up and earning XP releases dopamine, reinforcing the habit loop.\n3. Friction Reduction: The interface is designed to make logging habits as fast as possible."
                )}

                {renderSection(
                    <TrendingUp color={accentColor} size={24} />,
                    "What is 'Habit Strength'?",
                    "Habit Strength is a Consistency Score based on your last 30 days of activity. It's not just a streak count! \n\nRecent days count 1.5x more than older days. This means if you miss a day after a long streak, your strength won't drop to zero instantly—but consistency is key to getting it to 100%."
                )}

                {renderSection(
                    <Zap color={accentColor} size={24} />,
                    "Widgets & Home Screen",
                    "HabitU comes with beautiful Direct Touch widgets.\n\nTo add a widget:\n1. Long press your home screen.\n2. Select 'Widgets' -> 'HabitU'.\n3. Drag a widget (Grid, List, or Summary) to your screen.\n4. Tap the widget to configure which habit it tracks.\n\nTroubleshooting: If a widget appears transparent or black, please restart the app to refresh the rendering engine."
                )}

                {renderSection(
                    <Shield color={accentColor} size={24} />,
                    "Data Privacy & Sync",
                    "Your privacy is paramount. \n\n• Guest Mode: Data is stored locally on your device.\n• Auto-Save: Every change is instantly saved to your secure local storage to prevent data loss.\n• Cloud Sync: Sign in to sync your habits across devices. We never sell your personal data."
                )}

                {renderSection(
                    <Droplets color={accentColor} size={24} />,
                    "Why track Water & Metrics?",
                    "Hydration isn't just about thirst. Scientific studies show that even mild dehydration (1-3%) can impair energy levels and mood. \n\nHabitU's numeric tracking helps you visualize your intake against daily goals, turning abstract health advice into concrete, actionable data points."
                )}

                {renderSection(
                    <Heart color={accentColor} size={24} />,
                    "Streaks Explained",
                    "A streak is a chain of consecutive days where you completed your habit. \n\n• Daily Habits: Must be done every day.\n• Flexible Habits: If you select specific days (e.g., Mon/Wed/Fri), your streak continues as long as you hit those targets. Rest days don't break your streak!"
                )}

                <Text style={[styles.footerText, { color: subTextColor }]}>
                    Still have questions? Use the "Send feedback" option in Settings.
                </Text>
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
        fontFamily: 'System',
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    section: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 24,
    },
    footerText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        fontSize: 14,
    }
});

export default FAQScreen;
