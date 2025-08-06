import { useState, useEffect, useCallback } from 'react'

interface UseSpeechSynthesisReturn {
  isSupported: boolean
  isSpeaking: boolean
  speak: (text: string, voiceName?: string) => void
  stop: () => void
  voices: SpeechSynthesisVoice[]
}

// Helper function to add pauses (can be customized)
function addPauses(text: string): string {
  return text.replace(/(\r\n|\n|\r)/gm, '. ') // Replace newlines with periods and a space
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const initVoices = useCallback(() => {
    if (!window.speechSynthesis) return
    const availableVoices = window.speechSynthesis.getVoices()
    if (availableVoices.length > 0) {
      setVoices(availableVoices)
    }
  }, [])

  useEffect(() => {
    // Check for SpeechSynthesis support
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true)
      initVoices() // Try immediately
      // Listen for changes (voices might load asynchronously)
      window.speechSynthesis.onvoiceschanged = initVoices
    } else {
      setIsSupported(false)
    }

    // Cleanup listener on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
        window.speechSynthesis.cancel() // Stop any ongoing speech on unmount
      }
    }
  }, [initVoices])

  const speak = useCallback(
    (text: string, voiceName: string = 'Fred') => {
      if (!isSupported || !window.speechSynthesis) return // Guard clause

      // Stop any previous utterance
      window.speechSynthesis.cancel()

      const processedText = addPauses(text.trim())
      const utterance = new SpeechSynthesisUtterance(processedText)

      // Attempt to find and use the requested voice
      const selectedVoice = voices.find((voice) => voice.name === voiceName)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      } else if (voices.length > 0) {
        // Fallback logic if specific voice not found but voices are available
        // You might want to set a default voice here, e.g., utterance.voice = voices[0];
      } else {
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, voices],
  )

  const stop = useCallback(() => {
    if (!isSupported || !window.speechSynthesis) return // Guard clause
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [isSupported])

  return { isSupported, isSpeaking, speak, stop, voices }
}
