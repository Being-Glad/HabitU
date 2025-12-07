import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SyncService } from '../services/SyncService';
import StorageService from '../services/StorageService';
import GamificationService from '../services/GamificationService';

export const useCloudSync = (habits) => {
    const { user } = useAuth();

    // Sync on habits change (With Debounce?)
    // Original code synced immediately on 'saveHabitsToStorage'. 
    // Reactive sync is cleaner but might be too frequent.
    // The original code passed 'currentHabits' to syncWithCloud.

    // We can just listen to 'habits' and 'user'.

    useEffect(() => {
        if (!user || user.isGuest) return;

        const sync = async () => {
            try {
                // In a real production app, we might check timestamps to see if cloud is newer.
                // The original code: SyncService.syncHabits(user.uid, currentHabits);
                // And it updated local state if cloud was newer.
                // This 'two-way binding' via effect might cause loops if not careful.

                // For now, let's implement the 'Upload' part primarily, as 'Download' usually happens on mount/login.
                // Wait, the original code had:
                // if (syncedHabits && different) setHabits(syncedHabits)

                // If we do that here, we need ability to setHabits.
                // To avoid complexity, maybe we just handle the 'Upload' side here
                // and 'Download' side inside useHabitPersistence's loadData? 

                // Actually, let's look at the original syncWithCloud:
                // It syncd UP, then got the result, and if result diff, set DOWN.

                // We will leave the "Push to Cloud" here.

                await SyncService.syncHabits(user.uid, habits);

                // Update stats
                const maxStreak = habits.length > 0
                    ? Math.max(...habits.map(h => GamificationService.calculateStreak(h) || 0))
                    : 0;

                await SyncService.updateUserStats(user.uid, { streak: maxStreak });

            } catch (e) {
                console.log('[useCloudSync] Sync error', e);
            }
        };

        // Debounce 2s
        const timeout = setTimeout(sync, 2000);
        return () => clearTimeout(timeout);

    }, [habits, user]);
};
