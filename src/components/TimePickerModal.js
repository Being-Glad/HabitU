import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import ScrollPicker from './ScrollPicker';
import { useHabits } from '../context/HabitContext';

const { width } = Dimensions.get('window');

const TimePickerModal = ({ visible, onClose, onSave, initialTime }) => {
    const { settings } = useHabits();
    const [hours, setHours] = useState('09');
    const [minutes, setMinutes] = useState('00');
    const [amPm, setAmPm] = useState('AM');

    // Theme
    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';
    const bgColor = isLight ? '#ffffff' : '#18181b';
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const borderColor = isLight ? '#e4e4e7' : '#27272a';
    const pickerBg = isLight ? '#f4f4f5' : '#101010';
    const accentColor = settings.accentColor || '#2dd4bf';

    // 12-Hour Format Options
    const hourOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const amPmOptions = ['AM', 'PM'];

    useEffect(() => {
        if (visible) {
            const date = initialTime || new Date();
            let h = date.getHours();
            const m = date.getMinutes();
            const isPm = h >= 12;

            if (h === 0) h = 12;
            else if (h > 12) h -= 12;

            setHours(h.toString().padStart(2, '0'));
            setMinutes(m.toString().padStart(2, '0'));
            setAmPm(isPm ? 'PM' : 'AM');
        }
    }, [visible, initialTime]);

    const handleSave = () => {
        const date = new Date();
        let h = parseInt(hours);
        const m = parseInt(minutes);

        if (amPm === 'PM' && h !== 12) h += 12;
        if (amPm === 'AM' && h === 12) h = 0;

        date.setHours(h, m, 0, 0);
        onSave(date);
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: bgColor, borderColor }]}>
                    <Text style={[styles.title, { color: textColor }]}>Set Reminder</Text>

                    <View style={styles.pickerContainer}>
                        {/* Hours */}
                        <View style={styles.column}>
                            <Text style={[styles.label, { color: subTextColor }]}>Hour</Text>
                            <ScrollPicker
                                options={hourOptions}
                                value={hours}
                                onValueChange={setHours}
                                containerStyle={{ backgroundColor: pickerBg, borderColor }}
                            />
                        </View>

                        <View style={[styles.separator, { color: textColor }]}>
                            <Text style={{ fontSize: 32, fontWeight: 'bold', color: textColor }}>:</Text>
                        </View>

                        {/* Minutes */}
                        <View style={styles.column}>
                            <Text style={[styles.label, { color: subTextColor }]}>Minute</Text>
                            <ScrollPicker
                                options={minuteOptions}
                                value={minutes}
                                onValueChange={setMinutes}
                                containerStyle={{ backgroundColor: pickerBg, borderColor }}
                            />
                        </View>

                        <View style={{ width: 12 }} />

                        {/* AM/PM */}
                        <View style={styles.column}>
                            <Text style={[styles.label, { color: subTextColor }]}>Format</Text>
                            <ScrollPicker
                                options={amPmOptions}
                                value={amPm}
                                onValueChange={setAmPm}
                                containerStyle={{ backgroundColor: pickerBg, borderColor }}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: isLight ? '#f4f4f5' : '#27272a' }]}
                            onPress={onClose}
                        >
                            <Text style={{ color: subTextColor, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: accentColor }]}
                            onPress={handleSave}
                        >
                            <Text style={{ color: '#101010', fontWeight: 'bold' }}>Save Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    container: {
        width: Math.min(width - 40, 360),
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
        textAlign: 'center',
        marginBottom: 24,
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    separator: {
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TimePickerModal;
