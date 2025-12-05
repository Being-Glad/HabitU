import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const LEGAL_TEXT = {
    privacy: {
        title: 'Privacy Policy',
        content: `Last updated: December 2025

1. Introduction
Welcome to HabitU. We respect your privacy and are committed to protecting your personal data.

2. Data We Collect
We do not collect any personal data on our servers. All habit data is stored locally on your device.

3. Data Security
Your data is stored securely on your device using standard encryption provided by the operating system.

4. Contact Us
If you have any questions about this Privacy Policy, please contact us via the "Send Feedback" option.`
    },
    terms: {
        title: 'Terms of Use',
        content: `Last updated: December 2025

1. Acceptance of Terms
By accessing and using HabitU, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on HabitU for personal, non-commercial transitory viewing only.

3. Disclaimer
The materials on HabitU are provided "as is". HabitU makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.

4. Limitations
In no event shall HabitU be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on HabitU.`
    }
};

import { useHabits } from '../context/HabitContext';

const LegalScreen = ({ type, onClose }) => {
    const { settings } = useHabits();
    const data = LEGAL_TEXT[type] || LEGAL_TEXT.privacy;

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const backButtonBg = isLight ? '#f4f4f5' : '#27272a';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: backButtonBg }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>{data.title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.text, { color: subTextColor }]}>{data.content}</Text>
                <View style={{ height: 40 }} />
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
    text: {
        fontSize: 16,
        lineHeight: 24,
    }
});

export default LegalScreen;
