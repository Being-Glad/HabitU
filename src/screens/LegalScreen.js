import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

const LEGAL_TEXT = {
    privacy: {
        title: 'Privacy Policy',
        content: `Last updated: December 2025

1. Introduction
Welcome to HabitU. We respect your privacy and are committed to protecting your personal data. This policy explains how we handle your information.

2. Data Collection & Storage
- NO SERVER TRACKING: HabitU does not collect, store, or transmit your personal habit data to our servers.
- LOCAL FIRST: All your habit logs and statistics are stored locally on your device.
- SYNCING: If you choose to sign in, your data is synced effectively to your own cloud account (e.g., Firebase) for backup purposes. We do not sell or analyze your personal habit data.

3. Third-Party Services
- Authentication: We use secure third-party services (like Google) solely for sign-in purposes.
- Analytics/Ads: We may use standard aggregated analytics to improve app performance and display advertisements.

4. Your Rights
You have full control over your data. You can delete your account and local data at any time through the app settings.`
    },
    terms: {
        title: 'Terms of Use',
        content: `Last updated: December 2025

1. Acceptance of Terms
By downloading or using HabitU, you agree to these terms. If you do not agree, please do not use the application.

2. License (Personal Use)
Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use HabitU for your personal, non-commercial use on a device that you own or control.
All rights, title, and interest in and to the App (excluding user content) are and will remain the exclusive property of HabitU and its licensors.

3. User Responsibilities
You are responsible for maintaining the security of your device and your data. You agree not to reverse engineer, decompile, or attempt to extract the source code of the software.

4. Disclaimer
HabitU is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or uninterrupted. We are not liable for any data loss.`
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
