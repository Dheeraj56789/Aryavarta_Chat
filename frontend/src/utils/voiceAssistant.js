// Enhanced Multilingual Voice Assistant Engine (Speech-to-Text & Text-to-Speech)

class VoiceAssistantEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.availableVoices = [];
    this.manualStop = false;
    this.initVoices();
  }

  // 1. Initialize & Cache Available Voices
  initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      this.availableVoices = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getVoices() {
    if (this.availableVoices.length === 0 && typeof window !== "undefined" && "speechSynthesis" in window) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }
    return this.availableVoices;
  }

  // 2. Speech-to-Text (STT) Recognition using Web Speech API
  startListening({ onTranscript, onFinal, onStart, onEnd, onError, language = "en-US", continuous = false }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (onError) onError(new Error("Speech recognition is not supported in this browser. Please use Chrome or Edge."));
      return false;
    }

    try {
      this.manualStop = false;
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = language || "en-US";

      this.recognition.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        if (onTranscript) {
          onTranscript(finalTranscript || interimTranscript);
        }

        if (finalTranscript && onFinal) {
          onFinal(finalTranscript.trim());
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          // Ignore no-speech harmless timeout
          return;
        }

        this.isListening = false;
        if (onError) onError(event.error || event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Error starting speech recognition:", err);
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    this.manualStop = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  // 3. Text-to-Speech (TTS) Synthesis using Web Speech API
  speak(text, { voiceURI, pitch = 1.0, rate = 1.0, language = "en-US", onStart, onEnd } = {}) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    this.stopSpeaking();

    // Clean markdown symbols & emojis for natural voice synthesis
    const cleanText = text
      .replace(/###\s+/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // remove code blocks
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // markdown links
      .replace(/[📞📹💬✉️🚀✨🔐⚡🔴🧠🔊❌🤔]/g, "") // remove common icons
      .replace(/^[>\s#\-_*]+/gm, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.rate = Math.max(0.7, Math.min(1.3, rate));

    const voices = this.getVoices();
    if (voiceURI && voiceURI !== "default") {
      const selected = voices.find((v) => v.voiceURI === voiceURI || v.name === voiceURI);
      if (selected) {
        utterance.voice = selected;
      }
    } else if (language) {
      // Pick voice matching language code (e.g. hi-IN or en-IN / en-US)
      const langPrefix = language.split("-")[0].toLowerCase();
      const langVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
      if (langVoice) {
        utterance.voice = langVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const voiceAssistant = new VoiceAssistantEngine();
