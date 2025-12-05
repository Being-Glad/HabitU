import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ onNext }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f0f0f', '#18181b']}
                style={styles.background}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.iconContainer}>
                    <Check color="#2dd4bf" size={64} />
                </View>

                <Text style={styles.title}>HabitU</Text>
                <Text style={styles.subtitle}>Build better habits, one day at a time.</Text>

                <View style={styles.features}>
                    <FeatureItem text="Track your daily progress" />
                    <FeatureItem text="Analyze your consistency" />
                    <FeatureItem text="Achieve your goals" />
                </View>

                <TouchableOpacity style={styles.button} onPress={onNext}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const FeatureItem = ({ text }) => (
    <View style={styles.featureItem}>
        <View style={styles.dot} />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        alignItems: 'center',
        padding: 40,
        width: '100%',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(45, 212, 191, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(45, 212, 191, 0.2)',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#a1a1aa',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 28,
    },
    features: {
        alignSelf: 'flex-start',
        marginBottom: 60,
        marginLeft: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2dd4bf',
        marginRight: 12,
    },
    featureText: {
        color: '#e4e4e7',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2dd4bf',
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#2dd4bf',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
