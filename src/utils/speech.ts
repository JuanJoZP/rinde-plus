// Text-to-Speech and Speech-to-Text utilities for accessibility

export class TextToSpeech {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  speak(
    text: string,
    options?: { rate?: number; pitch?: number; volume?: number; lang?: string }
  ) {
    // Cancel any ongoing speech
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;
    utterance.lang = options?.lang || "es-ES";

    this.currentUtterance = utterance;
    this.synth.speak(utterance);

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
    });
  }

  cancel() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

export class SpeechToText {
  private recognition: any;
  private isListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "es-ES";
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  listen(): Promise<string> {
    if (!this.recognition) {
      return Promise.reject(new Error("Speech recognition not supported"));
    }

    if (this.isListening) {
      console.warn("Recognition already running");
      return Promise.reject("Recognition already running");
    }

    return new Promise((resolve, reject) => {
      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript.trim().toUpperCase());
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening() {
    try {
      if (this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    } catch (e) {
      console.warn("stopListening error:", e);
    }
  }
  getIsListening(): boolean {
    return this.isListening;
  }
}
