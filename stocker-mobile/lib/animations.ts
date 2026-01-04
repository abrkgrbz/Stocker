import {
    withSequence,
    withTiming,
    withSpring,
    withRepeat,
    Easing,
    SharedValue,
    runOnJS,
} from 'react-native-reanimated';
import { impactHaptic } from './haptics';

/**
 * Shake animation for error states
 * Creates a horizontal shake effect
 */
export function shakeAnimation(shakeValue: SharedValue<number>, onComplete?: () => void) {
    'worklet';
    shakeValue.value = withSequence(
        withTiming(10, { duration: 50, easing: Easing.linear }),
        withTiming(-10, { duration: 50, easing: Easing.linear }),
        withTiming(8, { duration: 50, easing: Easing.linear }),
        withTiming(-8, { duration: 50, easing: Easing.linear }),
        withTiming(5, { duration: 50, easing: Easing.linear }),
        withTiming(-5, { duration: 50, easing: Easing.linear }),
        withTiming(0, { duration: 50, easing: Easing.linear }, () => {
            if (onComplete) {
                runOnJS(onComplete)();
            }
        })
    );
}

/**
 * Bounce animation for success states
 */
export function bounceAnimation(scaleValue: SharedValue<number>) {
    'worklet';
    scaleValue.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 400 }),
        withSpring(0.95, { damping: 10, stiffness: 400 }),
        withSpring(1.05, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
    );
}

/**
 * Pulse animation for attention
 */
export function pulseAnimation(scaleValue: SharedValue<number>, repeat: boolean = true) {
    'worklet';
    if (repeat) {
        scaleValue.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    } else {
        scaleValue.value = withSequence(
            withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) })
        );
    }
}

/**
 * Jelly animation for playful interactions
 */
export function jellyAnimation(scaleX: SharedValue<number>, scaleY: SharedValue<number>) {
    'worklet';
    scaleX.value = withSequence(
        withTiming(1.1, { duration: 100 }),
        withTiming(0.9, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
    );
    scaleY.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
    );
}

/**
 * Attention pulse for important elements
 */
export function attentionPulse(
    scaleValue: SharedValue<number>,
    opacityValue: SharedValue<number>
) {
    'worklet';
    scaleValue.value = withRepeat(
        withSequence(
            withTiming(1.2, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        3,
        true
    );
    opacityValue.value = withRepeat(
        withSequence(
            withTiming(0.3, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.in(Easing.ease) })
        ),
        3,
        true
    );
}

/**
 * Slide and fade in animation
 */
export function slideInAnimation(
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    fromY: number = 20
) {
    'worklet';
    translateY.value = fromY;
    opacity.value = 0;

    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });
}

/**
 * Zoom in animation
 */
export function zoomInAnimation(
    scale: SharedValue<number>,
    opacity: SharedValue<number>
) {
    'worklet';
    scale.value = 0.5;
    opacity.value = 0;

    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
}

/**
 * Floating animation for decorative elements
 */
export function floatAnimation(translateY: SharedValue<number>, amplitude: number = 10) {
    'worklet';
    translateY.value = withRepeat(
        withSequence(
            withTiming(-amplitude, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(amplitude, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
    );
}

/**
 * Rotation animation
 */
export function rotateAnimation(rotation: SharedValue<number>, duration: number = 1000) {
    'worklet';
    rotation.value = withRepeat(
        withTiming(360, { duration, easing: Easing.linear }),
        -1,
        false
    );
}

/**
 * Heartbeat animation for likes/favorites
 */
export function heartbeatAnimation(scale: SharedValue<number>) {
    'worklet';
    scale.value = withSequence(
        withTiming(1.3, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 100, easing: Easing.in(Easing.ease) }),
        withTiming(1.15, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) })
    );
}

/**
 * Pop animation for appearing elements
 */
export function popAnimation(scale: SharedValue<number>) {
    'worklet';
    scale.value = 0;
    scale.value = withSpring(1, {
        damping: 8,
        stiffness: 200,
        mass: 0.5,
    });
}

/**
 * Wiggle animation for playful elements
 */
export function wiggleAnimation(rotation: SharedValue<number>) {
    'worklet';
    rotation.value = withRepeat(
        withSequence(
            withTiming(-5, { duration: 100, easing: Easing.inOut(Easing.ease) }),
            withTiming(5, { duration: 100, easing: Easing.inOut(Easing.ease) }),
            withTiming(-3, { duration: 100, easing: Easing.inOut(Easing.ease) }),
            withTiming(3, { duration: 100, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 100, easing: Easing.inOut(Easing.ease) })
        ),
        1,
        false
    );
}
