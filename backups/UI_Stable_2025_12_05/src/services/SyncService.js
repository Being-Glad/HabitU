import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HABITS_COLLECTION = 'habits';

export const SyncService = {
    async syncHabits(userId, localHabits) {
        if (!userId) return localHabits;

        try {
            const userDocRef = firestore().collection('users').doc(userId);
            const doc = await userDocRef.get();

            if (doc.exists) {
                const cloudData = doc.data();
                const cloudHabits = cloudData.habits || [];
                const lastSynced = cloudData.lastSynced || 0;

                // Merge Strategy:
                // 1. Create a map of all habits by ID
                // 2. If habit exists in both, take the one with latest 'updatedAt' (if we tracked it)
                // 3. For now, we'll assume Cloud is source of truth if it has data, 
                //    BUT we want to preserve local offline changes.

                // Simple Merge: Union of IDs. 
                // If conflict, prefer Cloud? Or prefer Local?
                // Let's prefer Local if it has changed recently? 
                // Without complex conflict resolution, let's do:
                // Cloud wins if it exists. Local wins if new.

                // Better: 
                // We should probably just overwrite Cloud with Local if Local is "newer" or has more data?
                // Let's implement a simple "Union" merge.

                const mergedHabits = [...localHabits];

                cloudHabits.forEach(cloudHabit => {
                    const localIndex = mergedHabits.findIndex(h => h.id === cloudHabit.id);
                    if (localIndex === -1) {
                        // New habit from cloud
                        mergedHabits.push(cloudHabit);
                    } else {
                        // Conflict. 
                        // Ideally we check timestamps. 
                        // For now, let's assume Cloud > Local to prevent overwriting other devices.
                        // mergedHabits[localIndex] = cloudHabit; 

                        // Actually, for offline-first, Local is usually fresher.
                        // Let's keep Local.
                    }
                });

                // Push merged back to cloud
                await userDocRef.set({
                    habits: mergedHabits,
                    lastSynced: Date.now()
                }, { merge: true });

                return mergedHabits;
            } else {
                // First sync, push local to cloud
                await userDocRef.set({
                    habits: localHabits,
                    lastSynced: Date.now()
                });
                return localHabits;
            }
        } catch (error) {
            console.error('Sync failed:', error);
            return localHabits; // Fallback to local
        }
    },

    async updateUserStats(userId, stats) {
        if (!userId) return;
        try {
            await firestore().collection('users').doc(userId).set({
                ...stats,
                lastActive: firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Stats sync failed:', error);
        }
    }
};
