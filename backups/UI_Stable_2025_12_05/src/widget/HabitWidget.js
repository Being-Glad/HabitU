import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitWidget({ name, streak, color, completedDates = {}, icon, habitId, weekStart = 'Monday' }) {
    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();

    // Get the first day of the month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Align to Week Start
    // JS getDay(): 0=Sun, 1=Mon...
    // If Monday start: Mon=0, ..., Sun=6
    // If Sunday start: Sun=0, ..., Sat=6
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon

    if (weekStart === 'Monday') {
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    }
    // If Sunday start, startDayOfWeek is already correct (0=Sun)

    // Generate calendar grid slots
    // 1. Empty slots for days before the 1st
    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // 2. Actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        calendarDays.push({ day: i, dateStr });
    }

    // Chunk into weeks (rows of 7)
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    // ... (iconMap logic)

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

    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    const isTodayCompleted = completedDates[todayStr];

    // Use habit color or default Teal
    const activeColor = color || '#2dd4bf';
    const inactiveColor = '#27272a'; // Zinc-800
    const emptyColor = 'transparent';

    const dayLabels = weekStart === 'Sunday'
        ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#09090b', // Zinc-950
                borderRadius: 20, // Slightly smaller radius
                paddingHorizontal: 12, // Reduced padding
                paddingVertical: 12,
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            clickAction="WIDGET_CLICK"
            clickActionData={{ habitId }}
        >
            {/* Header: Icon + Name + Checkbox */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6, // Reduced margin
                    width: 'match_parent'
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FlexWidget
                        style={{
                            width: 28, // Smaller icon
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
                            style={{ fontSize: 16 }}
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
                                fontSize: 14,
                                color: '#000000',
                                fontWeight: 'bold'
                            }}
                        />
                    )}
                </FlexWidget>
            </FlexWidget>

            {/* Sub-Header: Month Name + Streak */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                    paddingHorizontal: 2,
                    width: 'match_parent' // Ensure full width
                }}
            >
                <TextWidget
                    text={currentMonth}
                    style={{
                        fontSize: 16, // Smaller month name
                        color: '#e4e4e7', // Zinc-200
                        fontWeight: 'bold',
                        fontFamily: 'cursive'
                    }}
                />

                {showStreak && (
                    <FlexWidget style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#27272a',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 6
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
                )}
            </FlexWidget>

            {/* Calendar Grid */}
            <FlexWidget
                style={{
                    flexDirection: 'column',
                    width: 'match_parent',
                    flex: 1,
                    justifyContent: 'flex-start'
                }}
            >
                {/* Day Labels */}
                {showLabels && (
                    <FlexWidget
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                            width: 'match_parent' // Ensure full width
                        }}
                    >
                        {dayLabels.map((day, i) => (
                            <TextWidget
                                key={i}
                                text={day}
                                style={{
                                    fontSize: 10, // Smaller labels
                                    color: '#a1a1aa', // Zinc-400
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    width: 22 // Reduced width to ensure gaps
                                }}
                            />
                        ))}
                    </FlexWidget>
                )}

                {/* Weeks */}
                {weeks.map((week, wIndex) => (
                    <FlexWidget
                        key={wIndex}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                            width: 'match_parent' // Ensure full width
                        }}
                    >
                        {/* Ensure exactly 7 items per row, filling empty if needed */}
                        {Array.from({ length: 7 }).map((_, dIndex) => {
                            const dayObj = week[dIndex];
                            if (!dayObj) {
                                return <FlexWidget key={dIndex} style={{ width: 22, height: 22 }} />;
                            }

                            const isCompleted = completedDates[dayObj.dateStr];

                            return (
                                <FlexWidget
                                    key={dIndex}
                                    style={{
                                        width: 22, // Smaller cells (22px)
                                        height: 22,
                                        backgroundColor: isCompleted ? activeColor : '#1f2937',
                                        borderRadius: 6, // Slightly smaller radius
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* Optional: Show day number? Reference doesn't show numbers clearly, just boxes. 
                                        But usually calendar views have numbers. 
                                        The reference image shows FILLED boxes. 
                                        Let's keep it simple: Filled boxes for days. 
                                        Wait, reference shows ALL days as boxes, some filled (teal), some empty (dark).
                                        So we render a box for every valid day.
                                    */}
                                </FlexWidget>
                            );
                        })}
                    </FlexWidget>
                ))}
            </FlexWidget>
        </FlexWidget>
    );
}
