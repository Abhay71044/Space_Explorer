// Web Audio API Synthesizer for Space Atmosphere and UI Feedback
let audioCtx = null;
let spaceDrone = null;
let isMuted = true;

export function getAudioContext() {
  if (!audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported:", e);
    }
  }
  return audioCtx;
}

export function setMuteState(muted) {
  isMuted = muted;
  if (isMuted) {
    stopSpaceDrone();
  } else {
    playSpaceDrone();
  }
}

export function getMuteState() {
  return isMuted;
}

export function playBeep(freq = 600, duration = 0.08, type = 'sine') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio playback error:", e);
  }
}

export function playSpaceDrone() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    if (spaceDrone) stopSpaceDrone();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // Low A1 Drone

    osc2.type = 'sine';
    osc2.frequency.value = 55.5; // Chorus detuning

    filter.type = 'lowpass';
    filter.frequency.value = 180;
    filter.Q.value = 5;

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();

    spaceDrone = { osc1, osc2, gainNode };
  } catch (e) {
    console.warn("Space drone error:", e);
  }
}

export function stopSpaceDrone() {
  if (spaceDrone) {
    try {
      spaceDrone.osc1.stop();
      spaceDrone.osc2.stop();
      spaceDrone.osc1.disconnect();
      spaceDrone.osc2.disconnect();
      spaceDrone.gainNode.disconnect();
    } catch (e) {}
    spaceDrone = null;
  }
}

export function playRocketLaunchRumble() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const noiseFilter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 3);

    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 120;

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

    osc.connect(noiseFilter);
    noiseFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 3.5);
  } catch (e) {}
}
