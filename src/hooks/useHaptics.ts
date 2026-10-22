import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { FruitType } from '../types/sensory';

/**
 * High-Output Haptic Engine (Native + Mobile Web):
 *
 * 1. Native (Expo Go / iOS & Android):
 *    Uses multi-stage compound CoreHaptics impacts (`Heavy` + follow-up pulse)
 *    for maximum mechanical Taptic Engine force.
 * 2. iOS Safari Web:
 *    Triggers a bank of `<input type="checkbox" switch>` elements across
 *    `pointerdown`, `touchend`, and `click` gestures.
 * 3. Overdriven Chassis-Resonant Tactile Sub-Bass (Web Audio API):
 *    Drives a saturated 68Hz–110Hz resonant bass thump with a WaveShaper +
 *    resonant low-pass filter that physically vibrates the phone's enclosure.
 * 4. Android Web:
 *    High-intensity multi-pulse `navigator.vibrate()` patterns.
 */
const SwitchLabels: HTMLLabelElement[] = [];
let webAudioCtx: AudioContext | null = null;
let saturationCurve: Float32Array | null = null;
let domListenersAttached = false;
let pendingHapticStyle: 'heavy' | 'medium' | 'doubleLight' | 'selection' | null =
  null;

function getSaturationCurve(): Float32Array {
  if (saturationCurve) return saturationCurve;
  const samples = 1024;
  const curve = new Float32Array(samples);
  const k = 28;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  saturationCurve = curve;
  return curve;
}

function ensureWebHapticSetup(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  if (SwitchLabels.length === 0) {
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

    for (let i = 0; i < 3; i++) {
      const id = `agy-ios-haptic-switch-${i}`;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.setAttribute('switch', '');

      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = `h${i}`;

      wrapper.appendChild(input);
      wrapper.appendChild(label);
      SwitchLabels.push(label);
    }

    document.body.appendChild(wrapper);
  }

  if (!domListenersAttached && typeof window !== 'undefined') {
    domListenersAttached = true;

    const fireSwitchBank = () => {
      try {
        for (let i = 0; i < SwitchLabels.length; i++) {
          SwitchLabels[i]?.click();
        }
      } catch {
        // Ignore if unsupported
      }
    };

    const handlePointerDown = () => {
      fireSwitchBank();
    };

    const handleGestureEnd = () => {
      fireSwitchBank();
      if (pendingHapticStyle) {
        const style = pendingHapticStyle;
        pendingHapticStyle = null;
        fireOverdrivenTactileBass(style);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, {
      capture: true,
      passive: true,
    });
    window.addEventListener('touchend', handleGestureEnd, {
      capture: true,
      passive: true,
    });
    window.addEventListener('click', handleGestureEnd, {
      capture: true,
      passive: true,
    });
  }
}

function fireIosWebSwitchHaptic(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  try {
    ensureWebHapticSetup();
    for (let i = 0; i < SwitchLabels.length; i++) {
      SwitchLabels[i]?.click();
    }
  } catch {
    // Ignore if unsupported
  }
}

function fireOverdrivenTactileBass(
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

    const ctx = webAudioCtx;
    const now = ctx.currentTime;

    const triggerResonantKick = (
      startOffset: number,
      startFreq: number,
      endFreq: number,
      duration: number,
      driveGain: number
    ) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const preGain = ctx.createGain();
      const shaper = ctx.createWaveShaper();
      const filter = ctx.createBiquadFilter();
      const outGain = ctx.createGain();

      // Dual oscillators locked to smartphone chassis resonance (65Hz - 125Hz)
      osc1.type = 'sine';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(startFreq, now + startOffset);
      osc1.frequency.exponentialRampToValueAtTime(
        endFreq,
        now + startOffset + duration
      );

      osc2.frequency.setValueAtTime(startFreq * 1.5, now + startOffset);
      osc2.frequency.exponentialRampToValueAtTime(
        endFreq * 1.25,
        now + startOffset + duration
      );

      preGain.gain.setValueAtTime(driveGain, now + startOffset);

      shaper.curve = getSaturationCurve();
      shaper.oversample = '2x';

      // Resonant low-pass boost at 82Hz to maximize physical speaker excursion
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(145, now + startOffset);
      filter.Q.setValueAtTime(4.5, now + startOffset);

      outGain.gain.setValueAtTime(0.001, now + startOffset);
      outGain.gain.linearRampToValueAtTime(1.0, now + startOffset + 0.005);
      outGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + startOffset + duration
      );

      osc1.connect(preGain);
      osc2.connect(preGain);
      preGain.connect(shaper);
      shaper.connect(filter);
      filter.connect(outGain);
      outGain.connect(ctx.destination);

      osc1.start(now + startOffset);
      osc2.start(now + startOffset);
      osc1.stop(now + startOffset + duration + 0.015);
      osc2.stop(now + startOffset + duration + 0.015);
    };

    if (style === 'heavy') {
      // Heavy double-slap sub-bass punch for Pineapple & Watermelon
      triggerResonantKick(0, 125, 58, 0.14, 3.2);
      triggerResonantKick(0.055, 105, 52, 0.15, 3.5);
    } else if (style === 'medium') {
      // Strong bouncy thump for Banana, Avocado & Orange
      triggerResonantKick(0, 130, 64, 0.12, 2.6);
    } else if (style === 'doubleLight') {
      // Crisp double-knock for Cherries & Strawberries
      triggerResonantKick(0, 145, 72, 0.075, 2.2);
      triggerResonantKick(0.08, 160, 78, 0.08, 2.4);
    } else {
      // Snappy pop for background star/mini-fruit spawn
      triggerResonantKick(0, 150, 75, 0.065, 1.9);
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
          navigator.vibrate([100, 30, 120]);
        }
        fireOverdrivenTactileBass('heavy');
      } else if (fruit === 'cherries' || fruit === 'strawberry') {
        pendingHapticStyle = 'doubleLight';
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 40, 65]);
        }
        fireOverdrivenTactileBass('doubleLight');
      } else {
        pendingHapticStyle = 'medium';
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([75, 25, 75]);
        }
        fireOverdrivenTactileBass('medium');
      }
      return;
    }

    // Native iOS / Android (Expo Go): Boosted compound CoreHaptics patterns
    try {
      switch (fruit) {
        case 'pineapple':
        case 'watermelon':
          // Maximum-strength compound Heavy + Heavy + Notification impact
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
              () => {}
            );
          }, 50);
          break;

        case 'banana':
        case 'avocado':
        case 'orange':
          // Boosted Medium bounce (Heavy initial thump + Medium rebound)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => {}
            );
          }, 45);
          break;

        case 'cherries':
        case 'strawberry':
          // Rapid double-pulse upgraded from Light to Medium+Heavy so it feels crisp and strong
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
            () => {}
          );
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
              () => {}
            );
          }, 70);
          break;

        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
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
        navigator.vibrate(45);
      }
      fireOverdrivenTactileBass('selection');
      return;
    }

    try {
      // Upgraded from selectionAsync() to Medium impact for stronger feel
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
        navigator.vibrate([80, 40, 120]);
      }
      fireOverdrivenTactileBass('heavy');
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
