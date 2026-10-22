export type FruitType =
  | 'pineapple'
  | 'watermelon'
  | 'orange'
  | 'strawberry'
  | 'cherries'
  | 'banana'
  | 'avocado';

export type DisplayMode = 'party' | 'spotlight';

export type SoundEffectCategory = 'maraca' | 'pop' | 'boing' | 'sparkle';

export type HapticCategory = 'heavy' | 'medium' | 'doubleLight' | 'selection';

export interface FruitConfig {
  id: FruitType;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  spotlightColor: string;
  confettiColors: string[];
  soundCategory: SoundEffectCategory;
  hapticCategory: HapticCategory;
  reactionStyle: 'spin360' | 'highJump';
  /** Relative home coordinates (0..1) in Party Mode */
  partyPosition: {
    xRatio: number;
    yRatio: number;
  };
  /** Phase offset in radians so fruits groove dynamically in a wave */
  phaseOffset: number;
}

export interface BurstParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'droplet' | 'confetti' | 'star' | 'ring';
  rotation: number;
  createdAt: number;
}

export interface FloatingSpawn {
  id: string;
  x: number;
  y: number;
  kind: 'star' | 'miniFruit';
  fruitType: FruitType;
  color: string;
  scale: number;
  driftX: number;
  createdAt: number;
}

/** 120 BPM Cumbia Rhythm Constants */
export const CUMBIA_BPM = 120;
export const BEAT_DURATION_MS = (60 / CUMBIA_BPM) * 1000; // 500ms per quarter-note beat
export const BAR_DURATION_MS = BEAT_DURATION_MS * 4; // 2000ms per 4/4 bar

export const FRUIT_CONFIGS: FruitConfig[] = [
  {
    id: 'pineapple',
    name: 'Piña Pineapple',
    primaryColor: '#FFD60A',
    secondaryColor: '#34C759',
    glowColor: '#FFE600',
    spotlightColor: 'rgba(255, 225, 0, 0.25)',
    confettiColors: ['#FFE600', '#38E54D', '#FFF56D', '#FF9F1C'],
    soundCategory: 'maraca',
    hapticCategory: 'heavy',
    reactionStyle: 'spin360',
    partyPosition: { xRatio: 0.22, yRatio: 0.25 },
    phaseOffset: 0,
  },
  {
    id: 'watermelon',
    name: 'Sandía Watermelon',
    primaryColor: '#FF2A55',
    secondaryColor: '#2EC4B6',
    glowColor: '#FF3366',
    spotlightColor: 'rgba(255, 42, 85, 0.26)',
    confettiColors: ['#FF2A55', '#38E54D', '#FF85A1', '#FFFFFF'],
    soundCategory: 'boing',
    hapticCategory: 'heavy',
    reactionStyle: 'highJump',
    partyPosition: { xRatio: 0.78, yRatio: 0.25 },
    phaseOffset: 0.85,
  },
  {
    id: 'banana',
    name: 'Baila Banana',
    primaryColor: '#FFEA00',
    secondaryColor: '#FFF3B0',
    glowColor: '#FFF033',
    spotlightColor: 'rgba(255, 234, 0, 0.24)',
    confettiColors: ['#FFEA00', '#FFF9A6', '#FF9F1C', '#FFBF69'],
    soundCategory: 'maraca',
    hapticCategory: 'medium',
    reactionStyle: 'spin360',
    partyPosition: { xRatio: 0.5, yRatio: 0.48 },
    phaseOffset: 1.7,
  },
  {
    id: 'strawberry',
    name: 'Fresita Strawberry',
    primaryColor: '#FF1E56',
    secondaryColor: '#FFD166',
    glowColor: '#FF2E63',
    spotlightColor: 'rgba(255, 30, 86, 0.26)',
    confettiColors: ['#FF1E56', '#FFD166', '#FF758F', '#52B788'],
    soundCategory: 'pop',
    hapticCategory: 'doubleLight',
    reactionStyle: 'highJump',
    partyPosition: { xRatio: 0.2, yRatio: 0.54 },
    phaseOffset: 2.5,
  },
  {
    id: 'cherries',
    name: 'Twin Cherries',
    primaryColor: '#FF0A54',
    secondaryColor: '#52B788',
    glowColor: '#FF165D',
    spotlightColor: 'rgba(255, 10, 84, 0.26)',
    confettiColors: ['#FF0A54', '#FF7096', '#74C69D', '#FFF0F3'],
    soundCategory: 'pop',
    hapticCategory: 'doubleLight',
    reactionStyle: 'spin360',
    partyPosition: { xRatio: 0.8, yRatio: 0.54 },
    phaseOffset: 3.3,
  },
  {
    id: 'orange',
    name: 'Naranja Orange',
    primaryColor: '#FF7B00',
    secondaryColor: '#FFD000',
    glowColor: '#FF8800',
    spotlightColor: 'rgba(255, 136, 0, 0.25)',
    confettiColors: ['#FF7B00', '#FFD000', '#FFAA00', '#FFF3B0'],
    soundCategory: 'boing',
    hapticCategory: 'medium',
    reactionStyle: 'spin360',
    partyPosition: { xRatio: 0.3, yRatio: 0.8 },
    phaseOffset: 4.1,
  },
  {
    id: 'avocado',
    name: 'Amigo Avocado',
    primaryColor: '#7AE582',
    secondaryColor: '#9C6644',
    glowColor: '#57CC99',
    spotlightColor: 'rgba(122, 229, 130, 0.25)',
    confettiColors: ['#7AE582', '#C7F9CC', '#9C6644', '#FFE66D'],
    soundCategory: 'boing',
    hapticCategory: 'medium',
    reactionStyle: 'highJump',
    partyPosition: { xRatio: 0.72, yRatio: 0.8 },
    phaseOffset: 5.0,
  },
];
