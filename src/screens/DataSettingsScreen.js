import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform, StatusBar, BackHandler } from 'react-native';
import { ArrowLeft, Save, Upload, Trash2, AlertTriangle, FileJson } from 'lucide-react-native';
import { useHabits } from '../context/HabitContext';
import { useAlert } from '../context/AlertContext';
import AnimatedPressable from '../components/AnimatedPressable';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const DataSettingsScreen = ({ onClose }) => {
    const { habits, importHabits, resetApp, settings } = useHabits();
    const { showAlert } = useAlert();

    const currentTheme = settings.theme || 'dark';
    const isLight = currentTheme === 'light';

    const backgroundColor = isLight ? '#ffffff' : (currentTheme === 'midnight' ? '#000000' : (currentTheme === 'slate' ? '#0f172a' : (currentTheme === 'coffee' ? '#1c1917' : '#0f0f0f')));
    const textColor = isLight ? '#000000' : '#ffffff';
    const subTextColor = isLight ? '#52525b' : '#a1a1aa';
    const cardColor = isLight ? '#f4f4f5' : '#18181b';
    const accentColor = settings.accentColor || '#2dd4bf';
    const dangerColor = '#ef4444';

    const getExportData = () => JSON.stringify(habits, null, 2);

    const handleExport = () => {
        showAlert(
            'Export Backup',
            'How would you like to export your data?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Share File', onPress: shareData },
                { text: 'Save to Device', onPress: saveToDevice }
            ]
        );
    };

    const shareData = async () => {
        try {
            const fileUri = FileSystem.cacheDirectory + 'habitu_backup.json';
            await FileSystem.writeAsStringAsync(fileUri, getExportData());
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Export HabitU Data',
                UTI: 'public.json'
            });
        } catch (error) {
            showAlert('Export Failed', error.message || 'Unknown error occurred');
        }
    };

    const saveToDevice = async () => {
        if (Platform.OS === 'android') {
            try {
                const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                    const data = getExportData();
                    const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                        permissions.directoryUri,
                        'habitu_backup.json',
                        'application/json'
                    );
                    await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
                    showAlert('Success', 'Backup saved successfully!');
                }
            } catch (e) {
                showAlert('Error', 'Failed to save to device: ' + e.message);
            }
        } else {
            // iOS doesn't have SAF, Sharing is the standard way to "Save to Files"
            shareData();
        }
    };

    const handleImport = async () => {
        showAlert(
            'Import Data?',
            'This will overwrite all current habits. We recommend exporting your current data first.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Select File',
                    style: 'default',
                    onPress: async () => {
                        try {
                            const result = await DocumentPicker.getDocumentAsync({
                                type: 'application/json',
                                copyToCacheDirectory: true
                            });

                            if (result.canceled) return;

                            const fileUri = result.assets[0].uri;
                            const content = await FileSystem.readAsStringAsync(fileUri);
                            const data = JSON.parse(content);

                            const success = await importHabits(data);
                            if (success) {
                                showAlert('Success', 'Habits imported successfully!');
                            } else {
                                showAlert('Error', 'Invalid backup file format.');
                            }
                        } catch (error) {
                            showAlert('Error', 'Failed to import data: ' + error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = () => {
        showAlert(
            'Delete All Data?',
            'This action is irreversible. All your habits, streaks, and history will be permanently deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        await resetApp();
                        if (Platform.OS === 'android') {
                            BackHandler.exitApp();
                        } else {
                            showAlert('Data Deleted', 'Please restart the app to complete the reset.');
                        }
                    }
                }
            ]
        );
    };

    const OptionItem = ({ icon, title, description, onPress, color = textColor }) => (
        <AnimatedPressable style={[styles.optionCard, { backgroundColor: cardColor }]} onPress={onPress}>
            <View style={[styles.iconBox, { backgroundColor: color === dangerColor ? '#fee2e2' : accentColor + '20' }]}>
                {icon}
            </View>
            <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color }]}>{title}</Text>
                <Text style={[styles.optionDesc, { color: subTextColor }]}>{description}</Text>
            </View>
        </AnimatedPressable>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar hidden={true} />
            <View style={styles.header}>
                <AnimatedPressable onPress={onClose} style={[styles.backButton, { backgroundColor: cardColor }]}>
                    <ArrowLeft color={textColor} size={24} />
                </AnimatedPressable>
                <Text style={[styles.headerTitle, { color: textColor }]}>Data Management</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: accentColor }]}>BACKUP & RESTORE</Text>
                    <OptionItem
                        icon={<Save color={accentColor} size={24} />}
                        title="Export Backup"
                        description="Save your habits and progress to a JSON file."
                        onPress={handleExport}
                    />
                    <OptionItem
                        icon={<Upload color={accentColor} size={24} />}
                        title="Import Backup"
                        description="Restore data from a previously exported JSON file."
                        onPress={handleImport}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: dangerColor }]}>DANGER ZONE</Text>
                    <OptionItem
                        icon={<Trash2 color={dangerColor} size={24} />}
                        title="Delete All Data"
                        description="Permanently remove all local data and reset the app."
                        onPress={handleDelete}
                        color={dangerColor}
                    />
                </View>

                <View style={[styles.infoBox, { borderColor: subTextColor + '40' }]}>
                    <AlertTriangle color={subTextColor} size={16} />
                    <Text style={[styles.infoText, { color: subTextColor }]}>
                        HabitU stores data locally on your device. Exporting your data regularly is recommended to prevent data loss.
                    </Text>
                </View>
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
    section: {
        marginBottom: 32,
        gap: 16,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
        opacity: 0.9,
    },
    optionCard: {
        padding: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    optionDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderWidth: 1,
        borderRadius: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    }
});

export default DataSettingsScreen;
