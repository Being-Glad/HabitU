import React from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ScaleButton = ({
    children,
    onPress,
    onLongPress,
    style,
    scaleTo = 0.95,
    haptic = true,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
    activeOpacity = 1,
    disabled = false,
    springConfig = { damping: 15, stiffness: 150 },
    hitSlop = 10,
    ...props
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        };
    });

    const handlePressIn = () => {
        if (disabled) return;
        scale.value = withSpring(scaleTo, springConfig);
        if (activeOpacity < 1) {
            opacity.value = withTiming(activeOpacity, { duration: 150 });
        }
    };

    const handlePressOut = () => {
        if (disabled) return;
        scale.value = withSpring(1, springConfig);
        if (activeOpacity < 1) {
            opacity.value = withTiming(1, { duration: 150 });
        }
    };

    const handlePress = (e) => {
        if (disabled) return;
        if (haptic) {
            Haptics.impactAsync(hapticStyle);
        }
        if (onPress) onPress(e);
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            hitSlop={hitSlop}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedPressable>
    );
};

export default ScaleButton;
