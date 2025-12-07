import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withDelay,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { PartyPopper, Check, X } from 'lucide-react-native';
import AnimatedPressable from './AnimatedPressable';

const { width } = Dimensions.get('window');

const ConfettiParticle = ({ p, color }) => {
    const style = useAnimatedStyle(() => ({
        transform: [{ translateX: p.x.value }, { translateY: p.y.value }],
        opacity: p.opacity.value,
        position: 'absolute'
    }));

    return (
        <Animated.View style={[style, { width: 8, height: 8, borderRadius: 4, backgroundColor: color }]} />
    );
};

const CelebrationModal = ({ visible, onClose, title = "Unlocked!", message = "You've earned a reward." }) => {
    const scale = useSharedValue(0);
    const rotate = useSharedValue(0);
    // Always create shared values, even if not visible, to avoid hook count mismatch if logic was conditional (it wasn't, but safety first)
    const particles = Array.from({ length: 12 }).map(() => ({
        x: useSharedValue(0),
        y: useSharedValue(0),
        opacity: useSharedValue(0)
    }));

    useEffect(() => {
        if (visible) {
            // Reset
            scale.value = 0;
            rotate.value = 0;

            // Premium "Apple-like" Entrance
            // Scale: Start slightly larger (0.9) and ease in to 1? No, 0.8 -> 1 is standard.
            // Using a custom bezier for that "snappy but smooth" feel. 
            // cubic-bezier(0.16, 1, 0.3, 1) is common for iOS.
            scale.value = withTiming(1, {
                duration: 400,
                easing: Easing.bezier(0.16, 1, 0.3, 1)
            });

            // Icon Reveal - subtle scaling ripple instead of rotation rock
            rotate.value = withSequence(
                withTiming(-5, { duration: 150 }),
                withTiming(5, { duration: 150 }),
                withTiming(0, { duration: 150 })
            );

            // Elegant Confetti Fountain
            particles.forEach((p, i) => {
                const angle = ((i / particles.length) * Math.PI) - (Math.PI / 2); // Semi-circle upwards
                // Add some randomness to spread
                const randomSpread = (Math.random() - 0.5) * 0.5;
                const finalAngle = angle + randomSpread;

                const velocity = 120 + Math.random() * 80;

                p.x.value = 0;
                p.y.value = 0;
                p.opacity.value = 1;

                // Physics-ish animation using timing
                p.x.value = withTiming(Math.cos(finalAngle) * 150, { duration: 1200, easing: Easing.out(Easing.quad) });
                // Y goes up then down (gravity)? Hard with simple timing. 
                // Let's just do an explosion outwards.
                p.y.value = withTiming(Math.sin(finalAngle) * 150, { duration: 1200, easing: Easing.out(Easing.quad) });
                p.opacity.value = withDelay(400, withTiming(0, { duration: 800 }));
            });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotate.value}deg` }]
    }));

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                {/* Confetti Particles */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {particles.map((p, i) => {
                            // Random colors
                            const color = ['#EF5350', '#FFA726', '#26A69A', '#AB47BC'][i % 4];
                            return <ConfettiParticle key={i} p={p} color={color} />;
                        })}
                    </View>
                </View>

                <Animated.View style={[styles.card, animatedStyle]}>
                    <Animated.View style={[styles.iconContainer, iconStyle]}>
                        <PartyPopper size={48} color="#FFD700" />
                    </Animated.View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <AnimatedPressable style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Awesome!</Text>
                    </AnimatedPressable>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    card: {
        backgroundColor: '#18181b', // Always dark/premium for this global modal
        width: Math.min(width - 40, 320),
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3f3f46',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        marginBottom: 24,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#a1a1aa',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    button: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    }
});

export default CelebrationModal;
