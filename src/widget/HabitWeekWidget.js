import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitWeekWidget(props) {
    const { name, streak, color, completedDates = {}, icon, habitId, weekStart = 'monday', width, height } = props;

    // Layout Logic
    const isCompact = (height && height < 120) || (width && width < 200);
    const p = isCompact ? 8 : 12;
    const borderRadius = isCompact ? 16 : 24;
    const fontSize = isCompact ? 12 : 14;
    const iconSize = isCompact ? 12 : 16;
    const checkSize = isCompact ? 20 : 24;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const isTodayCompleted = completedDates[todayStr];

    // Calculate start of the current week correctly handling local time
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const startDayIndex = weekStart === 'monday' ? 1 : 0;

    let daysToSubtract = currentDay - startDayIndex;
    if (daysToSubtract < 0) daysToSubtract += 7;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Generate the 7 days of the current week
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        // Use local date string construction to match other widgets
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

    // Ensure color is valid
    const activeColor = color || '#2dd4bf';

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#1a1a1a',
                borderRadius: borderRadius,
                paddingHorizontal: p,
                paddingTop: p,
                paddingBottom: isCompact ? p : 20,
                flexDirection: 'column',
                justifyContent: 'center'
            }}
            clickAction="WIDGET_CLICK"
            clickActionData={{ habitId }}
        >
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isCompact ? 6 : 12,
                    width: 'match_parent'
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <TextWidget
                        text={displayIcon}
                        style={{ fontSize: iconSize, marginRight: 6 }}
                    />
                    <TextWidget
                        text={name}
                        style={{
                            fontSize: fontSize,
                            fontWeight: 'bold',
                            color: '#ffffff',
                        }}
                        maxLines={1}
                    />
                </FlexWidget>

                <FlexWidget
                    style={{
                        width: checkSize,
                        height: checkSize,
                        borderRadius: checkSize / 2,
                        borderWidth: 2,
                        borderColor: activeColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isTodayCompleted ? activeColor : 'transparent'
                    }}
                >
                    {isTodayCompleted && (
                        <TextWidget
                            text="✓"
                            style={{
                                fontSize: isCompact ? 12 : 14,
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
                    const dayDate = new Date(dateStr);
                    // Manually get day name to avoid locale issues on some Android versions in widgets
                    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                    const dayLabel = dayNames[dayDate.getDay()];

                    // Comparison logic must be robust
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
                                    width: isCompact ? 18 : 22,
                                    height: isCompact ? 18 : 22,
                                    backgroundColor: isCompleted ? activeColor : '#333333',
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
