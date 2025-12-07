import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Alert, BackHandler, Platform, StatusBar, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const UsernameSetupScreen = () => {
    const { updateUsername, logout, user } = useAuth();
    const { showAlert } = useAlert();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const backAction = () => {
            handleBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (user?.suggestedUsername) {
            setUsername(user.suggestedUsername);
        }
    }, [user]);

    const handleBack = () => {
        showAlert('Cancel Setup?', 'Do you want to go back to the login screen?', [
            { text: 'No', style: 'cancel', onPress: () => { } },
            { text: 'Yes', style: 'destructive', onPress: () => logout() },
        ]);
    };

    const handleSave = () => {
        if (username.length < 2) {
            setError("Username must be at least 2 characters long.");
            return;
        }
        updateUsername(username);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar hidden={true} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>
                        {user?.suggestedUsername ? 'Welcome Back!' : 'Create Username'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {user?.suggestedUsername
                            ? 'We found your previous account. You can keep your username or change it.'
                            : 'Choose a unique username to connect with friends.'}
                    </Text>

                    <TextInput
                        style={[styles.input, error ? styles.inputError : null]}
                        value={username}
                        onChangeText={(text) => {
                            setUsername(text);
                            setError('');
                        }}
                        placeholder="Username"
                        placeholderTextColor="#52525b"
                        autoCapitalize="none"
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 10, // Ensure header is above content
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
        padding: 20,
        justifyContent: 'center',
        // Removed negative margin to prevent layout issues
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#a1a1aa',
        marginBottom: 32,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#18181b',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    saveButton: {
        backgroundColor: '#2dd4bf',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 16,
        marginLeft: 4,
    }
});

export default UsernameSetupScreen;
