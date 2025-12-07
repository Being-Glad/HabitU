import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitWidget(props) {
    const {
        name,
        streak,
        color,
        completedDates = {},
        icon,
        habitId,
        weekStart = 'Monday',
        showStreak = true,
        showLabels = true,
        width,
        height
    } = props;

    const today = new Date();
    const currentMonth = today.toLocaleString('default', { month: 'long' });
    const currentYear = today.getFullYear();

    // Get the first day of the month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    // Align to Week Start
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon
    if (weekStart === 'Monday') {
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    }

    // Generate calendar grid slots
    const calendarDays = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        calendarDays.push({ day: i, dateStr });
    }

    // Chunk into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
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

    const todayMonthStr = String(today.getMonth() + 1).padStart(2, '0');
    const todayDayStr = String(today.getDate()).padStart(2, '0');
    const todayStr = `${currentYear}-${todayMonthStr}-${todayDayStr}`;
    const isTodayCompleted = completedDates[todayStr];

    const activeColor = color || '#2dd4bf';

    const dayLabels = weekStart === 'Sunday'
        ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

    // Layout Logic
    const isCompact = height && height < 220;
    const isVerySmall = height && height < 120;
    const isNarrow = width && width < 200;

    // Measurements
    const pHoriz = isNarrow ? 8 : 12;
    const pVert = isCompact ? 8 : 12;
    const cardRadius = isCompact ? 16 : 20;

    // Font Sizes
    const fsTitle = isNarrow || isCompact ? 14 : 18;
    const fsIcon = isNarrow || isCompact ? 14 : 16;
    const fsMonth = isNarrow || isCompact ? 12 : 16;

    // Toggle Visibility
    const showDayHeaders = showLabels && !isCompact;

    // Cell Sizing
    let safeCellSize = 22;
    if (isCompact) safeCellSize = 16;
    if (isVerySmall) safeCellSize = 12;

    const iconSize = isCompact ? 20 : 28;
    const checkSize = isCompact ? 20 : 28;

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#09090b',
                borderRadius: cardRadius,
                paddingHorizontal: pHoriz,
                paddingVertical: pVert,
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
                    marginBottom: isCompact ? 2 : 6,
                    width: 'match_parent'
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FlexWidget
                        style={{
                            width: iconSize,
                            height: iconSize,
                            borderRadius: 6,
                            backgroundColor: '#18181b',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 8
                        }}
                    >
                        <TextWidget
                            text={displayIcon}
                            style={{ fontSize: fsIcon }}
                        />
                    </FlexWidget>

                    <TextWidget
                        text={name}
                        style={{
                            fontSize: fsTitle,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            fontFamily: 'serif',
                            maxWidth: isNarrow ? 80 : 150
                        }}
                        maxLines={1}
                    />
                </FlexWidget>

                <FlexWidget
                    style={{
                        width: checkSize,
                        height: checkSize,
                        borderRadius: 6,
                        backgroundColor: isTodayCompleted ? activeColor : '#18181b',
                        justifyContent: 'center',
                        alignItems: 'center'
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

            {/* Sub-Header */}
            <FlexWidget
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isCompact ? 2 : 6,
                    paddingHorizontal: 2,
                    width: 'match_parent'
                }}
            >
                <TextWidget
                    text={currentMonth}
                    style={{
                        fontSize: fsMonth,
                        color: '#e4e4e7',
                        fontWeight: 'bold',
                        fontFamily: 'serif',
                        fontStyle: 'italic'
                    }}
                />

                {showStreak && (
                    <FlexWidget style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#27272a',
                        paddingHorizontal: 6,
                        paddingVertical: isCompact ? 2 : 3,
                        borderRadius: 6
                    }}>
                        <TextWidget
                            text="🔥"
                            style={{ fontSize: isCompact ? 8 : 10, marginRight: 4 }}
                        />
                        <TextWidget
                            text={`${streak}`}
                            style={{
                                fontSize: isCompact ? 10 : 12,
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
                {showDayHeaders && (
                    <FlexWidget
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 2,
                            width: 'match_parent'
                        }}
                    >
                        {dayLabels.map((day, i) => (
                            <TextWidget
                                key={i}
                                text={day}
                                style={{
                                    fontSize: 10,
                                    color: '#a1a1aa', // Zinc-400
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    width: safeCellSize
                                }}
                            />
                        ))}
                    </FlexWidget>
                )}

                {weeks.map((week, wIndex) => (
                    <FlexWidget
                        key={wIndex}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: isCompact ? 2 : 4,
                            width: 'match_parent'
                        }}
                    >
                        {Array.from({ length: 7 }).map((_, dIndex) => {
                            const dayObj = week[dIndex];
                            if (!dayObj) {
                                return <FlexWidget key={dIndex} style={{ width: safeCellSize, height: safeCellSize }} />;
                            }

                            const isCompleted = completedDates[dayObj.dateStr];

                            return (
                                <FlexWidget
                                    key={dIndex}
                                    style={{
                                        width: safeCellSize,
                                        height: safeCellSize,
                                        backgroundColor: isCompleted ? activeColor : '#1f2937',
                                        borderRadius: isCompact ? 4 : 6,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                />
                            );
                        })}
                    </FlexWidget>
                ))}
            </FlexWidget>
        </FlexWidget>
    );
}
