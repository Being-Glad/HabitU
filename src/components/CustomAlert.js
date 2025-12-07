import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useAlert } from '../context/AlertContext';
import { useHabits } from '../context/HabitContext';

const { width } = Dimensions.get('window');

const CustomAlert = () => {
    const { alertConfig, closeAlert } = useAlert();
    const { settings } = useHabits();
    const { visible, title, message, buttons } = alertConfig;

    if (!visible) return null;

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    // Theme Colors
    const bgColor = isLight ? '#ffffff' : '#18181b';
    const titleColor = isLight ? '#000000' : '#ffffff';
    const msgColor = isLight ? '#52525b' : '#a1a1aa';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const overlayColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)';

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={closeAlert}
        >
            <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
                <View style={[styles.alertContainer, { backgroundColor: bgColor, borderColor }]}>
                    {title ? <Text style={[styles.title, { color: titleColor }]}>{title}</Text> : null}
                    {message ? (
                        <Text style={[
                            styles.message,
                            {
                                color: msgColor,
                                textAlign: (message.length > 80 || message.includes('\n')) ? 'left' : 'center'
                            }
                        ]}>
                            {message}
                        </Text>
                    ) : null}

                    <View style={[
                        styles.buttonContainer,
                        buttons.length > 2 ? styles.buttonContainerVertical : styles.buttonContainerHorizontal
                    ]}>
                        {buttons.map((btn, index) => {
                            const isDestructive = btn.style === 'destructive';
                            const isCancel = btn.style === 'cancel';
                            const showVertical = buttons.length > 2;

                            // Default accent color if not destructive
                            const btnColor = isDestructive ? '#EF5350' : (isCancel ? msgColor : settings.accentColor || '#2dd4bf');

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        showVertical ? styles.buttonVertical : styles.buttonHorizontal,
                                        // Highlight all non-cancel buttons with background for consistency
                                        !isCancel && { backgroundColor: `${btnColor}20` }
                                    ]}
                                    onPress={() => {
                                        closeAlert();
                                        if (btn.onPress) btn.onPress();
                                    }}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        { color: btnColor },
                                        isDestructive && { fontWeight: 'bold' }
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    alertContainer: {
        width: Math.min(width - 60, 340),
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        width: '100%',
    },
    buttonContainerHorizontal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    buttonContainerVertical: {
        flexDirection: 'column',
        gap: 12,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonHorizontal: {
        minWidth: 80,
    },
    buttonVertical: {
        width: '100%',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});

export default CustomAlert;
