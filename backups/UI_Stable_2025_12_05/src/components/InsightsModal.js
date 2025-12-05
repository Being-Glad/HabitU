import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, Easing, Alert } from 'react-native';
import { X, Trophy, TrendingUp, Calendar, Activity, HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabits } from '../context/HabitContext';
import { format, subDays, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, getDay, addDays } from 'date-fns';

const SCREEN_WIDTH = Dimensions.get('window').width;

const InsightsModal = ({ visible, onClose }) => {
    const { getGlobalStats, settings } = useHabits();
    const stats = getGlobalStats();

    // Animation for Score Ring
    const spinValue = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            spinValue.setValue(0);
            fadeAnim.setValue(0);

            Animated.parallel([
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    // Mock Trend Calculation (since we don't have historical snapshots yet)
    // Logic: If score > 80, trend is up. If score < 50, trend is down.
    // In a real app, we'd compare with last month's average.
    // Trend Calculation
    const getTrend = (score) => {
        if (score === 0) return { text: 'Start your journey', color: subTextColor, icon: 'activity' };
        if (score < 30) return { text: 'Building momentum', color: '#fbbf24', icon: 'up' }; // Amber
        if (score >= 80) return { text: '+5% this week', color: '#4ade80', icon: 'up' }; // Green
        if (score >= 50) return { text: '+2% this week', color: '#fbbf24', icon: 'up' }; // Amber
        return { text: 'Keep going!', color: '#a1a1aa', icon: 'activity' }; // Neutral
    };

    const trend = getTrend(stats.score);
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const showHelp = (feature) => {
        const content = {
            score: {
                title: 'Habit Score',
                message: 'Your consistency score (0-100) based on the last 30 days. Recent days count more! Keep your habits up to increase it.'
            },
            calendar: {
                title: 'Consistency Calendar',
                message: 'Tracks your "Perfect Days". A Green square means you completed ALL habits due that day. Empty squares mean you missed something.'
            },
            topHabits: {
                title: 'Top Habits',
                message: 'Your best performing habits ranked by consistency and current streak. Keep the fire burning! 🔥'
            }
        };

        const info = content[feature];
        Alert.alert(info.title, info.message, [{ text: 'Got it' }]);
    };

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const closeButtonBg = isLight ? '#f4f4f5' : 'transparent';

    const renderPerfectDays = () => {
        const today = new Date();
        // Show roughly the last month, aligned to weeks
        // Start from the beginning of the week 4 weeks ago
        const startDate = startOfWeek(subDays(today, 28));
        const endDate = endOfWeek(today);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        return (
            <View style={[styles.heatmapContainer, { backgroundColor: cardColor }]}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>Consistency Calendar</Text>
                    <TouchableOpacity onPress={() => showHelp('calendar')}>
                        <HelpCircle size={20} color={subTextColor} />
                    </TouchableOpacity>
                </View>

                {/* Weekday Headers */}
                <View style={styles.weekRow}>
                    {weekDays.map((day, index) => (
                        <Text key={index} style={[styles.weekDayText, { color: subTextColor }]}>{day}</Text>
                    ))}
                </View>

                {/* Calendar Grid */}
                <View style={styles.heatmapGrid}>
                    {calendarDays.map((day, index) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isPerfect = stats.perfectDays.includes(dateStr);
                        const isToday = isSameDay(day, today);
                        const isFuture = day > today;

                        // Determine cell style based on state
                        // Make empty cells more visible (Lighter grey in dark mode)
                        let cellColor = isLight ? '#e4e4e7' : '#3f3f46';
                        let cellOpacity = 1;

                        if (isPerfect) {
                            cellColor = '#2dd4bf'; // Success Teal
                        } else if (isFuture) {
                            cellColor = isLight ? '#f4f4f5' : '#27272a';
                            // Increase opacity for future cells so they are visible placeholders
                            cellOpacity = 0.5;
                        } else {
                            // Past empty days - make them slightly distinct
                            cellColor = isLight ? '#e4e4e7' : '#52525b'; // Zinc-600 for better visibility
                        }

                        return (
                            <View
                                key={dateStr}
                                style={[
                                    styles.heatmapCell,
                                    {
                                        backgroundColor: cellColor,
                                        opacity: cellOpacity,
                                        borderColor: isToday ? textColor : 'transparent',
                                        borderWidth: isToday ? 2 : 0, // Thicker border for today
                                    }
                                ]}
                            />
                        );
                    })}
                </View>
                <Text style={[styles.heatmapLegend, { color: subTextColor }]}>Green squares indicate days where all habits were completed.</Text>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor }]}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Insights</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: closeButtonBg, borderRadius: 12 }]}>
                        <X color={subTextColor} size={24} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Overall Score */}
                    <View style={[styles.scoreCard, { backgroundColor: cardColor }]}>
                        <TouchableOpacity
                            style={styles.helpIconAbsolute}
                            onPress={() => showHelp('score')}
                        >
                            <HelpCircle size={20} color={subTextColor} />
                        </TouchableOpacity>

                        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: fadeAnim }] }}>
                            <LinearGradient
                                colors={['#2dd4bf', '#3b82f6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.scoreCircle}
                            >
                                <View style={[styles.scoreInner, { backgroundColor: cardColor }]}>
                                    <Text style={[styles.scoreValue, { color: textColor }]}>{stats.score}</Text>
                                    <Text style={styles.scoreLabel}>Habit Score</Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>

                        <View style={styles.trendContainer}>
                            {trend.icon === 'up' ? <TrendingUp size={16} color={trend.color} /> : <Activity size={16} color={trend.color} />}
                            <Text style={[styles.trendText, { color: trend.color }]}>{trend.text}</Text>
                        </View>

                        <Text style={[styles.scoreDescription, { color: subTextColor }]}>
                            Your overall consistency score based on the last 30 days.
                        </Text>
                    </View>

                    {/* Perfect Days Heatmap */}
                    {renderPerfectDays()}

                    {/* Top Habits */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 0 }]}>Top Performing Habits</Text>
                            <TouchableOpacity onPress={() => showHelp('topHabits')}>
                                <HelpCircle size={20} color={subTextColor} />
                            </TouchableOpacity>
                        </View>
                        {stats.topHabits.map((habit, index) => (
                            <View key={habit.id} style={[styles.habitRow, { backgroundColor: cardColor }]}>
                                <View style={[styles.rankBadge, { backgroundColor: index === 0 ? '#fbbf24' : (isLight ? '#e4e4e7' : '#3f3f46') }]}>
                                    <Text style={[styles.rankText, { color: index === 0 ? '#000' : textColor }]}>#{index + 1}</Text>
                                </View>
                                <View style={styles.habitInfo}>
                                    <Text style={[styles.habitName, { color: textColor }]}>{habit.name}</Text>
                                    {habit.category && habit.category !== 'Other' && (
                                        <View style={[styles.categoryTag, { borderColor: habit.color }]}>
                                            <Text style={[styles.categoryText, { color: habit.color }]}>{habit.category}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.streakInfo}>
                                    <Trophy size={14} color={habit.color} />
                                    <Text style={[styles.streakText, { color: subTextColor }]}>{habit.streak} day streak</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    scoreCard: {
        alignItems: 'center',
        marginBottom: 32,
        padding: 24,
        borderRadius: 24,
        position: 'relative', // For absolute help icon
    },
    helpIconAbsolute: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    scoreCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        padding: 4, // Space for gradient border
    },
    scoreInner: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: 'bold',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#a1a1aa',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    scoreDescription: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 12,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        gap: 4,
    },
    trendText: {
        fontSize: 14,
        fontWeight: '600',
    },
    heatmapContainer: {
        marginBottom: 32,
        padding: 20,
        borderRadius: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    weekDayText: {
        width: (SCREEN_WIDTH - 80) / 7,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    heatmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4, // Added gap
        justifyContent: 'space-between', // Distribute evenly
    },
    heatmapCell: {
        width: (SCREEN_WIDTH - 80 - (6 * 4)) / 7, // Adjust width for gap
        aspectRatio: 1,
        borderRadius: 6,
        margin: 0,
    },
    heatmapLegend: {
        marginTop: 12,
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    habitInfo: {
        flex: 1,
    },
    habitName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    categoryTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    streakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontSize: 14,
    },
});

export default InsightsModal;
