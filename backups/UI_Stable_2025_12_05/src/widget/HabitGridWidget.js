import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitGridWidget({ name, streak, color, completedDates = {}, icon, habitId }) {
    const today = new Date();

    // Align to Monday (Calendar Week view)
    // Day 0=Sun, 1=Mon, ..., 6=Sat
    // We want to find the most recent Monday (or today if it is Monday)
    const dayOfWeek = today.getDay(); // 0-6
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - daysSinceMonday);

    // Show 24 weeks (approx 6 months) with larger cells
    const totalWeeks = 24;
    const totalDays = totalWeeks * 7;

    const startDate = new Date(currentWeekStart);
    startDate.setDate(currentWeekStart.getDate() - ((totalWeeks - 1) * 7));

    const days = Array.from({ length: totalDays }).map((_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    // Group into columns (weeks)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const iconMap = {
        'sparkles': '✨', 'star': '⭐', 'zap': '⚡', 'wand': '🪄', 'diamond': '💎', 'crown': '👑',
        'puzzle': '🧩', 'glasses': '👓', 'magnet': '🧲', 'watch': '⌚', 'hourglass': '⏳',
        'scale': '⚖️', 'key': '🔑', 'ribbon': '🎗️', 'party-popper': '🎉', 'gift': '🎁',
        'box': '📦', 'package': '📦', 'activity': '📈', 'plus': '➕', 'heart': '❤️',
        'dumbbell': '💪', 'bike': '🚲', 'trophy': '🏆', 'medal': '🥇', 'target': '🎯',
        'swords': '⚔️', 'flag': '🚩', 'flame': '🔥', 'droplet': '💧',
        'palette': '🎨', 'music': '🎵', 'camera': '📷', 'video': '📹', 'image': '🖼️',
        'pen-tool': '✒️', 'brush': '🖌️', 'scissors': '✂️', 'headphones': '🎧', 'mic': '🎤',
        'radio': '📻', 'film': '🎬',
        'dollar-sign': '💲', 'credit-card': '💳', 'wallet': '👛', 'piggy-bank': '🐷',
        'coins': '🪙', 'briefcase': '💼', 'shopping-bag': '🛍️', 'tag': '🏷️', 'percent': '%',
        'pill': '💊', 'stethoscope': '🩺', 'thermometer': '🌡️', 'heart-pulse': '💓',
        'brain': '🧠', 'smile': '😊', 'frown': '☹️',
        'coffee': '☕', 'utensils': '🍴', 'apple': '🍎', 'carrot': '🥕', 'pizza': '🍕',
        'beer': '🍺', 'wine': '🍷', 'cake': '🎂',
        'plane': '✈️', 'car': '🚗', 'bus': '🚌', 'train': '🚆', 'map': '🗺️',
        'compass': '🧭', 'globe': '🌍', 'anchor': '⚓', 'sun': '☀️', 'moon': '🌙',
        'cloud': '☁️', 'umbrella': '☂️',
        'running': '🏃', 'yoga': '🧘', 'swim': '🏊', 'soccer': '⚽', 'basketball': '🏀',
        'book': '📖', 'read': '📚',
        'sleep': '😴', 'water': '💧',
        'burger': '🍔', 'ice-cream': '🍦',
        'mountain': '⛰️', 'beach': '🏖️'
    };

    const displayIcon = iconMap[icon] || '⭐';

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const isTodayCompleted = completedDates[todayStr];

    // Use habit color (App Core) or default Teal
    const activeColor = color || '#2dd4bf';
    const inactiveColor = '#27272a'; // Zinc-800

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#09090b', // Zinc-950
                borderRadius: 20, // Match Month Widget radius
                paddingHorizontal: 12, // Match Month Widget padding
                paddingVertical: 12,
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            clickAction="WIDGET_CLICK"
            clickActionData={{ habitId }}
        >
            {/* Header */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6, // Match Month Widget margin
                    width: 'match_parent'
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FlexWidget
                        style={{
                            width: 28, // Smaller icon container
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: '#18181b', // Zinc-900
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 8
                        }}
                    >
                        <TextWidget
                            text={displayIcon}
                            style={{ fontSize: 16 }} // Smaller icon
                        />
                    </FlexWidget>

                    <TextWidget
                        text={name}
                        style={{
                            fontSize: 18, // Smaller title
                            fontWeight: 'bold',
                            color: '#ffffff',
                            fontFamily: 'cursive'
                        }}
                    />
                </FlexWidget>

                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Streak Count (New) */}
                    <FlexWidget style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#27272a',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6,
                        marginRight: 8
                    }}>
                        <TextWidget
                            text="🔥"
                            style={{ fontSize: 10, marginRight: 4 }}
                        />
                        <TextWidget
                            text={`${streak}`}
                            style={{
                                fontSize: 12,
                                color: '#ffffff',
                                fontWeight: 'bold'
                            }}
                        />
                    </FlexWidget>

                    {/* Checkbox */}
                    <FlexWidget
                        style={{
                            width: 28, // Smaller checkbox
                            height: 28,
                            borderRadius: 8,
                            backgroundColor: isTodayCompleted ? activeColor : '#18181b',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {isTodayCompleted && (
                            <TextWidget
                                text="✓"
                                style={{
                                    fontSize: 14, // Smaller checkmark
                                    color: '#000000',
                                    fontWeight: 'bold'
                                }}
                            />
                        )}
                    </FlexWidget>
                </FlexWidget>
            </FlexWidget>

            {/* Grid Container */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end', // Align right (most recent)
                    alignItems: 'center',
                    width: 'match_parent',
                    flex: 1,
                    overflow: 'hidden'
                }}
            >
                {weeks.map((week, wIndex) => (
                    <FlexWidget
                        key={wIndex}
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: 'match_parent',
                            marginRight: 4 // Increased gap (was 2)
                        }}
                    >
                        {week.map((dateStr, dIndex) => (
                            <FlexWidget
                                key={dIndex}
                                style={{
                                    width: 12, // Larger cells (was 6)
                                    height: 12,
                                    backgroundColor: completedDates[dateStr] ? activeColor : inactiveColor,
                                    borderRadius: 4, // More rounded edges (was 2)
                                    marginBottom: 4 // Increased gap (was 2)
                                }}
                            />
                        ))}
                    </FlexWidget>
                ))}
            </FlexWidget>
        </FlexWidget>
    );
}
