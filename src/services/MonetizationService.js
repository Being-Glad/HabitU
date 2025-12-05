import { Share, Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration URLs
// TODO: Upload config.json to GitHub and paste the RAW URL here
const CONFIG_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/HabitU-Config/main/config.json';
const FALLBACK_CONFIG = {
    min_version: '1.0.0',
    resources: [
        {
            id: 'atomic_habits',
            title: 'Atomic Habits',
            author: 'James Clear',
            description: 'The definitive guide to breaking bad habits and building good ones.',
            link: 'https://jamesclear.com/atomic-habits', // Replace with affiliate link
            icon: 'book',
            imageUrl: 'https://m.media-amazon.com/images/I/81wgcld4wxL._SL1500_.jpg'
        },
        {
            id: 'power_of_habit',
            title: 'The Power of Habit',
            author: 'Charles Duhigg',
            description: 'Why we do what we do in life and business.',
            link: 'https://charlesduhigg.com/the-power-of-habit/', // Replace with affiliate link
            icon: 'book',
            imageUrl: 'https://m.media-amazon.com/images/I/71i05dC02hL._SL1500_.jpg'
        },
        // ---------------------------------------------------------
        // COPY & PASTE THE BLOCK BELOW TO ADD A NEW BOOK:
        // {
        //     id: 'unique_id_here',
        //     title: 'Book Title Here',
        //     author: 'Author Name',
        //     description: 'Short description of the book...',
        //     link: 'YOUR_AMAZON_AFFILIATE_LINK_HERE',
        //     icon: 'book',
        //     imageUrl: 'IMAGE_URL_FROM_AMAZON_HERE'
        // },
        // ---------------------------------------------------------
    ]
};

export const MonetizationService = {
    // 1. Share to Unlock
    unlockViaShare: async (themeId) => {
        try {
            const result = await Share.share({
                message: `Check out HabitU! It's a beautiful, distraction-free habit tracker that helps me stay consistent. Download it here: https://github.com/Being-Glad/HabitU/releases`,
                url: 'https://github.com/Being-Glad/HabitU/releases', // iOS adds this as a link
                title: 'HabitU - Build Better Habits'
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    return true;
                } else {
                    // shared
                    return true;
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
                return false;
            }
        } catch (error) {
            console.error(error.message);
            return false;
        }
    },

    // 2. Donation
    openDonation: async () => {
        const url = 'https://buymeacoffee.com/beingglad'; // Replace with your actual link if different
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert("Error", "Could not open donation link.");
        }
    },

    openGitHub: async () => {
        const url = 'https://github.com/Being-Glad/HabitU';
        await Linking.openURL(url);
    },

    // 3. Dynamic Config (Resources & Version Check)
    fetchConfig: async () => {
        try {
            // Try fetching from remote
            const response = await fetch(CONFIG_URL);
            if (response.ok) {
                const json = await response.json();
                // Cache it for offline use
                await AsyncStorage.setItem('remote_config', JSON.stringify(json));
                return json;
            }
            throw new Error('Network response was not ok');
        } catch (error) {
            console.log("Config fetch failed, using cached or fallback:", error.message);
            // Return cached if available, otherwise fallback
            const cached = await AsyncStorage.getItem('remote_config');
            return cached ? JSON.parse(cached) : FALLBACK_CONFIG;
        }
    },

    checkVersion: async (currentVersion) => {
        const config = await MonetizationService.fetchConfig();
        const minVersion = config.min_version;

        // Simple semantic version comparison
        const v1 = currentVersion.split('.').map(Number);
        const v2 = minVersion.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (v1[i] < v2[i]) return false; // Update required
            if (v1[i] > v2[i]) return true;
        }
        return true; // Equal
    }
};
