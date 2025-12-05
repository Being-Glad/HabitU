import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitWeekWidget({ name, streak, color, completedDates = {}, icon, habitId, weekStart = 'monday' }) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isTodayCompleted = completedDates[todayStr];

    // Calculate start of the current week
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const startDayIndex = weekStart === 'monday' ? 1 : 0;

    // Calculate how many days to go back to get to the start of the week
    let daysToSubtract = currentDay - startDayIndex;
    if (daysToSubtract < 0) daysToSubtract += 7;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Generate the 7 days of the current week
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d.toISOString().split('T')[0];
    });

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

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#1a1a1a',
                borderRadius: 16,
                paddingHorizontal: 10,
                paddingTop: 10,
                paddingBottom: 20, // Increased bottom padding to shift content up
                flexDirection: 'column',
                justifyContent: 'center' // Center content vertically
            }}
            clickAction="WIDGET_CLICK"
            clickActionData={{ habitId }}
        >
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12, // Increased margin for separation
                    width: 'match_parent'
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TextWidget
                        text={displayIcon}
                        style={{ fontSize: 16, marginRight: 6 }}
                    />
                    <TextWidget
                        text={name}
                        style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            maxLines: 1
                        }}
                    />
                </FlexWidget>

                <FlexWidget
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: color || '#2dd4bf',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isTodayCompleted ? (color || '#2dd4bf') : 'transparent'
                    }}
                >
                    {isTodayCompleted && (
                        <TextWidget
                            text="✓"
                            style={{
                                fontSize: 14,
                                color: '#000000',
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                </FlexWidget>
            </FlexWidget>

            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 'match_parent'
                }}
            >
                {days.map((dateStr, index) => {
                    const isCompleted = completedDates[dateStr];
                    const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'narrow' });
                    const isToday = dateStr === todayStr;

                    return (
                        <FlexWidget
                            key={index}
                            style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1
                            }}
                        >
                            <TextWidget
                                text={dayLabel}
                                style={{
                                    fontSize: 10,
                                    color: isToday ? '#ffffff' : '#a1a1aa',
                                    marginBottom: 4,
                                    fontWeight: isToday ? 'bold' : 'normal',
                                    textAlign: 'center'
                                }}
                            />
                            <FlexWidget
                                style={{
                                    width: 22,
                                    height: 22,
                                    backgroundColor: isCompleted ? color : '#333333',
                                    borderRadius: 6,
                                    borderWidth: isToday ? 1 : 0,
                                    borderColor: '#ffffff'
                                }}
                            />
                        </FlexWidget>
                    );
                })}
            </FlexWidget>
        </FlexWidget>
    );
}
