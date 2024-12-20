export class AudioPlaybackManager {
    private audioContext: AudioContext;
  
    constructor() {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  
    play(data: Float32Array): void {
      const buffer = this.audioContext.createBuffer(1, data.length, this.audioContext.sampleRate);
      buffer.copyToChannel(data, 0);
  
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();
    }
  
    stop(): void {
      this.audioContext.close();
    }
  }
  