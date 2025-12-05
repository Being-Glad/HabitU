import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar, Image, Linking } from 'react-native';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { MonetizationService } from '../services/MonetizationService';

const ResourcesScreen = ({ onClose }) => {
    const { settings } = useHabits();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const accentColor = settings.accentColor || '#2dd4bf';

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        setLoading(true);
        const config = await MonetizationService.fetchConfig();
        if (config && config.resources) {
            setResources(config.resources);
        }
        setLoading(false);
    };

    const handleOpenLink = (url) => {
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={[styles.backButton, { backgroundColor: cardColor }]}>
                    <ArrowLeft color={textColor} size={24} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>Resources</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                    Curated books and tools to help you build better habits.
                </Text>

                {loading ? (
                    <Text style={{ color: subTextColor, textAlign: 'center', marginTop: 40 }}>Loading...</Text>
                ) : (
                    resources.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.resourceCard, { backgroundColor: cardColor }]}
                            onPress={() => handleOpenLink(item.link)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.imageContainer}>
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        style={styles.bookCover}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={[styles.placeholderCover, { backgroundColor: accentColor + '20' }]}>
                                        <BookOpen color={accentColor} size={32} />
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardContent}>
                                <View>
                                    <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
                                    <Text style={[styles.cardAuthor, { color: subTextColor }]}>by {item.author}</Text>
                                </View>

                                <Text style={[styles.cardDescription, { color: subTextColor }]} numberOfLines={3}>
                                    {item.description}
                                </Text>

                                <View style={[styles.readMoreButton, { backgroundColor: accentColor + '15' }]}>
                                    <Text style={[styles.readMoreText, { color: accentColor }]}>Get this book</Text>
                                    <ExternalLink color={accentColor} size={14} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 24,
    },
    resourceCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imageContainer: {
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    bookCover: {
        width: 85,
        height: 128,
        borderRadius: 8,
    },
    placeholderCover: {
        width: 85,
        height: 128,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        paddingVertical: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 24,
    },
    cardAuthor: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        opacity: 0.7,
    },
    cardDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        opacity: 0.8,
    },
    readMoreButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 6,
        marginTop: 'auto', // Push to bottom if space permits, or just sit below text
    },
    readMoreText: {
        fontSize: 12,
        fontWeight: '700',
    }
});

export default ResourcesScreen;
