import { Alert } from 'react-native';

// Mock Ad Service
// In a real app, this would wrap 'react-native-google-mobile-ads'

export const AdService = {
    showRewardedAd: async (rewardName) => {
        return new Promise((resolve) => {
            // Simulate loading/watching time
            Alert.alert(
                "Watching Ad...",
                `Simulating a 5-second video ad for: ${rewardName}\n\n(This is a mock. In production, a real video would play here.)`,
                [
                    {
                        text: "Close (Reward Earned)",
                        onPress: () => {
                            resolve(true);
                        }
                    }
                ]
            );
        });
    }
};
