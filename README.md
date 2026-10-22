# Disco Fruit Party 🍍🍉🍌🍓🍒🍊🥑

An interactive mobile sensory app inspired by **Hey Bear Sensory's "Disco Fruit Party"**, built with **React Native**, **Expo**, **React Native Reanimated**, **React Native SVG**, **Expo Haptics**, and **Expo AV**.

## Features

1. **Full-Screen Pure Black Sensory Stage (`#000000`)**
   - Status bar and Android navigation bar are hidden for total visual contrast and toddler immersion.
   - **7 Kawaii Fruit Characters** rendered with custom vector art (`FruitSvgArt.tsx`), smiling cartoon faces, rosy cheeks, winking expressions, and radial outer glows:
     - **Pineapple** (spiky green crown & diamond crosshatch)
     - **Watermelon Slice** (smiling crimson slice with seeds)
     - **Orange Slice** (glowing citrus wheel)
     - **Strawberries** (dotted with golden seeds & leafy crown)
     - **Twin Cherries** (two smiling cherries joined by a curved stem)
     - **Peeled Banana** (dancing with peel arms)
     - **Avocado Half** (creamy green interior with glossy round pit)

2. **120 BPM Cumbia Ambient Dancing & Display Modes**
   - Continuous 60fps UI-thread animations (`react-native-reanimated`) bobbing up and down, swaying side-to-side, and rocking to a 120 BPM Cumbia rhythm.
   - **Fruit Party Mode:** 4–6 fruits dance and float around the screen simultaneously.
   - **Solo Spotlight Mode:** One large fruit dances center stage with a pulsing colored spotlight aura behind it.
   - **Toddler-Safe Hidden Mode Toggle:** Located in the top-right corner and requires a **2-second long press** with a live progress bar to open.

3. **Multi-Touch Interactivity & Particle System (`ParticleSystem.tsx`)**
   - Supports simultaneous multi-touch across multiple fruits and empty background space.
   - **Fruit Tap Reaction:** Instant squash-and-stretch on press/release, 360° spin or high jump, 580ms happy wink expression, and a fountain burst of colorful confetti, juice droplets, and stars.
   - **Background Tap (Spawn Mode):** Tapping empty black space spawns a sparkling neon star or mini floating fruit at the exact touch coordinates that floats upward and fades away.

4. **Distinct Haptic Signatures (`useHaptics.ts`)**
   - **Pineapple & Watermelon:** Heavy impact (`Haptics.ImpactFeedbackStyle.Heavy`)
   - **Banana, Avocado & Orange:** Medium bounce impact (`Haptics.ImpactFeedbackStyle.Medium`)
   - **Cherries & Strawberries:** Rapid light double-pulse (`Haptics.ImpactFeedbackStyle.Light` x2)
   - **Background Spawn:** Crisp selection click (`Haptics.selectionAsync()`)

5. **Self-Contained Procedural Audio & Cumbia Loop (`useSoundEffects.ts` & `wavSynthesizer.ts`)**
   - Configured with `playsInSilentModeIOS: true` so sounds play even when the iOS hardware mute switch is on.
   - Synthesizes 16-bit PCM WAV audio in memory (zero external asset files required):
     - **Maraca shakes & clave clicks** for Pineapple and Banana
     - **Cheerful high-pitched bubble pops** for Strawberries and Cherries
     - **Cartoon spring "boing" tones** for Watermelon, Orange, and Avocado
     - **120 BPM Cumbia Bass-and-Conga Backing Loop** with an easy-to-reach top-left mute/unmute toggle.

## Getting Started

```bash
cd /Users/santi/.gemini/antigravity/scratch/disco-fruit-party
npm install
npx expo start
```
