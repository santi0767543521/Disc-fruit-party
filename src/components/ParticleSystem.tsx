import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BurstParticle, FloatingSpawn } from '../types/sensory';
import { FruitSvgArt } from './FruitSvgArt';

interface ParticleSystemProps {
  burstParticles: BurstParticle[];
  floatingSpawns: FloatingSpawn[];
}

/**
 * Individual Confetti / Juice Droplet particle animated on the UI thread at 60fps.
 */
const BurstParticleItem: React.FC<{ particle: BurstParticle }> = React.memo(
  ({ particle }) => {
    const progress = useSharedValue(0);

    useEffect(() => {
      progress.value = withTiming(1, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
      });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
      const t = progress.value;
      // Ballistic arc: outward velocity + downward gravity pull
      const translateX = particle.vx * t;
      const translateY = particle.vy * t + 150 * t * t;
      const scale = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) * 0.95;
      const opacity = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      const rotate = `${particle.rotation + t * 260}deg`;

      return {
        opacity: Math.max(0, opacity),
        transform: [{ translateX }, { translateY }, { scale }, { rotate }],
      };
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
          },
          animatedStyle,
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
    const progress = useSharedValue(0);
    const popScale = useSharedValue(0.2);

    useEffect(() => {
      popScale.value = withSequence(
        withSpring(spawn.scale * 1.18, { damping: 8, stiffness: 220 }),
        withSpring(spawn.scale, { damping: 12, stiffness: 150 })
      );
      progress.value = withTiming(1, {
        duration: 1850,
        easing: Easing.out(Easing.quad),
      });
    }, [popScale, progress, spawn.scale]);

    const animatedStyle = useAnimatedStyle(() => {
      const t = progress.value;
      const translateY = -185 * t;
      const translateX = Math.sin(t * Math.PI * 2.5) * spawn.driftX;
      const rotate = `${Math.sin(t * Math.PI * 2) * 18}deg`;
      const opacity = t < 0.65 ? 1 : 1 - (t - 0.65) / 0.35;

      return {
        opacity: Math.max(0, opacity),
        transform: [
          { translateX },
          { translateY },
          { scale: popScale.value * (1 - t * 0.25) },
          { rotate },
        ],
      };
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
          },
          animatedStyle,
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
