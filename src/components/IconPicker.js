import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, TextInput } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { ICON_MAP } from '../utils/iconMap';

const { width } = Dimensions.get('window');

const ICON_CATEGORIES = {
    miscellaneous: ['sparkles', 'star', 'zap', 'wand', 'diamond', 'crown', 'puzzle', 'glasses', 'magnet', 'watch', 'hourglass', 'scale', 'key', 'ribbon', 'party-popper', 'gift', 'box', 'activity', 'plus', 'heart'],
    sports: ['dumbbell', 'bike', 'trophy', 'medal', 'target', 'swords', 'flag', 'flame', 'droplet', 'running', 'yoga', 'swim', 'soccer', 'basketball'],
    art: ['palette', 'music', 'camera', 'video', 'image', 'pen-tool', 'brush', 'scissors', 'headphones', 'mic', 'radio', 'film', 'book', 'read'],
    finances: ['dollar-sign', 'credit-card', 'wallet', 'piggy-bank', 'coins', 'briefcase', 'shopping-bag', 'tag', 'percent'],
    health: ['pill', 'stethoscope', 'thermometer', 'activity', 'heart-pulse', 'brain', 'smile', 'frown', 'sleep', 'water'],
    food: ['coffee', 'utensils', 'apple', 'carrot', 'pizza', 'beer', 'wine', 'cake', 'burger', 'ice-cream'],
    travel: ['plane', 'car', 'bus', 'train', 'map', 'compass', 'globe', 'anchor', 'sun', 'moon', 'cloud', 'umbrella', 'mountain', 'beach']
};

const IconPicker = ({ visible, currentIcon, onSelect, onClose }) => {
    const renderIcon = (iconName) => {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{
                    fontSize: 28,
                    textAlign: 'center',
                    // Android specific adjustments
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                    marginBottom: 2 // Slight adjustment for baseline
                }}>
                    {ICON_MAP[iconName]}
                </Text>
            </View>
        );
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = Object.entries(ICON_CATEGORIES).reduce((acc, [category, icons]) => {
        const filteredIcons = icons.filter(icon =>
            icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filteredIcons.length > 0) {
            acc[category] = filteredIcons;
        }
        return acc;
    }, {});

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose Icon</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search color="#a1a1aa" size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search icons..."
                        placeholderTextColor="#a1a1aa"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView style={styles.content}>
                    {Object.entries(filteredCategories).map(([category, icons]) => (
                        <View key={category} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category}</Text>
                            <View style={styles.grid}>
                                {icons.map(icon => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.iconItem,
                                            currentIcon === icon && styles.selectedIcon
                                        ]}
                                        onPress={() => onSelect(icon)}
                                    >
                                        {renderIcon(icon)}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        marginTop: 60,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#27272a',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18181b',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    categorySection: {
        marginBottom: 8,
    },
    categoryTitle: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontStyle: 'normal',
        textTransform: 'capitalize',
        fontFamily: 'System', // Use system font
        fontStyle: 'italic', // Match the "handwritten" style in screenshot roughly
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconItem: {
        width: (width - 40 - 24) / 4, // 4 columns with gap 8 (3 * 8 = 24)
        aspectRatio: 1,
        backgroundColor: '#18181b',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    selectedIcon: {
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
    }
});

export default IconPicker;
