import React from 'react';
import { FlexWidget, TextWidget, IconWidget } from 'react-native-android-widget';

export function HabitListWidget({ habits = [] }) {
    // Show more items, let the widget height determine visibility
    const displayHabits = habits.slice(0, 20);

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

    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#09090b', // Zinc-950 (Very dark base)
                borderRadius: 24,
                paddingVertical: 12,
                flexDirection: 'column',
                justifyContent: 'flex-start'
            }}
        >
            <FlexWidget style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                paddingHorizontal: 16
            }}>
                <TextWidget
                    text="My Habits"
                    style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#e4e4e7', // Zinc-200
                        fontFamily: 'cursive'
                    }}
                />
            </FlexWidget>

            {displayHabits.map((habit, index) => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const todayStr = `${year}-${month}-${day}`;

                const isCompleted = habit.completedDates && habit.completedDates[todayStr];
                const displayIcon = iconMap[habit.icon] || '⭐';

                // Alternating background colors: "Dark Black" and "Light Black"
                // Even: #000000 (Pitch Black), Odd: #18181b (Zinc-900)
                const rowBg = index % 2 === 0 ? '#000000' : '#18181b';

                return (
                    <FlexWidget
                        key={habit.id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            backgroundColor: rowBg,
                            borderRadius: 16, // More rounded
                            marginHorizontal: 8,
                            marginBottom: 4,
                            width: 'match_parent' // Ensure full width
                        }}
                        clickAction="WIDGET_CLICK"
                        clickActionData={{ habitId: habit.id }}
                    >
                        {/* Left Group: Icon + Name */}
                        <FlexWidget style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            marginRight: 16 // Explicit separation from right group
                        }}>
                            <TextWidget
                                text={displayIcon}
                                style={{ fontSize: 20, marginRight: 12 }}
                            />
                            <TextWidget
                                text={habit.name}
                                style={{
                                    fontSize: 16,
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontFamily: 'sans-serif-medium',
                                    maxLines: 1
                                }}
                            />
                        </FlexWidget>

                        {/* Right Group: Streak + Checkbox (Pushed to far right) */}
                        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {habit.streak > 0 && (
                                <FlexWidget style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginRight: 16, // Separation between streak and checkbox
                                    backgroundColor: '#27272a', // Subtle background for streak
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    borderRadius: 8
                                }}>
                                    <TextWidget
                                        text={`${habit.streak}`}
                                        style={{
                                            fontSize: 14,
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            marginRight: 4
                                        }}
                                    />
                                    <TextWidget
                                        text="🔥"
                                        style={{ fontSize: 12 }}
                                    />
                                </FlexWidget>
                            )}

                            <FlexWidget
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: isCompleted ? (habit.color || '#f59e0b') : '#27272a', // Amber-500 or Zinc-800
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                {isCompleted && (
                                    <TextWidget
                                        text="✓"
                                        style={{
                                            fontSize: 16,
                                            color: '#000000',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                )}
                            </FlexWidget>
                        </FlexWidget>
                    </FlexWidget>
                );
            })}
        </FlexWidget>
    );
};
