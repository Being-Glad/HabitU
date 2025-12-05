export const ICON_MAP = {
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

export const getIcon = (name) => {
    return ICON_MAP[name] || '⭐';
};
