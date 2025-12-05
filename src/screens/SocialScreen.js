
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert, Modal, Clipboard, Platform, Share, StatusBar } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Users, Search, LogOut, ArrowLeft, Plus, Share2, Trash2, Copy, Lock, Globe } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import LoginScreen from './LoginScreen';
import UsernameSetupScreen from './UsernameSetupScreen';
import AnimatedPressable from '../components/AnimatedPressable';
import FadeInView from '../components/FadeInView';

// League Definitions
const LEAGUES = [
    { id: 'titan', name: 'Titan League 👑', min: 100, colors: ['#f59e0b', '#b45309'], bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 'master', name: 'Master League ⚔️', min: 50, colors: ['#94a3b8', '#475569'], bg: 'rgba(148, 163, 184, 0.1)' },
    { id: 'elite', name: 'Elite League 🛡️', min: 30, colors: ['#b45309', '#78350f'], bg: 'rgba(180, 83, 9, 0.1)' },
    { id: 'apprentice', name: 'Apprentice League 🗡️', min: 7, colors: ['#4ade80', '#16a34a'], bg: 'rgba(74, 222, 128, 0.1)' },
    { id: 'novice', name: 'Novice League 🌱', min: 0, colors: ['#a1a1aa', '#52525b'], bg: 'rgba(161, 161, 170, 0.1)' },
];

const getLeague = (streak) => {
    return LEAGUES.find(l => streak >= l.min) || LEAGUES[LEAGUES.length - 1];
};

const getNextLeague = (streak) => {
    const currentLeagueIndex = LEAGUES.findIndex(l => streak >= l.min);
    if (currentLeagueIndex <= 0) return null; // Already at top
    return LEAGUES[currentLeagueIndex - 1];
};

const SocialScreen = ({ onClose }) => {
    const { user, logout, rivals, addRival, removeRival, generateShareCode, loading } = useAuth();
    const { getGlobalStats, exportData, settings } = useHabits(); // Get settings
    const [isAddRivalVisible, setAddRivalVisible] = useState(false);
    const [isShareVisible, setShareVisible] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [rivalCodeInput, setRivalCodeInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    // Theme Logic
    const currentTheme = settings.theme || 'dark';
    const currentAccent = settings.accentColor || '#2dd4bf';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const modalOverlayColor = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.8)';

    // Real-time Leaderboard
    const [leaderboardUsers, setLeaderboardUsers] = useState([]);

    useEffect(() => {
        if (!showLeaderboard) return;

        const unsubscribe = firestore()
            .collection('users')
            .orderBy('streak', 'desc')
            .limit(50)
            .onSnapshot(querySnapshot => {
                const users = [];
                querySnapshot.forEach(documentSnapshot => {
                    users.push({
                        ...documentSnapshot.data(),
                        id: documentSnapshot.id,
                    });
                });
                setLeaderboardUsers(users);
            }, error => {
                console.error("Leaderboard fetch error", error);
            });

        return () => unsubscribe();
    }, [showLeaderboard]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: subTextColor }}>Loading...</Text>
            </View>
        );
    }

    if (!user) {
        return <LoginScreen onClose={onClose} />;
    }

    if (!user.username) {
        return <UsernameSetupScreen />;
    }

    // Calculate User's Best Streak
    const { topHabits } = getGlobalStats();
    const myBestStreak = topHabits.length > 0 ? Math.max(...topHabits.map(h => h.streak)) : 0;
    const myLeague = getLeague(myBestStreak);
    const nextLeague = getNextLeague(myBestStreak);

    // Prepare Data
    // If leaderboard is active, use cloud data. Else use local rivals + me.
    const displayPlayers = showLeaderboard
        ? leaderboardUsers.map(u => ({
            ...u,
            name: u.username || 'Unknown',
            streak: u.streak || 0,
            color: u.id === user.id ? currentAccent : '#8b5cf6',
            avatar: (u.username || 'U').substring(0, 2).toUpperCase(),
            isMe: u.id === user.id,
            isRival: false // Cloud users aren't necessarily "rivals" in the friend sense
        }))
        : [
            { id: user.id, name: user.username + ' (You)', streak: myBestStreak, color: currentAccent, avatar: 'ME', isMe: true },
            ...(rivals || []).map(r => ({ ...r, color: '#8b5cf6', avatar: r.name.substring(0, 2).toUpperCase(), isRival: true }))
        ].sort((a, b) => b.streak - a.streak);

    // Group by League
    const groupedPlayers = LEAGUES.map(league => {
        const playersInLeague = displayPlayers.filter(p => getLeague(p.streak).id === league.id);
        return {
            ...league,
            players: playersInLeague
        };
    });

    const handleAddRival = async () => {
        if (!rivalCodeInput.trim()) return;

        const result = await addRival(rivalCodeInput.trim());
        if (result.success) {
            Alert.alert('Success', `Added ${result.rival.name} to your rivals!`);
            setAddRivalVisible(false);
            setRivalCodeInput('');
        } else {
            Alert.alert('Error', 'Invalid code. Please check and try again.');
        }
    };

    const handleShare = () => {
        const code = generateShareCode(myBestStreak);
        setGeneratedCode(code);
        setShareVisible(true);
    };

    const handleNativeShare = async () => {
        try {
            await Share.share({
                message: `Join me on HabitU! My Snapshot Code is: ${generatedCode}\n\nDownload the app here: https://github.com/ompandey/HabitU`,
                title: 'HabitU Invite'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const copyToClipboard = () => {
        Clipboard.setString(generatedCode);
        Alert.alert('Copied', 'Code copied to clipboard!');
    };

    const handleLogout = () => {
        if (user?.isGuest) {
            Alert.alert(
                "Guest Account",
                "You are using a Guest account. Your data will be lost if you logout without exporting. Do you want to export your data first?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout Anyway",
                        style: "destructive",
                        onPress: logout
                    },
                    {
                        text: "Export & Logout",
                        onPress: async () => {
                            const data = await exportData();
                            if (data) {
                                try {
                                    await Share.share({
                                        message: data,
                                        title: 'HabitU Backup'
                                    });
                                    // We don't auto-logout here to give them a chance to verify the share worked.
                                    // Or we can ask again? Let's just logout after share success?
                                    // Better UX: Let them share, then they can click logout again or we prompt "Did you save it?".
                                    // For simplicity, let's just share. If they want to logout, they can click "Logout Anyway" next time or we prompt.

                                    Alert.alert(
                                        "Export Complete",
                                        "Did you save your data successfully?",
                                        [
                                            { text: "No, Try Again", onPress: () => handleLogout() }, // Loop back
                                            { text: "Yes, Logout", style: 'destructive', onPress: logout }
                                        ]
                                    );
                                } catch (error) {
                                    Alert.alert("Export Error", "Failed to share data.");
                                }
                            }
                        }
                    }
                ]
            );
        } else {
            logout();
        }
    };

    const renderLeagueCard = () => (
        <FadeInView duration={600}>
            <LinearGradient
                colors={myLeague.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.leagueCard}
            >
                <View style={styles.leagueHeader}>
                    <Text style={styles.leagueTitle}>{myLeague.name}</Text>
                    <Text style={styles.leagueStreak}>{myBestStreak} Day Streak 🔥</Text>
                </View>
                {nextLeague && (
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${(myBestStreak / nextLeague.min) * 100}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{nextLeague.min - myBestStreak} days to {nextLeague.name}</Text>
                    </View>
                )}
                {!nextLeague && (
                    <Text style={styles.progressText}>You are at the top! 👑</Text>
                )}
            </LinearGradient>
        </FadeInView>
    );

    const renderLeaderboard = () => {
        // Always render, data source is handled by displayPlayers


        return (
            <View style={styles.listContainer}>
                {groupedPlayers.map((group) => (
                    <View key={group.id} style={styles.leagueSection}>
                        <Text style={[styles.sectionHeader, { color: group.colors[0] }]}>{group.name}</Text>
                        {group.players.length === 0 && (
                            <Text style={[styles.emptyLeagueText, { color: subTextColor }]}>No players yet</Text>
                        )}
                        {group.players.map((item, index) => (
                            <FadeInView key={item.id} delay={index * 50} duration={400}>
                                <View style={[
                                    styles.listItem,
                                    { backgroundColor: cardColor },
                                    item.isMe && { borderColor: currentAccent, borderWidth: 1, backgroundColor: isLight ? '#f0fdfa' : '#134e4a' } // Subtle highlight for me
                                ]}>
                                    <View style={[styles.avatar, { backgroundColor: item.color }]}>
                                        <Text style={styles.avatarText}>{item.avatar}</Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={[styles.userName, { color: textColor }, item.isMe && { color: currentAccent, fontWeight: 'bold' }]}>{item.name}</Text>
                                        <Text style={[styles.userStreak, { color: subTextColor }]}>
                                            {item.streak} Days
                                            {item.isRival && <Text style={{ color: '#8b5cf6', fontWeight: 'bold' }}> • Rival</Text>}
                                        </Text>
                                    </View>
                                    {item.isRival && (
                                        <AnimatedPressable onPress={() => Alert.alert('Remove Rival', `Remove ${item.name}?`, [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Remove', style: 'destructive', onPress: () => removeRival(item.id) }
                                        ])}>
                                            <Trash2 color="#ef4444" size={20} />
                                        </AnimatedPressable>
                                    )}
                                </View>
                            </FadeInView>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={[styles.headerTitle, { color: textColor }]}>Community</Text>
                <AnimatedPressable onPress={handleLogout} style={[styles.iconButton, { backgroundColor: cardColor, padding: 8, borderRadius: 12 }]}>
                    <LogOut color="#ef4444" size={24} />
                </AnimatedPressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderLeagueCard()}

                <View style={styles.toggleContainerWrapper}>
                    <AnimatedPressable
                        style={[styles.toggleButton, !showLeaderboard ? { backgroundColor: currentAccent } : { backgroundColor: cardColor, borderWidth: 1, borderColor: borderColor }]}
                        onPress={() => setShowLeaderboard(false)}
                    >
                        <Users color={!showLeaderboard ? '#fff' : subTextColor} size={16} />
                        <Text style={[styles.toggleText, { color: !showLeaderboard ? '#fff' : subTextColor }]}>Friends</Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                        style={[styles.toggleButton, showLeaderboard ? { backgroundColor: currentAccent } : { backgroundColor: cardColor, borderWidth: 1, borderColor: borderColor }]}
                        onPress={() => {
                            if (user.isGuest) {
                                Alert.alert('Guest Mode', 'Sign in with Google to access the Global Leaderboard and compete with the world!');
                                return;
                            }
                            setShowLeaderboard(true);
                        }}
                    >
                        {user.isGuest ? <Lock color={subTextColor} size={16} /> : <Globe color={showLeaderboard ? '#fff' : subTextColor} size={16} />}
                        <Text style={[styles.toggleText, { color: showLeaderboard ? '#fff' : subTextColor }]}>Global</Text>
                    </AnimatedPressable>
                </View>

                <View style={styles.actionButtons}>
                    {!showLeaderboard && (
                        <AnimatedPressable style={[styles.actionButton, { backgroundColor: currentAccent }]} onPress={() => setAddRivalVisible(true)}>
                            <Plus color="#fff" size={18} />
                            <Text style={[styles.actionButtonText, { color: '#fff' }]}>Add Rival</Text>
                        </AnimatedPressable>
                    )}
                    <AnimatedPressable style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
                        <Share2 color="#fff" size={18} />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Share Stats</Text>
                    </AnimatedPressable>
                </View>

                <View style={[styles.infoBox, { backgroundColor: cardColor, borderColor }]}>
                    <Text style={[styles.infoTitle, { color: currentAccent }]}>
                        {user.isGuest ? 'Offline Leaderboard' : (showLeaderboard ? 'Global Leaderboard' : 'Friends Leaderboard')}
                    </Text>
                    <Text style={[styles.infoText, { color: subTextColor }]}>
                        {user.isGuest
                            ? 'Compete against your friends! Share your "Snapshot Code" to add rivals.'
                            : (showLeaderboard
                                ? 'See where you stand among all HabitU users worldwide!'
                                : 'Compete directly with your added rivals. Add friends to see them here!')}
                    </Text>
                </View>
                {renderLeaderboard()}
            </ScrollView>

            {/* Add Rival Modal */}
            <Modal
                visible={isAddRivalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAddRivalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor: cardColor, borderColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Add a Rival</Text>
                        <Text style={[styles.modalSubtitle, { color: subTextColor }]}>Enter your friend's Snapshot Code to add them to your leaderboard.</Text>

                        <TextInput
                            style={[styles.input, { backgroundColor: isLight ? '#e4e4e7' : '#27272a', color: textColor }]}
                            placeholder="Paste Code Here..."
                            placeholderTextColor={subTextColor}
                            value={rivalCodeInput}
                            onChangeText={setRivalCodeInput}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButtonCancel, { backgroundColor: isLight ? '#e4e4e7' : '#27272a' }]} onPress={() => setAddRivalVisible(false)}>
                                <Text style={[styles.modalButtonTextCancel, { color: textColor }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButtonAdd, { backgroundColor: currentAccent }]} onPress={handleAddRival}>
                                <Text style={[styles.modalButtonTextAdd, { color: '#fff' }]}>Add Rival</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Share Code Modal */}
            <Modal
                visible={isShareVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShareVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: modalOverlayColor }]}>
                    <View style={[styles.modalContent, { backgroundColor: cardColor, borderColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Share Your Stats</Text>
                        <Text style={[styles.modalSubtitle, { color: subTextColor }]}>Send this code to a friend so they can add you as a rival!</Text>

                        <View style={[styles.codeBox, { backgroundColor: isLight ? '#e4e4e7' : '#27272a' }]}>
                            <Text style={[styles.codeText, { color: currentAccent }]}>{generatedCode}</Text>
                        </View>

                        <View style={{ gap: 12 }}>
                            <TouchableOpacity style={[styles.copyButton, { backgroundColor: currentAccent }]} onPress={handleNativeShare}>
                                <Share2 color="#fff" size={20} />
                                <Text style={[styles.copyButtonText, { color: '#fff' }]}>Share via...</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.copyButton, { backgroundColor: isLight ? '#e4e4e7' : '#27272a' }]} onPress={copyToClipboard}>
                                <Copy color={textColor} size={20} />
                                <Text style={[styles.copyButtonText, { color: textColor }]}>Copy Code</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setShareVisible(false)}>
                            <Text style={[styles.closeButtonText, { color: subTextColor }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    leagueCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    leagueHeader: {
        marginBottom: 16,
    },
    leagueTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    leagueStreak: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        fontWeight: '600',
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    progressText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
    toggleContainerWrapper: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    toggleText: {
        fontWeight: '600',
        fontSize: 14,
    },
    infoBox: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    infoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    shareButton: {
        backgroundColor: '#f472b6',
    },
    actionButtonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    listContainer: {
        gap: 20,
    },
    leagueSection: {
        gap: 12,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        marginLeft: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
    },
    userStreak: {
        fontSize: 12,
    },
    emptyLeagueText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginLeft: 16,
        marginBottom: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButtonCancel: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonAdd: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonTextCancel: {
        fontWeight: 'bold',
    },
    modalButtonTextAdd: {
        fontWeight: 'bold',
    },
    codeBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    codeText: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    copyButtonText: {
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 16,
        alignItems: 'center',
    },
    closeButtonText: {
    }
});

export default SocialScreen;
