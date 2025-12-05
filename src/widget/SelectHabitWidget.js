import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function SelectHabitWidget({ widgetId, widgetName }) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#1a1a1a',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16
            }}
            clickAction="OPEN_URI"
            clickActionData={{ uri: `habitu://widget-config/${widgetName}/${widgetId}` }}
        >
            <TextWidget
                text="Tap to Select Habit"
                style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center'
                }}
            />
            <TextWidget
                text="+"
                style={{
                    fontSize: 32,
                    color: '#2dd4bf',
                    marginTop: 8
                }}
            />
        </FlexWidget>
    );
}
