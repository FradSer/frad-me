import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, voiceName?: string) => void;
  stop: () => void;
}

// Helper function to add pauses (can be customized)
function addPauses(text: string): string {
  return text.replace(/(\r\n|\n|\r)/gm, '. '); // Replace newlines with periods and a space
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Check for SpeechSynthesis support
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    // Cleanup: stop any ongoing speech on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, voiceName: string = 'Fred') => {
      if (!isSupported || !window.speechSynthesis) return; // Guard clause

      // Stop any previous utterance
      window.speechSynthesis.cancel();

      const processedText = addPauses(text.trim());
      const utterance = new SpeechSynthesisUtterance(processedText);

      // Attempt to find and use the requested voice
      const availableVoices = window.speechSynthesis.getVoices();
      const selectedVoice = availableVoices.find((voice) => voice.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return; // Guard clause
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return useMemo(
    () => ({ isSupported, isSpeaking, speak, stop }),
    [isSupported, isSpeaking, speak, stop],
  );
}
