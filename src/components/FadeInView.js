import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FadeInView = ({ children, delay = 0, style, duration = 500, direction = 'down' }) => {
    // We can support direction if needed, but for now FadeInDown is standard list entry.
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(duration).springify().damping(15)}
            style={style}
        >
            {children}
        </Animated.View>
    );
};

export default FadeInView;
