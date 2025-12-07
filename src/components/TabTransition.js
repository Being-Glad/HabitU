import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing
} from 'react-native-reanimated';

const TabTransition = ({ isActive, children, style }) => {
    const opacity = useSharedValue(isActive ? 1 : 0);
    // Scale slightly for a "zoom out" effect when exiting, "zoom in" when entering?
    // Or just simple fade. "Apple-like" is usually a lateral slide or a cross-fade.
    // Deep navigation stacks slide, tab bars often cross-fade (or no animation).
    // Let's go with a clean cross-fade.

    useEffect(() => {
        opacity.value = withTiming(isActive ? 1 : 0, {
            duration: 400,
            easing: Easing.inOut(Easing.ease)
        });
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        // We use zIndex to ensure active tab is clickable.
        // During transition, keeping the entering one on top is nice?
        // Actually, preventing user interaction on fading out tab is handled by pointerEvents.
        zIndex: isActive ? 1 : 0,
    }));

    return (
        <Animated.View
            style={[
                StyleSheet.absoluteFill,
                style,
                animatedStyle
            ]}
            pointerEvents={isActive ? 'auto' : 'none'}
        >
            {children}
        </Animated.View>
    );
};

export default TabTransition;
