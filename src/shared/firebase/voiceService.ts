interface SpeechRecognitionResultLike {
  readonly length: number;
  [index: number]: { readonly [index: number]: { transcript: string } };
}

interface SpeechRecognitionEventLike {
  readonly results: SpeechRecognitionResultLike;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognition());
}

export interface VoiceCaptureResult {
  transcript: string;
}

export class VoiceRecorder {
  private recognition: SpeechRecognitionLike | null = null;
  private transcript = '';
  private onTranscript?: (text: string) => void;

  async start(onTranscript?: (text: string) => void) {
    this.transcript = '';
    this.onTranscript = onTranscript;

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      throw new Error('speech-not-supported');
    }

    this.recognition = new Recognition();
    this.recognition.lang = 'ko-KR';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;
    this.recognition.onresult = (event) => {
      let combined = '';
      for (let i = 0; i < event.results.length; i += 1) {
        combined += event.results[i][0].transcript;
      }
      this.transcript = combined.trim();
      this.onTranscript?.(this.transcript);
    };
    this.recognition.start();
  }

  async stop(): Promise<VoiceCaptureResult> {
    const recognitionDone = new Promise<void>((resolve) => {
      if (!this.recognition) {
        resolve();
        return;
      }
      this.recognition.onend = () => resolve();
      this.recognition.stop();
    });

    await recognitionDone;
    this.recognition = null;

    return { transcript: this.transcript };
  }
}
