import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, VolumeX, Music, Gamepad2 } from "lucide-react";
import { AudioManager } from "@/lib/audioManager";

interface AudioSettings {
  masterVolume: number;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicVolume: number;
  soundEffectsVolume: number;
}

export function AudioSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 70,
    musicEnabled: true,
    soundEffectsEnabled: true,
    musicVolume: 50,
    soundEffectsVolume: 80
  });

  const audioManager = AudioManager.getInstance();
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("bemora-audio-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Failed to parse audio settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("bemora-audio-settings", JSON.stringify(settings));
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("audioSettingsChange", { detail: settings }));
  }, [settings]);

  // Initialize audio manager and background music
  useEffect(() => {
    audioManager.enableAudio();
    audioManager.initSounds();
    
    if (settings.musicEnabled) {
      audioManager.startBackgroundMusic();
    } else {
      audioManager.stopBackgroundMusic();
    }
    
    if (!settings.soundEffectsEnabled) {
      audioManager.mute();
    } else {
      audioManager.unmute();
    }
  }, [settings.musicEnabled, settings.soundEffectsEnabled]);

  // Update volumes
  useEffect(() => {
    audioManager.setMasterVolume(settings.masterVolume / 100);
    audioManager.setMusicVolume(settings.musicVolume / 100);
    audioManager.setSfxVolume(settings.soundEffectsVolume / 100);
  }, [settings.masterVolume, settings.musicVolume, settings.soundEffectsVolume]);

  const createBackgroundMusic = () => {
    // For demo purposes, we'll use a simple tone generator
    // In production, you'd load actual audio files
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a simple pleasant background tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      oscillator.type = 'sine';
      
      // Set very low volume for background ambiance
      gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
      
      // Start the oscillator
      oscillator.start();
      
      // Create a reference to control it
      backgroundMusicRef.current = {
        pause: () => oscillator.stop(),
        volume: 0.01
      } as any;
      
    } catch (error) {
      console.log("Web Audio API not available");
    }
  };

  const playTestSound = () => {
    if (!settings.soundEffectsEnabled) return;
    
    // Create a test sound effect
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a coin/pickup sound effect
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      const volume = (settings.masterVolume / 100) * (settings.soundEffectsVolume / 100) * 0.1;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
    } catch (error) {
      console.log("Could not play test sound");
    }
  };

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const isMuted = settings.masterVolume === 0 || (!settings.musicEnabled && !settings.soundEffectsEnabled);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur-sm border-primary/50 shadow-lg hover:border-primary"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-red-500" />
          ) : (
            <Volume2 className="h-5 w-5 text-primary" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Master Volume</label>
              <span className="text-sm text-muted-foreground">{settings.masterVolume}%</span>
            </div>
            <Slider
              value={[settings.masterVolume]}
              onValueChange={([value]) => updateSetting("masterVolume", value)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Background Music */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <label className="text-sm font-medium">Background Music</label>
              </div>
              <Switch
                checked={settings.musicEnabled}
                onCheckedChange={(checked) => updateSetting("musicEnabled", checked)}
              />
            </div>
            
            {settings.musicEnabled && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Music Volume</label>
                  <span className="text-sm text-muted-foreground">{settings.musicVolume}%</span>
                </div>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={([value]) => updateSetting("musicVolume", value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Sound Effects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                <label className="text-sm font-medium">Sound Effects</label>
              </div>
              <Switch
                checked={settings.soundEffectsEnabled}
                onCheckedChange={(checked) => updateSetting("soundEffectsEnabled", checked)}
              />
            </div>
            
            {settings.soundEffectsEnabled && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-muted-foreground">Effects Volume</label>
                  <span className="text-sm text-muted-foreground">{settings.soundEffectsVolume}%</span>
                </div>
                <Slider
                  value={[settings.soundEffectsVolume]}
                  onValueChange={([value]) => updateSetting("soundEffectsVolume", value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playTestSound}
                  className="w-full"
                >
                  Test Sound
                </Button>
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Presets</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettings({
                  masterVolume: 0,
                  musicEnabled: false,
                  soundEffectsEnabled: false,
                  musicVolume: 50,
                  soundEffectsVolume: 80
                })}
              >
                Mute All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettings({
                  masterVolume: 30,
                  musicEnabled: true,
                  soundEffectsEnabled: true,
                  musicVolume: 40,
                  soundEffectsVolume: 60
                })}
              >
                Quiet
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettings({
                  masterVolume: 70,
                  musicEnabled: true,
                  soundEffectsEnabled: true,
                  musicVolume: 50,
                  soundEffectsVolume: 80
                })}
              >
                Default
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for components to use audio settings
export function useAudioSettings() {
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 70,
    musicEnabled: true,
    soundEffectsEnabled: true,
    musicVolume: 50,
    soundEffectsVolume: 80
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("bemora-audio-settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse audio settings:", error);
      }
    }

    // Listen for settings changes
    const handleSettingsChange = (event: CustomEvent) => {
      setSettings(event.detail);
    };

    window.addEventListener("audioSettingsChange", handleSettingsChange as EventListener);
    return () => window.removeEventListener("audioSettingsChange", handleSettingsChange as EventListener);
  }, []);

  const playSound = (type: "click" | "success" | "error" | "coin" | "powerup") => {
    if (!settings.soundEffectsEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const volume = (settings.masterVolume / 100) * (settings.soundEffectsVolume / 100) * 0.1;
      
      switch (type) {
        case "click":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case "success":
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case "error":
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case "coin":
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        case "powerup":
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
          oscillator.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.4);
          gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
      }
      
      oscillator.start();
      
    } catch (error) {
      console.log("Could not play sound effect");
    }
  };

  return { settings, playSound };
}