import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Platform, Linking, Alert, StatusBar } from 'react-native';
import { ArrowLeft, List, Palette, Archive, ArrowUpDown, Globe, Shield, Lock, Star, MessageSquare, ChevronRight, LogOut, User, Copy, HelpCircle, BookOpen, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GeneralSettingsScreen from './GeneralSettingsScreen';
import ArchivedHabitsScreen from './ArchivedHabitsScreen';
import ReorderHabitsScreen from './ReorderHabitsScreen';
import ThemeSettingsScreen from './ThemeSettingsScreen';
import LegalScreen from './LegalScreen';
import FAQScreen from './FAQScreen';
import ResourcesScreen from './ResourcesScreen';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import AnimatedPressable from '../components/AnimatedPressable';
import FadeInView from '../components/FadeInView';

const SettingsScreen = ({ onClose, onOpenArchive }) => {
    const { habits, importHabits } = useHabits();
    const { user, logout } = useAuth();
    const [currentScreen, setCurrentScreen] = useState('main'); // main, general, archived, reorder, theme, privacy, terms, faq, resources

    if (currentScreen === 'general') {
        return <GeneralSettingsScreen onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'archived') {
        return <ArchivedHabitsScreen onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'reorder') {
        return <ReorderHabitsScreen onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'theme') {
        return <ThemeSettingsScreen onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'privacy') {
        return <LegalScreen type="privacy" onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'terms') {
        return <LegalScreen type="terms" onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'faq') {
        return <FAQScreen onClose={() => setCurrentScreen('main')} />;
    }

    if (currentScreen === 'resources') {
        return <ResourcesScreen onClose={() => setCurrentScreen('main')} />;
    }

    const handleFeedback = () => {
        Linking.openURL('mailto:support@habitu.com?subject=HabitU Feedback');
    };

    const handleRate = () => {
        Alert.alert(
            "Rate HabitU",
            "If this app were on the App Store, this would take you there! \n\nThanks for using HabitU! ⭐⭐⭐⭐⭐",
            [{ text: "OK" }]
        );
    };

    const handleExport = async () => {
        Alert.alert(
            'Export Data',
            'How would you like to export your data?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Share via App', onPress: shareData },
                { text: 'Save to Device', onPress: saveToDevice }
            ]
        );
    };

    const getExportData = () => JSON.stringify(habits, null, 2);

    const shareData = async () => {
        try {
            const fileUri = FileSystem.cacheDirectory + 'habitu_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, getExportData());
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Export HabitU Data',
                UTI: 'public.json'
            });
        } catch (error) {
            Alert.alert('Export Failed', error.message || 'Unknown error occurred');
            console.error(error);
        }
    };

    const saveToDevice = async () => {
        if (Platform.OS === 'android') {
            try {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                    const data = getExportData();
                    const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                        permissions.directoryUri,
                        'habitu_backup.json',
                        'application/json'
                    );
                    await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
                    Alert.alert('Success', 'Backup saved successfully!');
                }
            } catch (e) {
                Alert.alert('Error', 'Failed to save to device');
                console.error(e);
            }
        } else {
            shareData();
        }
    };

    const handleImport = async () => {
        Alert.alert(
            'Overwrite Data?',
            'Importing a backup will completely replace your current habits and history. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await DocumentPicker.getDocumentAsync({
                                type: 'application/json',
                                copyToCacheDirectory: true
                            });

                            if (result.canceled) return;

                            const fileUri = result.assets[0].uri;
                            const content = await FileSystem.readAsStringAsync(fileUri);
                            const data = JSON.parse(content);

                            const success = await importHabits(data);
                            if (success) {
                                Alert.alert('Success', 'Habits imported successfully!');
                            } else {
                                Alert.alert('Error', 'Invalid backup file format.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to import data');
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const { settings } = useHabits();
    const currentTheme = settings.theme || 'dark';
    const accentColor = settings.accentColor || '#2dd4bf';

    const isLight = currentTheme === 'light';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';

    const getBackgroundColor = () => {
        switch (currentTheme) {
            case 'light': return '#ffffff';
            case 'midnight': return '#000000';
            case 'slate': return '#0f172a';
            case 'coffee': return '#1c1917';
            default: return '#0f0f0f';
        }
    };
    const backgroundColor = getBackgroundColor();

    const renderGridItem = (icon, label, onPress, color, index) => (
        <FadeInView delay={index * 50} duration={400} style={{ width: '47%' }}>
            <AnimatedPressable
                style={[styles.gridItem, { backgroundColor: cardColor, width: '100%' }]}
                onPress={onPress}
            >
                <View style={[styles.gridIcon, { backgroundColor: color + '20' }]}>
                    {icon}
                </View>
                <Text style={[styles.gridLabel, { color: textColor }]}>{label}</Text>
            </AnimatedPressable>
        </FadeInView>
    );

    const renderMenuItem = (icon, label, onPress, isLast = false) => (
        <AnimatedPressable
            style={[
                styles.menuItem,
                { borderBottomColor: borderColor },
                isLast && styles.lastMenuItem
            ]}
            onPress={onPress}
        >
            <View style={styles.menuItemLeft}>
                {icon}
                <Text style={[styles.menuItemLabel, { color: textColor }]}>{label}</Text>
            </View>
            <ChevronRight color={subTextColor} size={20} />
        </AnimatedPressable>
    );

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={[styles.header, { backgroundColor }]}>
                <View style={{ width: 24 }} />
                <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <LinearGradient
                    colors={isLight ? ['#f4f4f5', '#e4e4e7'] : ['#27272a', '#18181b']}
                    style={styles.profileCard}
                >
                    <View style={styles.profileInfo}>
                        <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                            <Text style={styles.avatarText}>
                                {user?.username ? user.username.substring(0, 2).toUpperCase() : (user?.name ? user.name.substring(0, 2).toUpperCase() : 'G')}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.profileName, { color: textColor }]}>
                                {user?.username || user?.name || 'Guest User'}
                            </Text>
                            <Text style={[styles.profileEmail, { color: subTextColor }]}>
                                {user?.isGuest ? 'Guest Mode' : (user?.email || 'Not logged in')}
                            </Text>
                            {user?.id && (
                                <TouchableOpacity onPress={async () => {
                                    await Clipboard.setStringAsync(user.id);
                                    Alert.alert("Copied", "User ID copied to clipboard");
                                }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Text style={{ color: subTextColor, fontSize: 12, marginRight: 4 }}>ID: {user.id.substring(0, 8)}...</Text>
                                    <Copy size={12} color={subTextColor} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    {!user?.isGuest && (
                        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                            <LogOut color={subTextColor} size={20} />
                        </TouchableOpacity>
                    )}
                </LinearGradient>

                <Text style={[styles.sectionHeader, { color: accentColor }]}>Customization</Text>
                <View style={styles.gridContainer}>
                    {renderGridItem(<Palette color={accentColor} size={28} />, "Theme", () => setCurrentScreen('theme'), accentColor, 0)}
                    {renderGridItem(<List color="#8b5cf6" size={28} />, "General", () => setCurrentScreen('general'), '#8b5cf6', 1)}
                    {renderGridItem(<Archive color="#f59e0b" size={28} />, "Archived", () => setCurrentScreen('archived'), '#f59e0b', 3)}
                    {renderGridItem(<ArrowUpDown color="#ec4899" size={28} />, "Reorder", () => setCurrentScreen('reorder'), '#ec4899', 4)}
                </View>

                <Text style={[styles.sectionHeader, { color: accentColor, marginTop: 24 }]}>Data & Support</Text>
                <View style={[styles.section, { backgroundColor: cardColor }]}>
                    {renderMenuItem(<Globe color={accentColor} size={20} />, "Data Export/Import", handleExport)}

                    {renderMenuItem(<Gift color={accentColor} size={20} />, "Support Development", async () => {
                        const { MonetizationService } = require('../services/MonetizationService');
                        await MonetizationService.openDonation();
                    })}
                    {renderMenuItem(<HelpCircle color={accentColor} size={20} />, "FAQ & Science", () => setCurrentScreen('faq'))}
                    {renderMenuItem(<Shield color={accentColor} size={20} />, "Privacy Policy", () => setCurrentScreen('privacy'))}
                    {renderMenuItem(<Lock color={accentColor} size={20} />, "Terms of Use", () => setCurrentScreen('terms'))}
                    {/* <Star color={accentColor} size={20} />, "Rate the app", handleRate */}
                    {/* Rate App hidden during GitHub Preview phase */}
                    {renderMenuItem(<MessageSquare color={accentColor} size={20} />, "Send feedback", handleFeedback, true)}
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>
        </View>
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
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
    },
    logoutButton: {
        padding: 8,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
        fontFamily: 'System',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    gridItem: {
        // width handled by parent FadeInView
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        aspectRatio: 1.2,
    },
    gridIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        borderRadius: 20,
        marginBottom: 32,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    versionText: {
        textAlign: 'center',
        color: '#52525b',
        marginTop: 20,
        marginBottom: 40,
    }
});

export default SettingsScreen;
