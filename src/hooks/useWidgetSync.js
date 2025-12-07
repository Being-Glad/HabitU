import { useEffect, useRef } from 'react';
import StorageService from '../services/StorageService';
import WidgetService from '../services/WidgetService';

export const useWidgetSync = (habits, settings) => {
    // We want to avoid overly frequent updates, but habits change only on user action.
    // However, we need to know the 'widget_config' to update them.

    // We can fetch config inside the effect, or better, keep the config in state?
    // The previous implementation fetched it every time. Let's do that for safety.

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            // Maybe don't run on mount if we assume initial render is handled?
            // Actually, we should run to ensure widgets are in sync with app start.
        }

        const syncWidgets = async () => {
            try {
                const config = await StorageService.getWidgetConfig();
                if (config && Object.keys(config).length > 0) {
                    await WidgetService.updateAllWidgets(habits, config, settings);
                }
            } catch (e) {
                console.error('[useWidgetSync] Failed to sync widgets', e);
            }
        };

        // Debounce?
        const timeoutId = setTimeout(() => {
            syncWidgets();
        }, 1000); // 1s debounce to let multiple habit updates settle (e.g. sync from cloud)

        return () => clearTimeout(timeoutId);

    }, [habits, settings]);
};
