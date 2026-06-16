class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
  }

  register(name, path) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    this.sounds[name] = audio;
  }

  play(name) {
    if (!this.enabled) return;
    const sound = this.sounds[name];
    if (sound) {

      const playPromise = sound.cloneNode().play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio play failed:', error);
        });
      }
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    for (const name in this.sounds) {
      this.sounds[name].volume = this.volume;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

window.audioManager = new AudioManager();

