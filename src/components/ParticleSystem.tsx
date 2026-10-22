import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BurstParticle, FloatingSpawn } from '../types/sensory';
import { FruitSvgArt } from './FruitSvgArt';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface ParticleSystemProps {
  burstParticles: BurstParticle[];
  floatingSpawns: FloatingSpawn[];
}

/**
 * Individual Confetti / Juice Droplet particle animated at 60fps.
 */
const BurstParticleItem: React.FC<{ particle: BurstParticle }> = React.memo(
  ({ particle }) => {
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }, [progress]);

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, particle.vx],
    });

    const translateY = progress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, particle.vy * 0.45, particle.vy + 135],
    });

    const scale = progress.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [0.1, 1.1, 0.15],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.7, 1],
      outputRange: [1, 1, 0],
    });

    const rotate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [`${particle.rotation}deg`, `${particle.rotation + 260}deg`],
    });

    const isDroplet = particle.shape === 'droplet';
    const isStar = particle.shape === 'star';

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.particleBase,
          {
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: isDroplet ? particle.size * 1.35 : particle.size,
            backgroundColor: isStar ? 'transparent' : particle.color,
            borderRadius: isDroplet
              ? particle.size
              : particle.shape === 'confetti'
                ? 4
                : particle.size / 2,
            shadowColor: particle.color,
            opacity,
            transform: [{ translateX }, { translateY }, { scale }, { rotate }],
          },
        ]}
      >
        {isStar && (
          <Svg width={particle.size} height={particle.size} viewBox="0 0 32 32">
            <Path
              d="M 16 2 L 20 11 L 30 12.5 L 22.5 19.5 L 24.5 29.5 L 16 24.5 L 7.5 29.5 L 9.5 19.5 L 2 12.5 L 12 11 Z"
              fill={particle.color}
            />
          </Svg>
        )}
      </Animated.View>
    );
  }
);

/**
 * Background tap spawn: either a sparkling neon star or a mini floating fruit
 * that rises upward from the exact touch coordinates and fades away.
 */
const FloatingSpawnItem: React.FC<{ spawn: FloatingSpawn }> = React.memo(
  ({ spawn }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const popScale = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(popScale, {
            toValue: spawn.scale * 1.18,
            friction: 5,
            tension: 180,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(popScale, {
            toValue: spawn.scale * 0.85,
            friction: 7,
            tension: 110,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1850,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }, [popScale, progress, spawn.scale]);

    const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -185],
    });

    const translateX = progress.interpolate({
      inputRange: [0, 0.33, 0.66, 1],
      outputRange: [0, spawn.driftX, -spawn.driftX * 0.7, spawn.driftX * 0.4],
    });

    const rotate = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['-10deg', '14deg', '-8deg'],
    });

    const opacity = progress.interpolate({
      inputRange: [0, 0.65, 1],
      outputRange: [1, 1, 0],
    });

    const size = spawn.kind === 'miniFruit' ? 76 : 64;

    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.spawnBase,
          {
            left: spawn.x - size / 2,
            top: spawn.y - size / 2,
            width: size,
            height: size,
            opacity,
            transform: [
              { translateX },
              { translateY },
              { scale: popScale },
              { rotate },
            ],
          },
        ]}
      >
        {spawn.kind === 'miniFruit' ? (
          <FruitSvgArt type={spawn.fruitType} size={size} isWinking={true} />
        ) : (
          <View
            style={[
              styles.neonStarContainer,
              {
                shadowColor: spawn.color,
              },
            ]}
          >
            <Svg width={size} height={size} viewBox="0 0 64 64">
              <Path
                d="M 32 4 L 39 22 L 58 25 L 44 38 L 48 57 L 32 47 L 16 57 L 20 38 L 6 25 L 25 22 Z"
                fill={spawn.color}
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Cute mini eyes on the neon star */}
              <Path
                d="M 24 30 A 2.4 2.4 0 1 1 24 30.1 M 40 30 A 2.4 2.4 0 1 1 40 30.1"
                stroke="#18121E"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <Path
                d="M 28 36 Q 32 40 36 36"
                stroke="#18121E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        )}
      </Animated.View>
    );
  }
);

export const ParticleSystem: React.FC<ParticleSystemProps> = React.memo(
  ({ burstParticles, floatingSpawns }) => {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {floatingSpawns.map((spawn) => (
          <FloatingSpawnItem key={spawn.id} spawn={spawn} />
        ))}
        {burstParticles.map((particle) => (
          <BurstParticleItem key={particle.id} particle={particle} />
        ))}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  particleBase: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  spawnBase: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonStarContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 14,
  },
});
