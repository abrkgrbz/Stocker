import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';

export const DotBackground = () => {
    const { theme } = useTheme();
    const { width, height } = Dimensions.get('window');

    // Dot color based on theme
    const dotColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
    const backgroundColor = theme === 'dark' ? '#0f172a' : '#ffffff';

    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor, zIndex: -1 }]}>
            <Svg height="100%" width="100%">
                <Defs>
                    <Pattern
                        id="dot-pattern"
                        x="0"
                        y="0"
                        width="24"
                        height="24"
                        patternUnits="userSpaceOnUse"
                    >
                        <Circle cx="2" cy="2" r="1" fill={dotColor} />
                    </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#dot-pattern)" />
            </Svg>
            {/* Gradient Overlay for Fade Effect */}
            {/* This will be handled by the parent component using LinearGradient if creating a fade effect over it, 
                 but typically the dot pattern is the background. 
                 The "fade" in the landing page is usually a gradient mask or overlay.
                 We can add a subtle gradient overlay here if needed.
             */}
        </View>
    );
};
