import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function HabitStreakWidget(props) {
    const { name, streak, color, icon, habitId } = props;
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

    // Dynamic content based on streak
    let quote = "Set me free.";
    let character = "🕸️"; // Spider web for 0 streak (trapped)

    if (streak > 0) {
        quote = "Keep it up!";
        character = displayIcon; // Show the habit icon when active
    }
    if (streak > 3) {
        quote = "You're on fire!";
        character = "🔥";
    }
    if (streak > 7) {
        quote = "Unstoppable!";
        character = "🚀";
    }
    if (streak > 30) {
        quote = "Legendary!";
        character = "👑";
    }

    // Layout Logic
    const isCompact = (props.height && props.height < 120) || (props.width && props.width < 150);
    const p = isCompact ? 8 : 16;
    const borderRadius = isCompact ? 16 : 24;

    const streakFontSize = isCompact ? 32 : 48;
    const fireFontSize = isCompact ? 24 : 32;
    const labelFontSize = isCompact ? 14 : 20;
    const quoteFontSize = isCompact ? 10 : 12;
    const iconContainerSize = isCompact ? 50 : 80;
    const iconFontSize = isCompact ? 28 : 48;

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#000000', // Pitch black background
                borderRadius: borderRadius,
                padding: p,
                flexDirection: 'row', // Row layout
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
            clickAction="WIDGET_CLICK"
            clickActionData={{ habitId }}
        >
            {/* Left Side: Text Info */}
            <FlexWidget
                style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1
                }}
            >
                <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isCompact ? 2 : 4 }}>
                    <TextWidget
                        text={`${streak}`}
                        style={{
                            fontSize: streakFontSize,
                            fontWeight: 'bold',
                            color: '#ffffff',
                            fontFamily: 'sans-serif-condensed'
                        }}
                    />
                    <TextWidget
                        text="🔥"
                        style={{
                            fontSize: fireFontSize,
                            marginLeft: isCompact ? 4 : 8
                        }}
                    />
                </FlexWidget>

                <TextWidget
                    text="day streak"
                    style={{
                        fontSize: labelFontSize,
                        color: '#ffffff',
                        fontWeight: 'bold',
                        fontFamily: 'serif',
                        marginBottom: isCompact ? 2 : 4
                    }}
                />

                <TextWidget
                    text={quote}
                    style={{
                        fontSize: quoteFontSize,
                        color: '#a1a1aa',
                        fontStyle: 'italic'
                    }}
                    maxLines={1}
                />
            </FlexWidget>

            {/* Right Side: Visual */}
            <FlexWidget
                style={{
                    width: iconContainerSize,
                    height: iconContainerSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#1a1a1a', // Darker container for the "cage" look
                    borderRadius: isCompact ? 12 : 16,
                    borderWidth: streak === 0 ? 2 : 0,
                    borderColor: '#333333'
                }}
            >
                <TextWidget
                    text={character}
                    style={{
                        fontSize: iconFontSize,
                    }}
                />
                {streak === 0 && (
                    <FlexWidget
                        style={{
                            position: 'absolute',
                            width: 'match_parent',
                            height: 'match_parent',
                            justifyContent: 'space-evenly',
                            flexDirection: 'row'
                        }}
                    >
                        {/* Cage bars effect */}
                        <FlexWidget style={{ width: 2, height: 'match_parent', backgroundColor: '#52525b' }} />
                        <FlexWidget style={{ width: 2, height: 'match_parent', backgroundColor: '#52525b' }} />
                        <FlexWidget style={{ width: 2, height: 'match_parent', backgroundColor: '#52525b' }} />
                    </FlexWidget>
                )}
            </FlexWidget>
        </FlexWidget>
    );
}
