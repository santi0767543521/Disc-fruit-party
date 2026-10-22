import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FruitType } from '../types/sensory';

/**
 * Custom hook providing distinct tactile vibration signatures per fruit
 * and background spawn interaction using `expo-haptics`.
 */
export function useHaptics() {
  const triggerFruitHaptic = useCallback(async (fruit: FruitType) => {
    if (Platform.OS === 'web') {
      // Optional web navigator.vibrate fallback if supported by mobile browsers
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (fruit === 'pineapple' || fruit === 'watermelon') {
          navigator.vibrate(45);
        } else if (fruit === 'cherries' || fruit === 'strawberry') {
          navigator.vibrate([18, 45, 18]);
        } else {
          navigator.vibrate(28);
        }
      }
      return;
    }

    try {
      switch (fruit) {
        case 'pineapple':
        case 'watermelon':
          // Heavy impact signature
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case 'banana':
        case 'avocado':
        case 'orange':
          // Medium bounce impact signature
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'cherries':
        case 'strawberry':
          // Rapid light double-pulse signature
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }, 75);
          break;

        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
      }
    } catch {
      // Ignore haptic errors on unsupported devices/simulators
    }
  }, []);

  const triggerBackgroundSpawnHaptic = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore on unsupported devices
    }
  }, []);

  const triggerModeSwitchHaptic = useCallback(async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore on unsupported devices
    }
  }, []);

  return {
    triggerFruitHaptic,
    triggerBackgroundSpawnHaptic,
    triggerModeSwitchHaptic,
  };
}
