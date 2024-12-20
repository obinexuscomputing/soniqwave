export class AudioPlaybackManager {
    private context: AudioContext;
    private gainNode: GainNode;

    constructor() {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.setupAudioContextResume();
    }

    private setupAudioContextResume(): void {
        const resumeContext = () => {
            if (this.context.state === 'suspended') {
                this.context.resume();
            }
        };
        document.addEventListener('click', resumeContext);
        document.addEventListener('keydown', resumeContext);
    }

    public setVolume(volume: number): void {
        this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    }

    public play(buffer: Float32Array, duration: number): void {
        this.playBuffer(buffer, duration);
    }

    public playBuffer(buffer: Float32Array, duration: number): void {
        const audioBuffer = this.context.createBuffer(1, buffer.length, this.context.sampleRate);
        audioBuffer.copyToChannel(buffer, 0);

        const bufferSource = this.context.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(this.gainNode);
        bufferSource.start();
        bufferSource.stop(this.context.currentTime + duration);
    }

    static async loadAudioBuffer(url: string): Promise<Float32Array> {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.decodeAudioData(arrayBuffer);
        return audioBuffer.getChannelData(0);
    }

    private static async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
        const context = new AudioContext();
        return new Promise((resolve, reject) => {
            context.decodeAudioData(arrayBuffer, resolve, reject);
        });
    }

    public async playAudioBufferFromURL(url: string, duration: number): Promise<void> {
        const audioBuffer = await AudioPlaybackManager.loadAudioBuffer(url);
        this.playBuffer(audioBuffer, duration);
    }

    public stop(): void {
        this.context.close();
    }

    protected generateSineWaveBuffer(frequency: number, duration: number): Float32Array {
        const length = Math.floor(this.context.sampleRate * duration);
        const buffer = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            buffer[i] = Math.sin(2 * Math.PI * frequency * (i / this.context.sampleRate));
        }
        return buffer;
    }

    public synthesizeHarmonics(baseFrequency: number, harmonics: number[], amplitudes: number[]): Float32Array {
        const length = Math.floor(this.context.sampleRate * 1); // Default 1 second buffer
        const buffer = new Float32Array(length);

        harmonics.forEach((harmonic, index) => {
            const amplitude = amplitudes[index] || 1;
            for (let i = 0; i < length; i++) {
                buffer[i] += amplitude * Math.sin(2 * Math.PI * (baseFrequency * harmonic) * (i / this.context.sampleRate));
            }
        });

        // Normalize buffer
        const maxAmplitude = Math.max(...buffer.map(Math.abs));
        if (maxAmplitude > 0) {
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] /= maxAmplitude;
            }
        }

        return buffer;
    }

    public playSineWave(frequency: number, duration: number): void {
        const buffer = this.generateSineWaveBuffer(frequency, duration);
        this.playBuffer(buffer, duration);
    }

    public playChord(frequencies: number[], duration: number): void {
        const length = Math.floor(this.context.sampleRate * duration);
        const chordBuffer = new Float32Array(length);

        frequencies.forEach(frequency => {
            const sineWave = this.generateSineWaveBuffer(frequency, duration);
            for (let i = 0; i < length; i++) {
                chordBuffer[i] += sineWave[i];
            }
        });

        // Normalize buffer
        const maxAmplitude = Math.max(...chordBuffer.map(Math.abs));
        if (maxAmplitude > 0) {
            for (let i = 0; i < chordBuffer.length; i++) {
                chordBuffer[i] /= maxAmplitude;
            }
        }

        this.playBuffer(chordBuffer, duration);
    }

    public playMajorChord(rootFrequency: number, duration: number): void {
        const majorChord = [rootFrequency, rootFrequency * 5 / 4, rootFrequency * 3 / 2];
        this.playChord(majorChord, duration);
    }

    public playMinorChord(rootFrequency: number, duration: number): void {
        const minorChord = [rootFrequency, rootFrequency * 6 / 5, rootFrequency * 3 / 2];
        this.playChord(minorChord, duration);
    }

    public playSeventhChord(rootFrequency: number, duration: number): void {
        const seventhChord = [rootFrequency, rootFrequency * 5 / 4, rootFrequency * 3 / 2, rootFrequency * 7 / 4];
        this.playChord(seventhChord, duration);
    }

    public playDiminishedChord(rootFrequency: number, duration: number): void {
        const diminishedChord = [rootFrequency, rootFrequency * 6 / 5, rootFrequency * 7 / 5];
        this.playChord(diminishedChord, duration);
    }

    public playAugmentedChord(rootFrequency: number, duration: number): void {
        const augmentedChord = [rootFrequency, rootFrequency * 5 / 4, rootFrequency * 8 / 5];
        this.playChord(augmentedChord, duration);
    }
}
