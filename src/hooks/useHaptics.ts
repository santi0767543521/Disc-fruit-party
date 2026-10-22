import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FruitType } from '../types/sensory';

let iosHapticLabel: HTMLLabelElement | null = null;
let webAudioCtx: AudioContext | null = null;
let domListenersAttached = false;
let pendingHapticStyle: 'heavy' | 'medium' | 'doubleLight' | 'selection' | null =
  null;

function ensureWebHapticSetup(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  if (!iosHapticLabel) {
    const existingLabel = document.getElementById(
      'agy-ios-haptic-label'
    ) as HTMLLabelElement | null;

    if (existingLabel) {
      iosHapticLabel = existingLabel;
    } else {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('aria-hidden', 'true');
      wrapper.style.position = 'fixed';
      wrapper.style.bottom = '0px';
      wrapper.style.left = '0px';
      wrapper.style.width = '1px';
      wrapper.style.height = '1px';
      wrapper.style.opacity = '0.01';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.overflow = 'hidden';
      wrapper.style.zIndex = '-1';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'agy-ios-haptic-switch';
      input.setAttribute('switch', '');

      const label = document.createElement('label');
      label.htmlFor = 'agy-ios-haptic-switch';
      label.id = 'agy-ios-haptic-label';
      label.textContent = 'haptic';

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      document.body.appendChild(wrapper);

      iosHapticLabel = label;
    }
  }

  if (!domListenersAttached && typeof window !== 'undefined') {
    domListenersAttached = true;

    const handleTrustedGestureEnd = () => {
      try {
        iosHapticLabel?.click();
      } catch {
        // Ignore if unsupported
      }
      if (pendingHapticStyle) {
        const style = pendingHapticStyle;
        pendingHapticStyle = null;
        fireWebTactileSubBass(style);
      }
    };

    window.addEventListener('touchend', handleTrustedGestureEnd, {
      capture: true,
      passive: true,
    });
    window.addEventListener('click', handleTrustedGestureEnd, {
      capture: true,
      passive: true,
    });
  }
}

function fireIosWebSwitchHaptic(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  try {
    ensureWebHapticSetup();
    iosHapticLabel?.click();
  } catch {
    // Ignore if unsupported
  }
}

function fireWebTactileSubBass(
  style: 'heavy' | 'medium' | 'doubleLight' | 'selection'
): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    if (!webAudioCtx) {
      webAudioCtx = new AudioContextClass();
    }
    if (webAudioCtx.state === 'suspended') {
      webAudioCtx.resume().catch(() => {});
    }

    const now = webAudioCtx.currentTime;

    const triggerPulse = (
      startOffset: number,
      startFreq: number,
      endFreq: number,
      duration: number,
      gainPeak: number
    ) => {
      if (!webAudioCtx) return;
      const osc = webAudioCtx.createOscillator();
      const gain = webAudioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now + startOffset);
      osc.frequency.exponentialRampToValueAtTime(
        endFreq,
        now + startOffset + duration
      );

      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.linearRampToValueAtTime(
        gainPeak,
        now + startOffset + 0.006
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + startOffset + duration
      );

      osc.connect(gain);
      gain.connect(webAudioCtx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.01);
    };

    if (style === 'heavy') {
      triggerPulse(0, 80, 38, 0.09, 1.0);
    } else if (style === 'medium') {
      triggerPulse(0, 100, 50, 0.065, 0.8);
    } else if (style === 'doubleLight') {
      triggerPulse(0, 125, 65, 0.042, 0.7);
      triggerPulse(0.068, 140, 72, 0.042, 0.75);
    } else {
      triggerPulse(0, 145, 82, 0.03, 0.55);
    }
  } catch {
    // Ignore Web Audio errors
  }
}

export function useHaptics() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      ensureWebHapticSetup();
    }
  }, []);

  const triggerFruitHaptic = useCallback((fruit: FruitType) => {
    if (Platform.OS === 'web') {
      ensureWebHapticSetup();
      fireIosWebSwitchHaptic();

      if (fruit === 'pineapple' || fruit === 'watermelon') {
        pendingHapticStyle = 'heavy';
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(60);
        }
        fireWebTactileSubBass('heavy');
      } else if (fruit === 'cherries' || fruit === 'strawberry') {
        pendingHapticStyle = 'doubleLight';
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([25, 45, 25]);
        }
        fireWebTactileSubBass('doubleLight');
      } else {
        pendingHapticStyle = 'medium';
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(38);
        }
        fireWebTactileSubBass('medium');
      }
      return;
    }

    try {
      switch (fruit) {
        case 'pineapple':
        case 'watermelon':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          break;
        case 'banana':
        case 'avocado':
        case 'orange':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          break;
        case 'cherries':
        case 'strawberry':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );
          }, 75);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          break;
      }
    } catch {
      // Ignore haptic errors on unsupported devices/simulators
    }
  }, []);

  const triggerBackgroundSpawnHaptic = useCallback(() => {
    if (Platform.OS === 'web') {
      ensureWebHapticSetup();
      pendingHapticStyle = 'selection';
      fireIosWebSwitchHaptic();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(18);
      }
      fireWebTactileSubBass('selection');
      return;
    }

    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {
      // Ignore on unsupported devices
    }
  }, []);

  const triggerModeSwitchHaptic = useCallback(() => {
    if (Platform.OS === 'web') {
      ensureWebHapticSetup();
      pendingHapticStyle = 'heavy';
      fireIosWebSwitchHaptic();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([35, 50, 45]);
      }
      fireWebTactileSubBass('heavy');
      return;
    }
    try {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});
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
