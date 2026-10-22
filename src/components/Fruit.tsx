import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { BEAT_DURATION_MS, FruitConfig } from '../types/sensory';
import { FruitSvgArt } from './FruitSvgArt';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

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

    // Continuous 120 BPM Cumbia ambient dance values (60fps native driver)
    const danceBobY = useRef(new Animated.Value(0)).current;
    const danceSwayX = useRef(new Animated.Value(0)).current;
    const danceRock = useRef(new Animated.Value(0)).current;
    const dancePulseScale = useRef(new Animated.Value(1)).current;
    const spotlightGlowScale = useRef(new Animated.Value(1)).current;

    // Interactive touch reaction values
    const squashX = useRef(new Animated.Value(1)).current;
    const squashY = useRef(new Animated.Value(1)).current;
    const reactionJumpY = useRef(new Animated.Value(0)).current;
    const reactionSpin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const staggerMs = Math.round(
        (config.phaseOffset / (2 * Math.PI)) * BEAT_DURATION_MS
      );
      const swayAmplitude = isSpotlight ? 16 : 22;
      const bobAmplitude = isSpotlight ? 18 : 14;

      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(danceBobY, {
            toValue: -bobAmplitude,
            duration: BEAT_DURATION_MS / 2,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(danceBobY, {
            toValue: bobAmplitude * 0.45,
            duration: BEAT_DURATION_MS / 2,
            easing: Easing.in(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(dancePulseScale, {
            toValue: 1.05,
            duration: BEAT_DURATION_MS / 2,
            easing: Easing.out(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(dancePulseScale, {
            toValue: 0.96,
            duration: BEAT_DURATION_MS / 2,
            easing: Easing.in(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

      const swayLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(danceSwayX, {
            toValue: swayAmplitude,
            duration: BEAT_DURATION_MS * 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(danceSwayX, {
            toValue: -swayAmplitude,
            duration: BEAT_DURATION_MS * 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

      const rockLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(danceRock, {
            toValue: 1,
            duration: BEAT_DURATION_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(danceRock, {
            toValue: -1,
            duration: BEAT_DURATION_MS,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );

      const glowLoop = isSpotlight
        ? Animated.loop(
            Animated.sequence([
              Animated.timing(spotlightGlowScale, {
                toValue: 1.16,
                duration: BEAT_DURATION_MS,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: USE_NATIVE_DRIVER,
              }),
              Animated.timing(spotlightGlowScale, {
                toValue: 0.94,
                duration: BEAT_DURATION_MS,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: USE_NATIVE_DRIVER,
              }),
            ])
          )
        : null;

      const startTimer = setTimeout(() => {
        bobLoop.start();
        pulseLoop.start();
        swayLoop.start();
        rockLoop.start();
        glowLoop?.start();
      }, staggerMs);

      return () => {
        clearTimeout(startTimer);
        bobLoop.stop();
        pulseLoop.stop();
        swayLoop.stop();
        rockLoop.stop();
        glowLoop?.stop();
      };
    }, [
      config.phaseOffset,
      danceBobY,
      dancePulseScale,
      danceRock,
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
        Animated.parallel([
          Animated.timing(squashX, {
            toValue: 1.24,
            duration: 75,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(squashY, {
            toValue: 0.78,
            duration: 75,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]).start();

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
        Animated.sequence([
          Animated.timing(reactionJumpY, {
            toValue: -54,
            duration: 210,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(reactionJumpY, {
            toValue: 0,
            friction: 5,
            tension: 140,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]).start();

        if (shouldSpin) {
          reactionSpin.setValue(0);
          Animated.timing(reactionSpin, {
            toValue: 1,
            duration: 480,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: USE_NATIVE_DRIVER,
          }).start();
        }

        // Notify parent for Haptics, Sound FX, and Confetti/Juice Droplet burst
        onFruitTap(config, burstX, burstY);
      },
      [config, onFruitTap, reactionJumpY, reactionSpin, squashX, squashY, x, y]
    );

    const handleTouchEnd = useCallback(() => {
      // Pop outward on release with elastic squash-and-stretch spring
      Animated.parallel([
        Animated.sequence([
          Animated.timing(squashX, {
            toValue: 0.86,
            duration: 90,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(squashX, {
            toValue: 1,
            friction: 4,
            tension: 160,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.timing(squashY, {
            toValue: 1.22,
            duration: 90,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(squashY, {
            toValue: 1,
            friction: 4,
            tension: 160,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start();
    }, [squashX, squashY]);

    const combinedTranslateY = Animated.add(danceBobY, reactionJumpY);
    const combinedScaleX = Animated.multiply(dancePulseScale, squashX);
    const combinedScaleY = Animated.multiply(dancePulseScale, squashY);

    const rockDeg = danceRock.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-11deg', '11deg'],
    });

    const spinDeg = reactionSpin.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
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
                transform: [{ scale: spotlightGlowScale }],
              },
            ]}
          />
        )}

        {/* Animated Dancing Kawaii Fruit */}
        <Animated.View
          style={[
            styles.fruitShadowWrapper,
            {
              shadowColor: config.glowColor,
              transform: [
                { translateX: danceSwayX },
                { translateY: combinedTranslateY },
                { rotate: rockDeg },
                { rotateZ: spinDeg },
                { scaleX: combinedScaleX },
                { scaleY: combinedScaleY },
              ],
            },
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
