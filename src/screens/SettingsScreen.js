import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, Platform, Linking, Alert, StatusBar, BackHandler, Modal, TextInput, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, List, Palette, Archive, ArrowUpDown, Globe, Shield, Lock, Star, MessageSquare, ChevronRight, LogOut, User, Copy, HelpCircle, BookOpen, Gift, Edit2, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GeneralSettingsScreen from './GeneralSettingsScreen';
import ArchivedHabitsScreen from './ArchivedHabitsScreen';
import ReorderHabitsScreen from './ReorderHabitsScreen';
import ThemeSettingsScreen from './ThemeSettingsScreen';
import DataSettingsScreen from './DataSettingsScreen';
import LegalScreen from './LegalScreen';
import FAQScreen from './FAQScreen';
import ResourcesScreen from './ResourcesScreen';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { useHabits } from '../context/HabitContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import AnimatedPressable from '../components/AnimatedPressable';
import FadeInView from '../components/FadeInView';

const SettingsScreen = ({ onClose, onOpenArchive }) => {
    const { habits, importHabits, resetApp, settings } = useHabits();
    const { user, logout, updateUsername } = useAuth();
    const { showAlert } = useAlert();
    const [currentScreen, setCurrentScreen] = useState('main'); // main, general, archived, reorder, theme, privacy, terms, faq, resources, data
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [newUsername, setNewUsername] = useState(user?.username || '');

    useEffect(() => {
        const backAction = () => {
            if (currentScreen !== 'main') {
                setCurrentScreen('main');
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [currentScreen]);

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

    if (currentScreen === 'data') {
        return <DataSettingsScreen onClose={() => setCurrentScreen('main')} />;
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

    const handleSaveProfile = async () => {
        if (newUsername.trim().length < 2) {
            showAlert("Invalid Username", "Username must be at least 2 characters long.");
            return;
        }
        await updateUsername(newUsername);
        setIsEditingProfile(false);
        showAlert("Success", "Profile updated successfully!");
    };


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
                {/* Profile Card Redesign */}
                <LinearGradient
                    colors={isLight ? ['#f4f4f5', '#e4e4e7'] : ['#27272a', '#18181b']}
                    style={styles.profileCard}
                >
                    <View style={[styles.avatar, { backgroundColor: accentColor, width: 80, height: 80, borderRadius: 40, marginBottom: 16 }]}>
                        <Text style={[styles.avatarText, { fontSize: 32 }]}>
                            {user?.username ? user.username.substring(0, 2).toUpperCase() : (user?.name ? user.name.substring(0, 2).toUpperCase() : 'G')}
                        </Text>
                        {!user?.isGuest && (
                            <TouchableOpacity
                                style={[styles.editBadge, { backgroundColor: cardColor }]}
                                onPress={() => {
                                    setNewUsername(user?.username || '');
                                    setIsEditingProfile(true);
                                }}
                            >
                                <Edit2 size={14} color={textColor} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={[styles.profileName, { color: textColor, fontSize: 22, textAlign: 'center' }]}>
                        {user?.username || user?.name || 'Guest User'}
                    </Text>

                    <Text style={[styles.profileEmail, { color: subTextColor, textAlign: 'center', marginBottom: 16 }]}>
                        {user?.isGuest ? 'Guest Mode' : (user?.email || 'Not logged in')}
                    </Text>

                    {user?.id && (
                        <TouchableOpacity onPress={async () => {
                            await Clipboard.setStringAsync(user.id);
                            Alert.alert("Copied", "User ID copied to clipboard");
                        }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isLight ? '#ffffff' : '#000000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                            <Text style={{ color: subTextColor, fontSize: 12, marginRight: 6, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                                ID: {user.id.substring(0, 8)}...
                            </Text>
                            <Copy size={12} color={subTextColor} />
                        </TouchableOpacity>
                    )}

                    {!user?.isGuest && (
                        <TouchableOpacity onPress={logout} style={[styles.logoutButton, { marginTop: 20 }]}>
                            <LogOut color={"#ef4444"} size={20} />
                            <Text style={{ color: "#ef4444", fontWeight: '600', marginLeft: 8 }}>Log Out</Text>
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
                    {renderMenuItem(<Globe color={accentColor} size={20} />, "Data Management", () => setCurrentScreen('data'))}

                    {renderMenuItem(<Gift color={accentColor} size={20} />, "Support Development", async () => {
                        const { MonetizationService } = require('../services/MonetizationService');
                        await MonetizationService.openDonation();
                    })}
                    {renderMenuItem(<HelpCircle color={accentColor} size={20} />, "FAQ & Science", () => setCurrentScreen('faq'))}
                    {renderMenuItem(<Shield color={accentColor} size={20} />, "Privacy Policy", () => setCurrentScreen('privacy'))}
                    {renderMenuItem(<Lock color={accentColor} size={20} />, "Terms of Use", () => setCurrentScreen('terms'))}
                    {renderMenuItem(<MessageSquare color={accentColor} size={20} />, "Send feedback", handleFeedback, true)}
                </View>

                <Text style={styles.versionText}>Version 1.0.0</Text>
            </ScrollView>

            <Modal
                visible={isEditingProfile}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditingProfile(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContentWrapper}>
                        <View style={[styles.modalContent, { backgroundColor: cardColor }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: textColor }]}>Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditingProfile(false)}>
                                    <X color={subTextColor} size={24} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.inputLabel, { color: subTextColor }]}>Username</Text>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: borderColor, backgroundColor: isLight ? '#fff' : '#000' }]}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                placeholder="Enter username"
                                placeholderTextColor={subTextColor}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: accentColor }]}
                                onPress={handleSaveProfile}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
        paddingBottom: 120, // Added padding for bottom navbar
    },
    profileCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        alignItems: 'center',
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    profileName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContentWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        marginBottom: 24,
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default SettingsScreen;
