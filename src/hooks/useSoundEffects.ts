import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { FruitType } from '../types/sensory';
import {
  synthesizeCartoonBoingSound,
  synthesizeCheerfulPopSound,
  synthesizeCumbiaBackingLoop,
  synthesizeMaracaSound,
  synthesizeSparkleSound,
} from '../utils/wavSynthesizer';

type SoundPoolKey = FruitType | 'sparkle';

const POOL_SIZE_PER_KEY = 3; // Allows rapid multi-touch simultaneous playback

export function useSoundEffects() {
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);

  const soundPoolsRef = useRef<Record<SoundPoolKey, Audio.Sound[]>>({
    pineapple: [],
    banana: [],
    strawberry: [],
    cherries: [],
    watermelon: [],
    orange: [],
    avocado: [],
    sparkle: [],
  });

  const poolCursorRef = useRef<Record<SoundPoolKey, number>>({
    pineapple: 0,
    banana: 0,
    strawberry: 0,
    cherries: 0,
    watermelon: 0,
    orange: 0,
    avocado: 0,
    sparkle: 0,
  });

  const backingTrackRef = useRef<Audio.Sound | null>(null);
  const isMusicMutedRef = useRef<boolean>(false);
  const hasUnlockedLoopOnInteractionRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function setupAudio() {
      try {
        // Ensure audio plays reliably even if the iOS hardware mute switch is on
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Generate self-contained WAV data URIs per fruit
        const uriMap: Record<SoundPoolKey, string> = {
          // Maraca shakes & Latin percussion clicks for Pineapple and Banana
          pineapple: synthesizeMaracaSound(1.0),
          banana: synthesizeMaracaSound(1.18),
          // High-pitched cheerful pops & bubbles for Strawberries and Cherries
          strawberry: synthesizeCheerfulPopSound(1.0),
          cherries: synthesizeCheerfulPopSound(1.16),
          // Cartoon "boing" / spring sounds for Watermelon, Orange, and Avocado
          watermelon: synthesizeCartoonBoingSound(0.95),
          orange: synthesizeCartoonBoingSound(1.12),
          avocado: synthesizeCartoonBoingSound(1.04),
          // Sparkling neon star / mini-fruit spawn chime
          sparkle: synthesizeSparkleSound(),
        };

        const keys = Object.keys(uriMap) as SoundPoolKey[];

        // Pre-instantiate sound pools for zero-latency multi-touch playback
        for (const key of keys) {
          const pool: Audio.Sound[] = [];
          for (let i = 0; i < POOL_SIZE_PER_KEY; i++) {
            const { sound } = await Audio.Sound.createAsync(
              { uri: uriMap[key] },
              { volume: 0.9, shouldPlay: false }
            );
            pool.push(sound);
          }
          if (isMounted) {
            soundPoolsRef.current[key] = pool;
          } else {
            for (const s of pool) {
              await s.unloadAsync();
            }
          }
        }

        // Create and start the 120 BPM Cumbia bass-and-conga backing loop
        const cumbiaLoopUri = synthesizeCumbiaBackingLoop();
        const { sound: loopSound } = await Audio.Sound.createAsync(
          { uri: cumbiaLoopUri },
          {
            isLooping: true,
            volume: 0.38,
            shouldPlay: !isMusicMutedRef.current,
          }
        );

        if (isMounted) {
          backingTrackRef.current = loopSound;
          setIsAudioReady(true);
        } else {
          await loopSound.unloadAsync();
        }
      } catch (err) {
        console.warn('Audio initialization warning:', err);
      }
    }

    setupAudio();

    return () => {
      isMounted = false;
      const pools = soundPoolsRef.current;
      (Object.keys(pools) as SoundPoolKey[]).forEach((key) => {
        pools[key].forEach((s) => {
          s.unloadAsync().catch(() => {});
        });
      });
      if (backingTrackRef.current) {
        backingTrackRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  /**
   * Ensures mobile web browsers (iOS Safari / Chrome on Vercel) start the
   * Cumbia backing track on the very first touch if browser autoplay was blocked.
   */
  const ensureLoopPlayingOnFirstTouch = useCallback(async () => {
    if (hasUnlockedLoopOnInteractionRef.current || isMusicMutedRef.current) {
      return;
    }
    const loopSound = backingTrackRef.current;
    if (!loopSound) return;

    try {
      const status = await loopSound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying && !isMusicMutedRef.current) {
        await loopSound.playAsync();
      }
      hasUnlockedLoopOnInteractionRef.current = true;
    } catch {
      // Ignore transient browser autoplay errors
    }
  }, []);

  const playSoundKey = useCallback(
    async (key: SoundPoolKey) => {
      ensureLoopPlayingOnFirstTouch();

      const pool = soundPoolsRef.current[key];
      if (!pool || pool.length === 0) return;

      const index = poolCursorRef.current[key] % pool.length;
      poolCursorRef.current[key] = (index + 1) % pool.length;

      const sound = pool[index];
      try {
        await sound.replayAsync();
      } catch {
        // Ignore transient playback race errors on rapid multi-touch
      }
    },
    [ensureLoopPlayingOnFirstTouch]
  );

  const playFruitSound = useCallback(
    (fruit: FruitType) => {
      playSoundKey(fruit);
    },
    [playSoundKey]
  );

  const playSpawnSound = useCallback(() => {
    playSoundKey('sparkle');
  }, [playSoundKey]);

  const toggleMusicMute = useCallback(async () => {
    const nextMuted = !isMusicMutedRef.current;
    isMusicMutedRef.current = nextMuted;
    setIsMusicMuted(nextMuted);

    const loopSound = backingTrackRef.current;
    if (!loopSound) return;

    try {
      if (nextMuted) {
        await loopSound.setIsMutedAsync(true);
        await loopSound.pauseAsync();
      } else {
        hasUnlockedLoopOnInteractionRef.current = true;
        await loopSound.setIsMutedAsync(false);
        await loopSound.playAsync();
      }
    } catch {
      // Ignore audio state transition errors
    }
  }, []);

  return {
    playFruitSound,
    playSpawnSound,
    isMusicMuted,
    toggleMusicMute,
    isAudioReady,
  };
}
