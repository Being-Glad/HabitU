import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { ArrowLeft, Share as ShareIcon, Check } from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

const COLORS = [
    '#0f0f0f', // Default Black
    '#18181b', // Zinc
    '#7f1d1d', // Red
    '#7c2d12', // Orange
    '#713f12', // Yellow
    '#14532d', // Green
    '#134e4a', // Teal
    '#1e3a8a', // Blue
    '#4c1d95', // Violet
    '#831843', // Pink
];

const ShareHabitScreen = ({ habit, onClose }) => {
    const viewShotRef = useRef();
    const [cardColor, setCardColor] = useState('#0f0f0f');

    const handleShare = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                alert("Sharing is not available on this device");
            }
        } catch (error) {
            console.error("Snapshot failed", error);
            alert("Failed to generate image");
        }
    };

    const getStreak = () => {
        // Simple streak logic for display
        return habit.streak || 0;
    };

    const renderHeatmapGrid = () => {
        // Mock grid for visual appeal or real data if we want
        // Using real data: last 100 days?
        // Let's create a 7x15 grid (approx 3.5 months)
        const rows = 7;
        const cols = 15;
        const grid = [];

        const today = new Date();
        // Start from 15 weeks ago
        const startDate = new Date();
        startDate.setDate(today.getDate() - (rows * cols) + 1);

        for (let i = 0; i < rows * cols; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = format(d, 'yyyy-MM-dd');
            const isCompleted = habit.completedDates?.[dateStr] || habit.logs?.[dateStr];

            grid.push({ dateStr, isCompleted });
        }

        return (
            <View style={styles.gridContainer}>
                {grid.map((cell, index) => (
                    <View
                        key={index}
                        style={[
                            styles.gridCell,
                            cell.isCompleted ? { backgroundColor: habit.color } : { backgroundColor: '#3f3f46' }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share Habit</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.previewContainer}>
                    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
                        <View style={[styles.card, { backgroundColor: cardColor }]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBox, { backgroundColor: `${habit.color}20` }]}>
                                    <Text style={{ fontSize: 32 }}>
                                        {habit.icon === 'snowflake' ? '❄️' : habit.icon === 'dumbbell' ? '💪' : '✨'}
                                    </Text>
                                </View>
                                <Text style={styles.habitName}>{habit.name}</Text>
                                <Text style={styles.streakText}>{getStreak()} Day Streak 🔥</Text>
                            </View>

                            {renderHeatmapGrid()}

                            <View style={styles.cardFooter}>
                                <Text style={styles.appName}>HabitU</Text>
                            </View>
                        </View>
                    </ViewShot>
                </View>

                <View style={styles.controls}>
                    <Text style={styles.label}>Card Color</Text>
                    <View style={styles.colorGrid}>
                        {COLORS.map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[styles.colorOption, { backgroundColor: color }]}
                                onPress={() => setCardColor(color)}
                            >
                                {cardColor === color && <Check color="#fff" size={16} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <ShareIcon color="#000" size={20} />
                    <Text style={styles.shareText}>Share with Friends</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
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
        color: '#fff',
    },
    backButton: {
        padding: 8,
        backgroundColor: '#27272a',
        borderRadius: 12,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    previewContainer: {
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    card: {
        width: 300,
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    habitName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    streakText: {
        fontSize: 16,
        color: '#a1a1aa',
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 240, // 15 cols * 16px
        justifyContent: 'center',
        gap: 4,
        marginBottom: 24,
    },
    gridCell: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    cardFooter: {
        marginTop: 8,
    },
    appName: {
        fontSize: 14,
        color: '#52525b',
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    controls: {
        width: '100%',
        marginBottom: 32,
    },
    label: {
        color: '#a1a1aa',
        marginBottom: 12,
        fontSize: 14,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#27272a',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        width: '100%',
        gap: 8,
    },
    shareText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ShareHabitScreen;
