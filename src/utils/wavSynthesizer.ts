/**
 * Self-contained PCM WAV audio synthesizer.
 * Generates Base64 `data:audio/wav;base64,...` URIs in memory so `expo-av`
 * can play all sound effects and the 120 BPM Cumbia backing loop natively
 * on iOS, Android, and Web without external audio asset dependencies.
 */

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function encodeBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  let i = 0;

  while (i < len) {
    const b0 = bytes[i++] ?? 0;
    const hasB1 = i < len;
    const b1 = hasB1 ? bytes[i++] : 0;
    const hasB2 = i < len;
    const b2 = hasB2 ? bytes[i++] : 0;

    const triplet = (b0 << 16) | (b1 << 8) | b2;

    result += BASE64_CHARS[(triplet >> 18) & 0x3f];
    result += BASE64_CHARS[(triplet >> 12) & 0x3f];
    result += hasB1 ? BASE64_CHARS[(triplet >> 6) & 0x3f] : '=';
    result += hasB2 ? BASE64_CHARS[triplet & 0x3f] : '=';
  }

  return result;
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/**
 * Encodes normalized float samples (-1.0..1.0) into a 16-bit mono WAV data URI.
 */
function encodeSamplesToWavDataUri(
  samples: Float32Array,
  sampleRate: number
): string {
  const numSamples = samples.length;
  const dataByteLength = numSamples * 2;
  const totalLength = 44 + dataByteLength;
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // RIFF header
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeAscii(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // AudioFormat = 1 (PCM)
  view.setUint16(22, 1, true); // NumChannels = 1 (Mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, intSample | 0, true);
    offset += 2;
  }

  return `data:audio/wav;base64,${encodeBase64(new Uint8Array(buffer))}`;
}

/**
 * 1. Maraca Shake & Latin Percussion Click (Pineapple & Banana)
 */
export function synthesizeMaracaSound(pitchMultiplier = 1.0): string {
  const sampleRate = 22050;
  const durationSec = 0.28;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  let prevNoise = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Crisp woody clave/conga rim click at start
    const claveEnv = Math.exp(-t * 68);
    const claveFreq1 = 960 * pitchMultiplier;
    const claveFreq2 = 1520 * pitchMultiplier;
    const clave =
      (Math.sin(2 * Math.PI * claveFreq1 * t) * 0.65 +
        Math.sin(2 * Math.PI * claveFreq2 * t) * 0.35) *
      claveEnv;

    // Double maraca shake burst ("ch-cha!")
    const white = Math.random() * 2 - 1;
    const highPassedNoise = white - prevNoise * 0.86;
    prevNoise = white;

    const shake1Env =
      t < 0.11 ? Math.sin((t / 0.11) * Math.PI) * Math.exp(-t * 14) : 0;
    const shake2Env =
      t >= 0.09
        ? Math.sin(((t - 0.09) / 0.19) * Math.PI) * Math.exp(-(t - 0.09) * 12)
        : 0;

    const maraca = highPassedNoise * (shake1Env * 0.55 + shake2Env * 0.65);

    samples[i] = (clave * 0.65 + maraca * 0.55) * 0.85;
  }

  return encodeSamplesToWavDataUri(samples, sampleRate);
}

/**
 * 2. High-Pitched Cheerful Pops & Bubbles (Strawberries & Cherries)
 */
export function synthesizeCheerfulPopSound(pitchMultiplier = 1.0): string {
  const sampleRate = 22050;
  const durationSec = 0.26;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  let phase1 = 0;
  let phase2 = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let out = 0;

    // Bubble 1: 0.00s - 0.11s upward pitch sweep
    if (t < 0.11) {
      const progress = t / 0.11;
      const freq = (420 + 620 * Math.pow(progress, 1.5)) * pitchMultiplier;
      phase1 += (2 * Math.PI * freq) / sampleRate;
      const env = Math.sin(progress * Math.PI) * Math.exp(-t * 12);
      out += (Math.sin(phase1) + 0.25 * Math.sin(phase1 * 2)) * env * 0.7;
    }

    // Bubble 2: 0.075s - 0.24s higher cheerful pop
    if (t >= 0.075 && t < 0.25) {
      const localT = t - 0.075;
      const progress = localT / 0.175;
      const freq = (590 + 780 * Math.pow(progress, 1.35)) * pitchMultiplier;
      phase2 += (2 * Math.PI * freq) / sampleRate;
      const env = Math.sin(progress * Math.PI) * Math.exp(-localT * 10);
      out += (Math.sin(phase2) + 0.3 * Math.sin(phase2 * 2)) * env * 0.75;
    }

    samples[i] = out * 0.85;
  }

  return encodeSamplesToWavDataUri(samples, sampleRate);
}

/**
 * 3. Cartoon "Boing" / Spring Sound (Watermelon, Orange, Avocado)
 */
export function synthesizeCartoonBoingSound(pitchMultiplier = 1.0): string {
  const sampleRate = 22050;
  const durationSec = 0.42;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / durationSec;

    // Elastic upward spring bend + bouncy pitch wobble
    const baseSlide = 210 + 360 * (1 - Math.exp(-t * 11));
    const wobble = Math.sin(2 * Math.PI * 15 * t) * 85 * Math.exp(-t * 4.5);
    const freq = (baseSlide + wobble) * pitchMultiplier;

    phase += (2 * Math.PI * freq) / sampleRate;
    const env = Math.pow(1 - progress, 1.45) * Math.min(1, t * 90);

    // Rich cartoon spring tone (fundamental + 2nd & 3rd harmonics)
    const wave =
      Math.sin(phase) * 0.65 +
      Math.sin(phase * 2) * 0.25 +
      Math.sin(phase * 3) * 0.1;

    samples[i] = wave * env * 0.85;
  }

  return encodeSamplesToWavDataUri(samples, sampleRate);
}

/**
 * 4. Sparkling Neon Star / Mini-Fruit Spawn Chime
 */
export function synthesizeSparkleSound(): string {
  const sampleRate = 22050;
  const durationSec = 0.32;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  // Pentatonic sparkle notes (C6, E6, G6, C7)
  const notes = [1046.5, 1318.5, 1568.0, 2093.0];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sum = 0;

    for (let n = 0; n < notes.length; n++) {
      const start = n * 0.045;
      if (t >= start) {
        const localT = t - start;
        const env = Math.exp(-localT * 18) * Math.min(1, localT * 140);
        const freq = notes[n];
        sum +=
          (Math.sin(2 * Math.PI * freq * localT) +
            0.3 * Math.sin(2 * Math.PI * freq * 2 * localT)) *
          env;
      }
    }

    samples[i] = (sum / 2.2) * 0.75;
  }

  return encodeSamplesToWavDataUri(samples, sampleRate);
}

/**
 * 5. Looping 120 BPM Cumbia Bass-and-Conga Backing Track (4.0s / 8-beat loop)
 */
export function synthesizeCumbiaBackingLoop(): string {
  const sampleRate = 22050;
  const durationSec = 4.0; // 8 beats at 120 BPM (0.5s per beat)
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  // Classic Cumbia Tumbao Bass Pattern over 2 bars (8 beats):
  // Bar 1 (C Major): C2 (beat 1), E2 (beat 2.5), G2 (beat 3), E2 (beat 4.5)
  // Bar 2 (G7):      G2 (beat 5), B2 (beat 6.5), D3 (beat 7), B2 (beat 8.5)
  const bassEvents = [
    { startBeat: 0.0, durationBeats: 0.9, freq: 130.81 }, // C3
    { startBeat: 1.5, durationBeats: 0.45, freq: 164.81 }, // E3
    { startBeat: 2.0, durationBeats: 0.9, freq: 196.0 }, // G3
    { startBeat: 3.5, durationBeats: 0.45, freq: 164.81 }, // E3
    { startBeat: 4.0, durationBeats: 0.9, freq: 146.83 }, // D3
    { startBeat: 5.5, durationBeats: 0.45, freq: 196.0 }, // G3
    { startBeat: 6.0, durationBeats: 0.9, freq: 246.94 }, // B3
    { startBeat: 7.5, durationBeats: 0.45, freq: 196.0 }, // G3
  ];

  // Cheerful tropical marimba chord plucks on off-beats
  const marimbaChords = [
    { beat: 0.5, freqs: [523.25, 659.25, 783.99] }, // C5-E5-G5
    { beat: 1.5, freqs: [523.25, 659.25, 783.99] },
    { beat: 2.5, freqs: [523.25, 659.25, 783.99] },
    { beat: 3.5, freqs: [523.25, 659.25, 783.99] },
    { beat: 4.5, freqs: [493.88, 587.33, 783.99] }, // B4-D5-G5
    { beat: 5.5, freqs: [493.88, 587.33, 783.99] },
    { beat: 6.5, freqs: [493.88, 587.33, 783.99] },
    { beat: 7.5, freqs: [493.88, 587.33, 783.99] },
  ];

  let prevNoise = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beat = t / 0.5; // 120 BPM => 1 beat = 0.5s
    const beatFrac = beat % 1.0;

    let sample = 0;

    // 1. Warm Cumbia Sub/Pluck Bass
    for (let b = 0; b < bassEvents.length; b++) {
      const ev = bassEvents[b];
      if (beat >= ev.startBeat && beat < ev.startBeat + ev.durationBeats) {
        const localSec = (beat - ev.startBeat) * 0.5;
        const env = Math.exp(-localSec * 6.5) * Math.min(1, localSec * 80);
        const bassWave =
          Math.sin(2 * Math.PI * ev.freq * localSec) * 0.7 +
          Math.sin(2 * Math.PI * (ev.freq * 0.5) * localSec) * 0.35 +
          Math.sin(2 * Math.PI * (ev.freq * 2) * localSec) * 0.15;
        sample += bassWave * env * 0.36;
      }
    }

    // 2. Conga & Tumba Percussion on every beat
    // Downbeat soft heel + Beat 2 & 4 open conga slap
    const isSlapBeat = Math.floor(beat) % 2 === 1;
    const congaLocalSec = beatFrac * 0.5;
    if (congaLocalSec < 0.18) {
      const congaFreq = isSlapBeat
        ? 230 - congaLocalSec * 320
        : 135 - congaLocalSec * 180;
      const congaEnv = Math.exp(-congaLocalSec * (isSlapBeat ? 22 : 28));
      sample +=
        Math.sin(2 * Math.PI * congaFreq * congaLocalSec) *
        congaEnv *
        (isSlapBeat ? 0.32 : 0.24);
    }

    // 3. Cumbia Güiro / Maraca "chucu-chucu" on the "&" of every beat (beatFrac 0.48..0.88)
    const white = Math.random() * 2 - 1;
    const hiNoise = white - prevNoise * 0.85;
    prevNoise = white;

    if (beatFrac >= 0.48 && beatFrac < 0.86) {
      const guiroProgress = (beatFrac - 0.48) / 0.38;
      const guiroEnv = Math.sin(guiroProgress * Math.PI) * 0.16;
      sample += hiNoise * guiroEnv;
    } else if (beatFrac < 0.12) {
      // Soft chick on the downbeat
      const chickEnv = (1 - beatFrac / 0.12) * 0.08;
      sample += hiNoise * chickEnv;
    }

    // 4. Subtle Wooden Marimba Chord Plucks on off-beats
    for (let m = 0; m < marimbaChords.length; m++) {
      const chord = marimbaChords[m];
      if (beat >= chord.beat && beat < chord.beat + 0.42) {
        const localSec = (beat - chord.beat) * 0.5;
        const env = Math.exp(-localSec * 16) * Math.min(1, localSec * 120);
        let chordSum = 0;
        for (let f = 0; f < chord.freqs.length; f++) {
          chordSum += Math.sin(2 * Math.PI * chord.freqs[f] * localSec);
        }
        sample += (chordSum / 3) * env * 0.14;
      }
    }

    samples[i] = Math.max(-0.95, Math.min(0.95, sample));
  }

  return encodeSamplesToWavDataUri(samples, sampleRate);
}
