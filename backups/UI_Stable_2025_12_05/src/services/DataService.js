import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

export const exportData = async (data) => {
    try {
        const fileUri = FileSystem.documentDirectory + 'habitu_backup.json';
        await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            alert('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data');
    }
};

export const importData = async () => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });

        if (result.canceled) return null;

        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const data = JSON.parse(fileContent);

        return data;
    } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import data');
        return null;
    }
};
