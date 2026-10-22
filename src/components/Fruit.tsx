import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  BEAT_DURATION_MS,
  FruitConfig,
} from '../types/sensory';
import { FruitSvgArt } from './FruitSvgArt';

interface FruitProps {
  config: FruitConfig;
  x: number;
  y: number;
  size: number;
  isSpotlight?: boolean;
  onFruitTap: (config: FruitConfig, tapX: number, tapY: number) => void;
}

export const Fruit: React.FC<FruitProps> = React.memo(
  ({ config, x, y, size, isSpotlight = false, onFruitTap }) => {
    const [isWinking, setIsWinking] = useState(false);
    const winkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tapCountRef = useRef(0);

    // Continuous 120 BPM Cumbia ambient dance shared values
    const danceBobY = useSharedValue(0);
    const danceSwayX = useSharedValue(0);
    const danceRockDeg = useSharedValue(0);
    const dancePulseScale = useSharedValue(1);
    const spotlightGlowScale = useSharedValue(1);

    // Interactive touch reaction shared values
    const squashX = useSharedValue(1);
    const squashY = useSharedValue(1);
    const reactionJumpY = useSharedValue(0);
    const reactionSpinDeg = useSharedValue(0);

    useEffect(() => {
      const staggerMs = Math.round((config.phaseOffset / (2 * Math.PI)) * BEAT_DURATION_MS);
      const swayAmplitude = isSpotlight ? 16 : 22;
      const bobAmplitude = isSpotlight ? 18 : 14;

      // 1. 120 BPM vertical Cumbia bounce (500ms per beat = 250ms down, 250ms up)
      danceBobY.value = withDelay(
        staggerMs,
        withRepeat(
          withSequence(
            withTiming(-bobAmplitude, {
              duration: BEAT_DURATION_MS / 2,
              easing: Easing.out(Easing.quad),
            }),
            withTiming(bobAmplitude * 0.45, {
              duration: BEAT_DURATION_MS / 2,
              easing: Easing.in(Easing.quad),
            })
          ),
          -1,
          false
        )
      );

      // 2. Subtle rhythmic groove pulse at 120 BPM
      dancePulseScale.value = withDelay(
        staggerMs,
        withRepeat(
          withSequence(
            withTiming(1.05, {
              duration: BEAT_DURATION_MS / 2,
              easing: Easing.out(Easing.sin),
            }),
            withTiming(0.96, {
              duration: BEAT_DURATION_MS / 2,
              easing: Easing.in(Easing.sin),
            })
          ),
          -1,
          false
        )
      );

      // 3. Side-to-side Cumbia hip sway (full bar = 2 beats each way)
      danceSwayX.value = withDelay(
        staggerMs,
        withRepeat(
          withSequence(
            withTiming(swayAmplitude, {
              duration: BEAT_DURATION_MS * 2,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(-swayAmplitude, {
              duration: BEAT_DURATION_MS * 2,
              easing: Easing.inOut(Easing.sin),
            })
          ),
          -1,
          true
        )
      );

      // 4. Rhythmic rocking tilt (-11deg to +11deg)
      danceRockDeg.value = withDelay(
        staggerMs,
        withRepeat(
          withSequence(
            withTiming(11, {
              duration: BEAT_DURATION_MS,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(-11, {
              duration: BEAT_DURATION_MS,
              easing: Easing.inOut(Easing.sin),
            })
          ),
          -1,
          true
        )
      );

      // 5. Spotlight aura pulse when in Solo Spotlight Mode
      if (isSpotlight) {
        spotlightGlowScale.value = withRepeat(
          withSequence(
            withTiming(1.16, {
              duration: BEAT_DURATION_MS,
              easing: Easing.inOut(Easing.sin),
            }),
            withTiming(0.94, {
              duration: BEAT_DURATION_MS,
              easing: Easing.inOut(Easing.sin),
            })
          ),
          -1,
          true
        );
      }

      return () => {
        cancelAnimation(danceBobY);
        cancelAnimation(dancePulseScale);
        cancelAnimation(danceSwayX);
        cancelAnimation(danceRockDeg);
        cancelAnimation(spotlightGlowScale);
      };
    }, [
      config.phaseOffset,
      danceBobY,
      dancePulseScale,
      danceRockDeg,
      danceSwayX,
      isSpotlight,
      spotlightGlowScale,
    ]);

    useEffect(() => {
      return () => {
        if (winkTimeoutRef.current) {
          clearTimeout(winkTimeoutRef.current);
        }
      };
    }, []);

    const handleTouchStart = useCallback(
      (event: GestureResponderEvent) => {
        event.stopPropagation();

        const { pageX, pageY } = event.nativeEvent;
        const burstX = pageX || x;
        const burstY = pageY || y;

        // Instant Squash on Press
        squashX.value = withTiming(1.24, { duration: 75 });
        squashY.value = withTiming(0.78, { duration: 75 });

        // Trigger Wink Expression
        setIsWinking(true);
        if (winkTimeoutRef.current) {
          clearTimeout(winkTimeoutRef.current);
        }
        winkTimeoutRef.current = setTimeout(() => {
          setIsWinking(false);
        }, 580);

        // Alternate or use fruit's signature reaction (360° spin + jump)
        tapCountRef.current += 1;
        const shouldSpin =
          config.reactionStyle === 'spin360' || tapCountRef.current % 2 === 0;

        // High Jump reaction
        reactionJumpY.value = withSequence(
          withTiming(-54, {
            duration: 210,
            easing: Easing.out(Easing.cubic),
          }),
          withSpring(0, {
            damping: 8,
            stiffness: 180,
          })
        );

        if (shouldSpin) {
          reactionSpinDeg.value = 0;
          reactionSpinDeg.value = withTiming(360, {
            duration: 480,
            easing: Easing.out(Easing.back(1.2)),
          });
        }

        // Notify parent for Haptics, Sound FX, and Confetti/Juice Droplet burst
        onFruitTap(config, burstX, burstY);
      },
      [config, onFruitTap, reactionJumpY, reactionSpinDeg, squashX, squashY, x, y]
    );

    const handleTouchEnd = useCallback(() => {
      // Pop outward on release with elastic squash-and-stretch spring
      squashX.value = withSequence(
        withTiming(0.86, { duration: 90 }),
        withSpring(1, { damping: 7, stiffness: 210 })
      );
      squashY.value = withSequence(
        withTiming(1.22, { duration: 90 }),
        withSpring(1, { damping: 7, stiffness: 210 })
      );
    }, [squashX, squashY]);

    const animatedFruitStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: danceSwayX.value },
          { translateY: danceBobY.value + reactionJumpY.value },
          { rotate: `${danceRockDeg.value + reactionSpinDeg.value}deg` },
          { scaleX: dancePulseScale.value * squashX.value },
          { scaleY: dancePulseScale.value * squashY.value },
        ],
      };
    });

    const animatedSpotlightStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: danceSwayX.value * 0.4 },
          { translateY: danceBobY.value * 0.4 },
          { scale: spotlightGlowScale.value },
        ],
      };
    });

    const spotlightDiameter = size * 1.65;

    return (
      <View
        style={[
          styles.container,
          {
            left: x - size / 2,
            top: y - size / 2,
            width: size,
            height: size,
          },
        ]}
        onStartShouldSetResponder={() => true}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Soft Colored Spotlight Aura in Solo Spotlight Mode */}
        {isSpotlight && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.spotlightAura,
              {
                width: spotlightDiameter,
                height: spotlightDiameter,
                borderRadius: spotlightDiameter / 2,
                backgroundColor: config.spotlightColor,
                shadowColor: config.glowColor,
              },
              animatedSpotlightStyle,
            ]}
          />
        )}

        {/* Animated Dancing Kawaii Fruit */}
        <Animated.View
          style={[
            styles.fruitShadowWrapper,
            {
              shadowColor: config.glowColor,
            },
            animatedFruitStyle,
          ]}
        >
          <FruitSvgArt type={config.id} size={size} isWinking={isWinking} />
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightAura: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 48,
  },
  fruitShadowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
  },
});
