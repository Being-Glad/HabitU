import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ onClose }) => {
    const { login, loginAsGuest } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoBg}>
                        <Text style={styles.logoText}>H</Text>
                    </View>
                    <Text style={styles.appName}>HabitU</Text>
                    <Text style={styles.tagline}>Build better habits, together.</Text>
                </View>

                <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🏆</Text>
                        <Text style={styles.featureText}>Compete on Leaderboards</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🤝</Text>
                        <Text style={styles.featureText}>Share with Friends</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>☁️</Text>
                        <Text style={styles.featureText}>Sync across Devices</Text>
                    </View>
                </View>

                <View style={styles.spacer} />

                <View style={styles.authButtons}>
                    <TouchableOpacity style={styles.googleButton} onPress={login}>
                        <View style={styles.googleIconContainer}>
                            <Text style={styles.googleIconText}>G</Text>
                        </View>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.guestButton} onPress={loginAsGuest}>
                        <Text style={styles.guestButtonText}>Continue as Guest</Text>
                    </TouchableOpacity>

                    <Text style={styles.disclaimer}>
                        Everything on device. Guest mode enables offline leaderboards only.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
    },
    header: {
        padding: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logoBg: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#2dd4bf',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        transform: [{ rotate: '-5deg' }],
    },
    logoText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#a1a1aa',
        textAlign: 'center',
    },
    featuresContainer: {
        gap: 16,
        paddingHorizontal: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIcon: {
        fontSize: 24,
    },
    featureText: {
        fontSize: 16,
        color: '#e4e4e7',
        fontWeight: '500',
    },
    spacer: {
        flex: 1,
    },
    authButtons: {
        gap: 12,
        marginBottom: 20,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
    },
    googleIconContainer: {
        marginRight: 12,
    },
    googleIconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    googleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    guestButton: {
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#3f3f46',
        alignItems: 'center',
    },
    guestButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disclaimer: {
        color: '#52525b',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    }
});

export default LoginScreen;
