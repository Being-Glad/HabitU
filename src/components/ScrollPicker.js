import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

const ITEM_HEIGHT = 45;

const ScrollPicker = ({ min, max, step = 1, value, onValueChange, unit = '', options = [], containerStyle, itemStyle, showOverlay = true }) => {
    const scrollViewRef = useRef(null);

    // Generate data from options or min/max
    const data = options.length > 0
        ? options
        : Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + (i * step));

    useEffect(() => {
        // Scroll to initial value
        if (value !== undefined && value !== null && scrollViewRef.current) {
            const index = data.findIndex(item => item.toString() === value.toString());
            if (index !== -1) {
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
                }, 100);
            }
        }
    }, []);

    const handleMomentumScrollEnd = (ev) => {
        const offsetY = ev.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const safeIndex = Math.max(0, Math.min(index, data.length - 1));
        const newValue = data[safeIndex];

        if (newValue !== undefined && newValue !== value) {
            onValueChange(newValue);
            Haptics.selectionAsync();
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {showOverlay && <View style={styles.selectionOverlay} pointerEvents="none" />}
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                nestedScrollEnabled={true}
            >
                {data.map((item, index) => {
                    const isSelected = item.toString() === value?.toString();
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.item, { height: ITEM_HEIGHT }]}
                            onPress={() => {
                                onValueChange(item);
                                scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
                                Haptics.selectionAsync();
                            }}
                        >
                            <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                                {item} <Text style={styles.unitText}>{unit}</Text>
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: ITEM_HEIGHT * 3,
        width: '100%',
        backgroundColor: '#18181b',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    item: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 18,
        color: '#71717a',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        lineHeight: ITEM_HEIGHT,
        paddingBottom: 2, // Nudge text up slightly
    },
    selectedText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2dd4bf',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        lineHeight: ITEM_HEIGHT,
        paddingBottom: 2, // Nudge text up slightly
    },
    unitText: {
        fontSize: 14,
        color: '#52525b',
    },
    selectionOverlay: {
        position: 'absolute',
        top: ITEM_HEIGHT,
        left: 0,
        right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#2dd4bf',
        backgroundColor: 'rgba(45, 212, 191, 0.05)',
        zIndex: 10,
    }
});

export default ScrollPicker;
