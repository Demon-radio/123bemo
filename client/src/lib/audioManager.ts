export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private backgroundMusic: HTMLAudioElement | null = null;
  private masterVolume: number = 0.5;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;
  private muted: boolean = false;

  private constructor() {
    // Initialize audio context on user interaction
    this.initAudioContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Generate simple sound effects using Web Audio API
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) return this.createSilentBuffer();

    const sampleRate = this.audioContext.sampleRate;
    const frames = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'triangle':
          sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
      }
      
      // Apply fade in/out to prevent clicks
      const fadeTime = 0.01;
      const fadeFrames = fadeTime * sampleRate;
      if (i < fadeFrames) {
        sample *= i / fadeFrames;
      } else if (i > frames - fadeFrames) {
        sample *= (frames - i) / fadeFrames;
      }
      
      data[i] = sample * 0.3; // Reduce volume
    }

    return buffer;
  }

  private createSilentBuffer(): AudioBuffer {
    if (!this.audioContext) {
      // Create a dummy context to generate a silent buffer
      const dummyContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = dummyContext.createBuffer(1, 1, 22050);
      dummyContext.close();
      return buffer;
    }
    return this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
  }

  private generateComplexSound(config: {
    frequencies: number[];
    duration: number;
    type?: OscillatorType;
    envelope?: { attack: number; decay: number; sustain: number; release: number };
  }): AudioBuffer {
    if (!this.audioContext) return this.createSilentBuffer();

    const { frequencies, duration, type = 'sine', envelope } = config;
    const sampleRate = this.audioContext.sampleRate;
    const frames = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frames, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Mix multiple frequencies
      frequencies.forEach(frequency => {
        switch (type) {
          case 'sine':
            sample += Math.sin(2 * Math.PI * frequency * t);
            break;
          case 'square':
            sample += Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
            break;
          case 'triangle':
            sample += (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
            break;
          case 'sawtooth':
            sample += 2 * (t * frequency - Math.floor(t * frequency + 0.5));
            break;
        }
      });
      
      sample /= frequencies.length; // Normalize
      
      // Apply ADSR envelope if provided
      if (envelope) {
        const { attack, decay, sustain, release } = envelope;
        const attackTime = attack * duration;
        const decayTime = decay * duration;
        const releaseTime = release * duration;
        const sustainTime = duration - attackTime - decayTime - releaseTime;
        
        if (t < attackTime) {
          sample *= t / attackTime;
        } else if (t < attackTime + decayTime) {
          const decayProgress = (t - attackTime) / decayTime;
          sample *= 1 - decayProgress * (1 - sustain);
        } else if (t < attackTime + decayTime + sustainTime) {
          sample *= sustain;
        } else {
          const releaseProgress = (t - attackTime - decayTime - sustainTime) / releaseTime;
          sample *= sustain * (1 - releaseProgress);
        }
      }
      
      data[i] = sample * 0.2; // Reduce volume
    }

    return buffer;
  }

  private generateNoiseSound(duration: number, type: 'white' | 'pink' = 'white'): AudioBuffer {
    if (!this.audioContext) return this.createSilentBuffer();

    const sampleRate = this.audioContext.sampleRate;
    const frames = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frames, sampleRate);
    const data = buffer.getChannelData(0);

    let pink_b0 = 0, pink_b1 = 0, pink_b2 = 0, pink_b3 = 0, pink_b4 = 0, pink_b5 = 0, pink_b6 = 0;

    for (let i = 0; i < frames; i++) {
      let sample = 0;
      
      if (type === 'white') {
        sample = Math.random() * 2 - 1;
      } else if (type === 'pink') {
        const white = Math.random() * 2 - 1;
        pink_b0 = 0.99886 * pink_b0 + white * 0.0555179;
        pink_b1 = 0.99332 * pink_b1 + white * 0.0750759;
        pink_b2 = 0.96900 * pink_b2 + white * 0.1538520;
        pink_b3 = 0.86650 * pink_b3 + white * 0.3104856;
        pink_b4 = 0.55000 * pink_b4 + white * 0.5329522;
        pink_b5 = -0.7616 * pink_b5 - white * 0.0168980;
        sample = pink_b0 + pink_b1 + pink_b2 + pink_b3 + pink_b4 + pink_b5 + pink_b6 + white * 0.5362;
        sample = sample * 0.11;
        pink_b6 = white * 0.115926;
      }
      
      // Apply fade in/out
      const fadeTime = 0.01;
      const fadeFrames = fadeTime * sampleRate;
      if (i < fadeFrames) {
        sample *= i / fadeFrames;
      } else if (i > frames - fadeFrames) {
        sample *= (frames - i) / fadeFrames;
      }
      
      data[i] = sample * 0.1;
    }

    return buffer;
  }

  public async initSounds() {
    if (!this.audioContext) {
      await this.initAudioContext();
    }

    // Generate game sounds
    const sounds = {
      // Game action sounds
      'click': this.generateTone(800, 0.1, 'square'),
      'success': this.generateComplexSound({
        frequencies: [523, 659, 784],
        duration: 0.3,
        type: 'sine',
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.0 }
      }),
      'error': this.generateComplexSound({
        frequencies: [200, 150],
        duration: 0.4,
        type: 'sawtooth',
        envelope: { attack: 0.0, decay: 0.3, sustain: 0.4, release: 0.3 }
      }),
      'notification': this.generateTone(1000, 0.2, 'sine'),
      
      // Game-specific sounds
      'gameStart': this.generateComplexSound({
        frequencies: [261, 329, 392, 523],
        duration: 0.5,
        type: 'sine',
        envelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.2 }
      }),
      'gameOver': this.generateComplexSound({
        frequencies: [220, 196, 174, 147],
        duration: 1.0,
        type: 'triangle',
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 }
      }),
      'levelUp': this.generateComplexSound({
        frequencies: [523, 659, 784, 1047],
        duration: 0.6,
        type: 'sine',
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.7, release: 0.15 }
      }),
      'powerUp': this.generateComplexSound({
        frequencies: [440, 554, 659, 880],
        duration: 0.4,
        type: 'square',
        envelope: { attack: 0.0, decay: 0.1, sustain: 0.8, release: 0.1 }
      }),
      'coin': this.generateTone(1319, 0.1, 'square'),
      'jump': this.generateTone(440, 0.15, 'square'),
      'hit': this.generateNoiseSound(0.1, 'pink'),
      'explosion': this.generateNoiseSound(0.3, 'white'),
      
      // BMO-specific sounds
      'bmoBeep': this.generateTone(1000, 0.1, 'square'),
      'bmoSuccess': this.generateComplexSound({
        frequencies: [1000, 1200, 1500],
        duration: 0.3,
        type: 'square',
        envelope: { attack: 0.0, decay: 0.1, sustain: 0.8, release: 0.1 }
      }),
      'bmoError': this.generateComplexSound({
        frequencies: [300, 250, 200],
        duration: 0.4,
        type: 'sawtooth',
        envelope: { attack: 0.0, decay: 0.2, sustain: 0.6, release: 0.2 }
      }),
      
      // Quiz sounds
      'quizCorrect': this.generateComplexSound({
        frequencies: [659, 784, 988],
        duration: 0.3,
        type: 'sine',
        envelope: { attack: 0.0, decay: 0.1, sustain: 0.8, release: 0.1 }
      }),
      'quizWrong': this.generateTone(200, 0.5, 'sawtooth'),
      
      // Maze sounds
      'mazeMove': this.generateTone(500, 0.05, 'square'),
      'mazeWin': this.generateComplexSound({
        frequencies: [523, 659, 784, 1047],
        duration: 0.8,
        type: 'sine',
        envelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.2 }
      }),
      
      // Battle sounds
      'battleAttack': this.generateTone(300, 0.2, 'sawtooth'),
      'battleDefend': this.generateTone(600, 0.15, 'triangle'),
      'battleWin': this.generateComplexSound({
        frequencies: [440, 554, 659, 880],
        duration: 1.0,
        type: 'sine',
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.2 }
      })
    };

    // Store sounds
    Object.entries(sounds).forEach(([name, buffer]) => {
      this.sounds.set(name, buffer);
    });
  }

  public async playSound(soundName: string, volume: number = 1): Promise<void> {
    if (this.muted || !this.audioContext) {
      return;
    }

    try {
      // Resume audio context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundName);
      if (!buffer) {
        console.warn(`Sound "${soundName}" not found`);
        return;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.value = this.masterVolume * this.sfxVolume * volume;
      source.start();
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  public getMasterVolume(): number { return this.masterVolume; }
  public getSfxVolume(): number { return this.sfxVolume; }
  public getMusicVolume(): number { return this.musicVolume; }

  public mute(): void {
    this.muted = true;
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  public unmute(): void {
    this.muted = false;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public async startBackgroundMusic(url?: string): Promise<void> {
    if (this.muted) return;

    try {
      if (this.backgroundMusic) {
        this.backgroundMusic.pause();
      }

      // Use a simple ambient background tone if no URL provided
      if (!url) {
        this.createAmbientBackground();
        return;
      }

      this.backgroundMusic = new Audio(url);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
      await this.backgroundMusic.play();
    } catch (error) {
      console.warn('Failed to start background music:', error);
    }
  }

  private createAmbientBackground(): void {
    if (!this.audioContext || this.muted) return;

    // Create a simple ambient background using oscillators
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(220, this.audioContext.currentTime);
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(330, this.audioContext.currentTime);
    
    gainNode.gain.value = this.masterVolume * this.musicVolume * 0.1;
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator1.start();
    oscillator2.start();
    
    // Slowly modulate the frequencies for ambient effect
    oscillator1.frequency.exponentialRampToValueAtTime(240, this.audioContext.currentTime + 8);
    oscillator2.frequency.exponentialRampToValueAtTime(310, this.audioContext.currentTime + 8);
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic = null;
    }
  }

  public async enableAudio(): Promise<void> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }
    
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    await this.initSounds();
  }
}