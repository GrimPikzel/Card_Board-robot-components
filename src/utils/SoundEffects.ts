/**
 * Sound effects utility for UI interactions
 */

class SoundEffects {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private hoverFx2Buffer: AudioBuffer | null = null;
  private isLoading = false;
  private isLoadingHoverFx2 = false;
  private isEnabledCallback: (() => boolean) | null = null;

  constructor() {
    // Initialize on first user interaction
    this.initializeOnUserInteraction();
  }

  private initializeOnUserInteraction() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const initialize = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        this.loadSound('/hover3.mp3');
        this.loadHoverFx2('/hoverfx2.mp3');
      }
    };

    document.addEventListener('mousedown', initialize, { once: true });
    document.addEventListener('keydown', initialize, { once: true });
    document.addEventListener('mouseover', initialize, { once: true });
  }

  private async loadSound(url: string): Promise<void> {
    if (this.isLoading || this.audioBuffer) return;

    this.isLoading = true;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (this.audioContext) {
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      }
    } catch (error) {
      console.warn('Failed to load sound:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadHoverFx2(url: string): Promise<void> {
    if (this.isLoadingHoverFx2 || this.hoverFx2Buffer) return;

    this.isLoadingHoverFx2 = true;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (this.audioContext) {
        this.hoverFx2Buffer = await this.audioContext.decodeAudioData(arrayBuffer);
      }
    } catch (error) {
      console.warn('Failed to load hoverfx2 sound:', error);
    } finally {
      this.isLoadingHoverFx2 = false;
    }
  }

  /**
   * Set callback to check if sounds are enabled
   */
  public setEnabledCallback(callback: () => boolean): void {
    this.isEnabledCallback = callback;
  }

  /**
   * Play sound with pitch adjustment
   * @param pitchShift - Multiplier for playback rate (1.0 = normal, 0.5 = half speed/lower pitch, 2.0 = double speed/higher pitch)
   * @param volume - Volume level (0.0 to 1.0)
   * @param duration - Optional duration in seconds to limit playback length
   */
  public playSound(pitchShift: number = 1.0, volume: number = 0.3, duration?: number): void {
    // Check if sounds are enabled
    if (this.isEnabledCallback && !this.isEnabledCallback()) {
      return;
    }

    if (!this.audioContext || !this.audioBuffer) {
      return;
    }

    // Auto-resume suspended context (works for user-initiated events like clicks/hovers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    try {
      // Create a new buffer source for each playback
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.audioBuffer;
      source.playbackRate.value = pitchShift;
      gainNode.gain.value = volume;

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play the sound
      source.start(0);

      // Stop after duration if specified
      if (duration !== undefined) {
        source.stop(this.audioContext.currentTime + duration);
      }
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Play hover sound with slight pitch variation for uniqueness
   * @param buttonId - Button identifier to create consistent but unique pitch
   */
  public playHoverSound(buttonId: string): void {
    // Create a consistent but unique pitch based on button ID
    const hash = this.hashString(buttonId);
    const pitchVariation = 1.3 + (hash * 0.3); // Range: 1.3 to 1.6 (higher pitch)
    this.playSound(pitchVariation, 0.08, 0.06); // Lower volume, shorter duration
  }

  /**
   * Play click sound - short, high pitch, low volume
   */
  public playClickSound(): void {
    this.playSound(1.4, 0.1, 0.08); // Higher pitch, lower volume, shorter duration
  }

  /**
   * Play the hoverfx2 sound for Quick Start buttons
   * @param volume - Volume level (0.0 to 1.0)
   */
  public playQuickStartHover(volume: number = 0.05): void {
    // Check if sounds are enabled
    if (this.isEnabledCallback && !this.isEnabledCallback()) {
      return;
    }

    if (!this.audioContext || !this.hoverFx2Buffer) {
      return;
    }

    // Auto-resume suspended context (works for user-initiated events like clicks/hovers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const duration = 0.05; // 50ms

      // Create a new buffer source for each playback
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = this.hoverFx2Buffer;
      source.playbackRate.value = 0.6; // Lower pitch
      gainNode.gain.setValueAtTime(volume, now);
      // Quick fade out at the end to avoid click
      gainNode.gain.setValueAtTime(volume, now + duration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Play
      source.start(now);
      source.stop(now + duration);
    } catch (error) {
      console.warn('Failed to play quick start hover sound:', error);
    }
  }

  /**
   * Play the hoverfx2 sound for clicks - same sound as hover but different pitch and lower volume
   * @param volume - Optional volume level (0.0 to 1.0), defaults to 0.035
   */
  public playQuickStartClick(volume: number = 0.035): void {
    // Check if sounds are enabled
    if (this.isEnabledCallback && !this.isEnabledCallback()) {
      return;
    }

    if (!this.audioContext || !this.hoverFx2Buffer) {
      return;
    }

    // Auto-resume suspended context (works for user-initiated events like clicks/hovers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    try {
      const ctx = this.audioContext;
      const now = ctx.currentTime;
      const duration = 0.06; // 60ms - slightly longer than hover

      // Create a new buffer source for each playback
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = this.hoverFx2Buffer;
      source.playbackRate.value = 0.8; // Higher pitch than hover (0.6)
      gainNode.gain.setValueAtTime(volume, now);
      // Quick fade out at the end to avoid click
      gainNode.gain.setValueAtTime(volume, now + duration - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);

      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Play
      source.start(now);
      source.stop(now + duration);
    } catch (error) {
      console.warn('Failed to play quick start click sound:', error);
    }
  }

  /**
   * Simple string hash function for consistent pitch variations
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  /**
   * Resume audio context if it's suspended (required by some browsers)
   */
  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

// Create a singleton instance
export const soundEffects = new SoundEffects();
