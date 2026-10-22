import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Fruit } from './src/components/Fruit';
import { ModeToggleControl } from './src/components/ModeToggleControl';
import { ParticleSystem } from './src/components/ParticleSystem';
import { useHaptics } from './src/hooks/useHaptics';
import { useSoundEffects } from './src/hooks/useSoundEffects';
import {
  BurstParticle,
  DisplayMode,
  FRUIT_CONFIGS,
  FloatingSpawn,
  FruitConfig,
  FruitType,
} from './src/types/sensory';

const NEON_STAR_COLORS = [
  '#FFE600',
  '#FF2A85',
  '#00F5D4',
  '#38E54D',
  '#FF9E00',
  '#B5179E',
];

export default function App() {
  const { width, height } = useWindowDimensions();

  // Display mode state: 'party' (4-6 fruits) or 'spotlight' (1 large center fruit)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('party');
  const [partyFruitCount, setPartyFruitCount] = useState<number>(6);
  const [spotlightFruit, setSpotlightFruit] = useState<FruitType>('pineapple');

  // Active particle bursts & floating background spawns
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [floatingSpawns, setFloatingSpawns] = useState<FloatingSpawn[]>([]);

  const idCounterRef = useRef<number>(0);

  // Haptics & Procedural Audio hooks
  const {
    triggerFruitHaptic,
    triggerBackgroundSpawnHaptic,
    triggerModeSwitchHaptic,
  } = useHaptics();

  const {
    playFruitSound,
    playSpawnSound,
    isMusicMuted,
    toggleMusicMute,
  } = useSoundEffects();

  // Hide Android navigation bar & configure full-screen mobile web/PWA behavior
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch(() => {});
      NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => {});
      NavigationBar.setBackgroundColorAsync('#000000').catch(() => {});
    } else if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#000000';
      document.body.style.backgroundColor = '#000000';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.userSelect = 'none';

      const ensureMeta = (name: string, content: string) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement('meta');
          tag.setAttribute('name', name);
          document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
      };

      ensureMeta(
        'viewport',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
      ensureMeta('apple-mobile-web-app-capable', 'yes');
      ensureMeta(
        'apple-mobile-web-app-status-bar-style',
        'black-translucent'
      );
      ensureMeta('theme-color', '#000000');
    }
  }, []);

  // Periodic garbage collection for finished particles & floating spawns
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBurstParticles((prev) =>
        prev.length === 0 ? prev : prev.filter((p) => now - p.createdAt < 900)
      );
      setFloatingSpawns((prev) =>
        prev.length === 0 ? prev : prev.filter((s) => now - s.createdAt < 1900)
      );
    }, 350);

    return () => clearInterval(interval);
  }, []);

  /**
   * Spawns a colorful spray of juice droplets, confetti, and stars when a fruit is tapped.
   */
  const handleFruitTap = useCallback(
    (config: FruitConfig, tapX: number, tapY: number) => {
      triggerFruitHaptic(config.id);
      playFruitSound(config.id);

      const now = Date.now();
      const count = 18;
      const newParticles: BurstParticle[] = [];
      const shapes: BurstParticle['shape'][] = [
        'droplet',
        'confetti',
        'star',
        'droplet',
      ];

      for (let i = 0; i < count; i++) {
        idCounterRef.current += 1;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = 75 + Math.random() * 145;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 65; // Upward fountain bias

        newParticles.push({
          id: `burst-${now}-${idCounterRef.current}`,
          x: tapX,
          y: tapY,
          vx,
          vy,
          size: 11 + Math.random() * 11,
          color:
            config.confettiColors[i % config.confettiColors.length] ??
            config.primaryColor,
          shape: shapes[i % shapes.length],
          rotation: Math.random() * 360,
          createdAt: now,
        });
      }

      setBurstParticles((prev) => [...prev.slice(-90), ...newParticles]);
    },
    [playFruitSound, triggerFruitHaptic]
  );

  /**
   * Background Tap (Spawn Mode):
   * Supports multi-touch so every finger tapping empty black space spawns
   * a sparkling neon star or mini floating fruit at exact touch coordinates.
   */
  const handleBackgroundTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      const touches = event.nativeEvent.changedTouches?.length
        ? event.nativeEvent.changedTouches
        : [event.nativeEvent];

      const now = Date.now();
      const newSpawns: FloatingSpawn[] = [];

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const x = touch.pageX;
        const y = touch.pageY;

        idCounterRef.current += 1;
        const seq = idCounterRef.current;
        const isMiniFruit = seq % 2 === 0;
        const randomFruit =
          FRUIT_CONFIGS[seq % FRUIT_CONFIGS.length].id;
        const starColor =
          NEON_STAR_COLORS[seq % NEON_STAR_COLORS.length];

        newSpawns.push({
          id: `spawn-${now}-${seq}`,
          x,
          y,
          kind: isMiniFruit ? 'miniFruit' : 'star',
          fruitType: randomFruit,
          color: starColor,
          scale: 0.85 + Math.random() * 0.3,
          driftX: (Math.random() - 0.5) * 38,
          createdAt: now,
        });
      }

      triggerBackgroundSpawnHaptic();
      playSpawnSound();
      setFloatingSpawns((prev) => [...prev.slice(-30), ...newSpawns]);
    },
    [playSpawnSound, triggerBackgroundSpawnHaptic]
  );

  // Compute responsive fruit positions for Party Mode (4, 5, or 6 simultaneous fruits)
  const partyFruitsWithCoords = useMemo(() => {
    const activeFruits = FRUIT_CONFIGS.slice(0, partyFruitCount);
    const minDim = Math.min(width, height);
    const fruitSize = Math.max(115, Math.min(158, minDim * 0.31));

    // Well-spaced responsive grid layouts for 4, 5, or 6 fruits
    const layoutCoords: Record<number, { x: number; y: number }[]> = {
      4: [
        { x: 0.27, y: 0.32 },
        { x: 0.73, y: 0.32 },
        { x: 0.27, y: 0.7 },
        { x: 0.73, y: 0.7 },
      ],
      5: [
        { x: 0.25, y: 0.26 },
        { x: 0.75, y: 0.26 },
        { x: 0.5, y: 0.51 },
        { x: 0.25, y: 0.76 },
        { x: 0.75, y: 0.76 },
      ],
      6: [
        { x: 0.26, y: 0.24 },
        { x: 0.74, y: 0.24 },
        { x: 0.24, y: 0.52 },
        { x: 0.76, y: 0.52 },
        { x: 0.28, y: 0.79 },
        { x: 0.72, y: 0.79 },
      ],
    };

    const coords = layoutCoords[partyFruitCount] || layoutCoords[6];

    return activeFruits.map((fruit, index) => {
      const pt = coords[index] ?? fruit.partyPosition;
      return {
        config: fruit,
        x: width * pt.x,
        y: height * pt.y,
        size: fruitSize,
      };
    });
  }, [height, partyFruitCount, width]);

  const activeSpotlightConfig = useMemo(() => {
    return (
      FRUIT_CONFIGS.find((f) => f.id === spotlightFruit) ?? FRUIT_CONFIGS[0]
    );
  }, [spotlightFruit]);

  const spotlightFruitSize = Math.max(
    220,
    Math.min(290, Math.min(width, height) * 0.58)
  );

  return (
    <View style={styles.screen}>
      {/* Hide system status bar for full-screen immersion */}
      <StatusBar hidden={true} style="light" />

      {/* Pure Black Interactive Background (Spawns floating neon stars / mini-fruits on tap) */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onTouchStart={handleBackgroundTouchStart}
      />

      {/* Fruit Party Mode (4–6 fruits dancing & floating simultaneously) */}
      {displayMode === 'party' ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {partyFruitsWithCoords.map(({ config, x, y, size }) => (
            <Fruit
              key={config.id}
              config={config}
              x={x}
              y={y}
              size={size}
              isSpotlight={false}
              onFruitTap={handleFruitTap}
            />
          ))}
        </View>
      ) : (
        /* Solo Spotlight Mode (1 large fruit center stage with colored spotlight aura) */
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Fruit
            key={`spotlight-${activeSpotlightConfig.id}`}
            config={activeSpotlightConfig}
            x={width * 0.5}
            y={height * 0.48}
            size={spotlightFruitSize}
            isSpotlight={true}
            onFruitTap={handleFruitTap}
          />

          {/* Subtle bottom character switcher dots in Spotlight Mode */}
          <View style={styles.spotlightDotsRow}>
            {FRUIT_CONFIGS.map((fruit) => {
              const isSelected = fruit.id === activeSpotlightConfig.id;
              return (
                <TouchableOpacity
                  key={fruit.id}
                  onPress={() => {
                    setSpotlightFruit(fruit.id);
                    triggerBackgroundSpawnHaptic();
                  }}
                  style={[
                    styles.spotlightDot,
                    {
                      backgroundColor: isSelected
                        ? fruit.glowColor
                        : 'rgba(255,255,255,0.2)',
                      transform: [{ scale: isSelected ? 1.35 : 1 }],
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* 60fps Particle System (Confetti/Juice Droplet Bursts + Floating Spawns) */}
      <ParticleSystem
        burstParticles={burstParticles}
        floatingSpawns={floatingSpawns}
      />

      {/* Toddler-Safe 2s Long-Press Mode Toggle & Easy-to-Reach Cumbia Mute Button */}
      <ModeToggleControl
        displayMode={displayMode}
        onChangeDisplayMode={setDisplayMode}
        spotlightFruit={spotlightFruit}
        onSelectSpotlightFruit={setSpotlightFruit}
        partyFruitCount={partyFruitCount}
        onChangePartyFruitCount={setPartyFruitCount}
        isMusicMuted={isMusicMuted}
        onToggleMusicMute={toggleMusicMute}
        onUnlockHaptic={triggerModeSwitchHaptic}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
    userSelect: 'none',
  },
  spotlightDotsRow: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  spotlightDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
