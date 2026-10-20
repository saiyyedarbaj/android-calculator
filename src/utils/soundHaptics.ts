/**
 * Web Audio API synthesizer for tactile button clicks
 * and Android haptic feedback
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeySound(type: 'number' | 'operator' | 'equals' | 'delete') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    // Different gentle frequencies for Android tactile feel
    let freq = 1200;
    let duration = 0.015; // 15ms quick tap

    if (type === 'operator') {
      freq = 1450;
      duration = 0.02;
    } else if (type === 'equals') {
      freq = 1600;
      duration = 0.025;
    } else if (type === 'delete') {
      freq = 900;
      duration = 0.018;
    }

    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);

    // Exponential decay to avoid popping clicks
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      const ms = type === 'light' ? 8 : type === 'medium' ? 15 : 25;
      navigator.vibrate(ms);
    } catch {
      // Ignore vibration error
    }
  }
}
