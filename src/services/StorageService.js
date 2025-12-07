import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    HABITS: 'habits',
    SETTINGS: 'settings',
    USER_PROFILE: 'userProfile',
    UNLOCKED_THEMES: 'unlockedThemes',
    WIDGET_CONFIG: 'widget_config',
    USER: 'user', // SyncService uses this
};

class StorageService {
    /**
     * Generic get Item
     */
    async getItem(key, defaultValue = null) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
        } catch (e) {
            console.error(`[StorageService] Error reading ${key}`, e);
            return defaultValue;
        }
    }

    /**
     * Generic set Item
     */
    async setItem(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (e) {
            console.error(`[StorageService] Error saving ${key}`, e);
            return false;
        }
    }

    // --- Specialized Methods ---

    async getHabits() {
        return this.getItem(KEYS.HABITS, []);
    }

    async saveHabits(habits) {
        return this.setItem(KEYS.HABITS, habits);
    }

    async getSettings() {
        // Default settings
        const defaults = {
            weekStart: 'Monday',
            highlightCurrentDay: true,
            showStreakCount: true,
            showStreakGoal: true,
            showMonthLabels: true,
            showDayLabels: true,
            theme: 'dark',
            accentColor: '#2dd4bf',
            cardStyle: 'heatmap',
            viewMode: 'list',
        };
        const saved = await this.getItem(KEYS.SETTINGS, {});
        return { ...defaults, ...saved };
    }

    async saveSettings(settings) {
        return this.setItem(KEYS.SETTINGS, settings);
    }

    async getUserProfile() {
        return this.getItem(KEYS.USER_PROFILE, {});
    }

    async saveUserProfile(profile) {
        return this.setItem(KEYS.USER_PROFILE, profile);
    }

    async getUnlockedThemes() {
        const unlocks = await this.getItem(KEYS.UNLOCKED_THEMES, {});
        // Filter expired
        const now = Date.now();
        const validUnlocks = {};
        let hasChanges = false;

        Object.keys(unlocks).forEach(key => {
            if (unlocks[key] > now) {
                validUnlocks[key] = unlocks[key];
            } else {
                hasChanges = true;
            }
        });

        if (hasChanges) {
            await this.saveUnlockedThemes(validUnlocks);
        }
        return validUnlocks;
    }

    async saveUnlockedThemes(themes) {
        return this.setItem(KEYS.UNLOCKED_THEMES, themes);
    }

    async getWidgetConfig() {
        return this.getItem(KEYS.WIDGET_CONFIG, {});
    }

    async saveWidgetConfig(config) {
        return this.setItem(KEYS.WIDGET_CONFIG, config);
    }

    async getUser() {
        return this.getItem(KEYS.USER, null);
    }

    async clearAll() {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (e) {
            console.error('[StorageService] Failed to clear storage', e);
            throw e;
        }
    }
}

export default new StorageService();
