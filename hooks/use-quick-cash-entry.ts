import { useState, useEffect } from 'react';
import { useTransactions } from './use-transactions';
import { useAuth } from './use-auth';

export type QuickCashMode = 'souk' | 'taxi' | 'hanout' | 'other';

export interface QuickCashState {
  mode: QuickCashMode;
  amount: number;
  category: string;
  description: string;
  photoUrl: string | null;
  location: { lat: number; lng: number } | null;
  tags: string[];
}

/**
 * Custom hook to manage immediate cash transaction entries
 */
export function useQuickCashEntry() {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { createTransaction } = useTransactions(userId);

  const [mode, setMode] = useState<QuickCashMode>('souk');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>('alimentation');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tags, setTags] = useState<string[]>(['cash']);

  // Web Speech API Voice state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);

  // Check Speech API Support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
      }
    }
  }, []);

  // Update category and tags based on selected mode
  useEffect(() => {
    if (mode === 'souk') {
      setCategory('alimentation');
      setTags(['cash', 'souk']);
      if (!description) setDescription('Courses au souk');
    } else if (mode === 'taxi') {
      setCategory('transport');
      setTags(['cash', 'taxi', 'petit-taxi']);
      if (!description) setDescription('Course Petit Taxi');
    } else if (mode === 'hanout') {
      setCategory('alimentation');
      setTags(['cash', 'hanout']);
      if (!description) setDescription('Achats Moul Hanout');
    } else {
      setCategory('autres');
      setTags(['cash']);
    }
  }, [mode]);

  // Geolocation trigger
  const requestLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("[useQuickCashEntry] Geolocation failed:", err);
        }
      );
    }
  };

  // Pre-calculated taxi fare suggestions based on standard daytime (starts at 2.00 DH, min 8 DH) and nighttime (+50% after 20:00, min 12 DH)
  const estimateTaxiFare = (estimatedDistanceKm: number = 5): { rate: number; isNight: boolean; breakdown: string } => {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 20 || currentHour < 6;
    
    // Simple Moroccan taxi rate heuristic: 2.00 DH starting fare, +0.30 DH per 100m, +30% for waiting/traffic, +50% night charge
    const baseFare = 2.00;
    const distanceCost = estimatedDistanceKm * 3.00; // 3 DH per KM
    const trafficAddon = 3.00;
    
    let estimated = baseFare + distanceCost + trafficAddon;
    if (isNight) {
      estimated *= 1.5;
    }
    
    // Enforce minimum fares
    const finalFare = Math.round(Math.max(isNight ? 12.00 : 8.00, estimated));
    const breakdown = isNight 
      ? `Tarif Nuit (+50%, min 12 DH) estimé pour ~${estimatedDistanceKm} km`
      : `Tarif Jour (min 8 DH) estimé pour ~${estimatedDistanceKm} km`;

    return {
      rate: finalFare,
      isNight,
      breakdown
    };
  };

  // Voice entry action via Web Speech
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'fr-FR'; // Fallback French which is widely understood and transcribed

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setVoiceTranscript(resultText);
      parseVoiceCommand(resultText);
    };

    recognition.onerror = (err: any) => {
      console.error("[useQuickCashEntry] Speech Recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Simple rule-based parser for voice commands like "vingt dirhams pain"
  const parseVoiceCommand = (command: string) => {
    const lower = command.toLowerCase();
    
    // 1. Try to extract numbers for amount
    const numbers = lower.match(/\d+/);
    if (numbers) {
      const voiceAmount = parseInt(numbers[0], 10);
      setAmount(voiceAmount);
    } else {
      // word fallbacks
      const wordsMap: Record<string, number> = {
        'un': 1, 'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
        'dix': 10, 'quinze': 15, 'vingt': 20, 'trente': 30,
        'quarante': 40, 'cinquante': 50, 'cent': 100
      };
      for (const [word, val] of Object.entries(wordsMap)) {
        if (lower.includes(word)) {
          setAmount(val);
          break;
        }
      }
    }

    // 2. Try to extract categories or merchants
    if (lower.includes('taxi') || lower.includes('transport') || lower.includes('voyage')) {
      setMode('taxi');
    } else if (lower.includes('souk') || lower.includes('marche') || lower.includes('légumes') || lower.includes('fruits')) {
      setMode('souk');
    } else if (lower.includes('hanout') || lower.includes('epicerie') || lower.includes('pain') || lower.includes('lait')) {
      setMode('hanout');
    }

    // 3. Keep full text in description
    setDescription(command);
  };

  const submitCashEntry = async () => {
    if (amount <= 0) return false;

    try {
      await createTransaction({
        account_id: "cash-wallet-id-8888", // standard cash wallet
        bucket_id: null, // will auto assign by backend or frontend
        type: 'expense',
        amount,
        description: description || `Achat cash - ${mode}`,
        merchant: mode === 'taxi' ? 'Petit Taxi' : mode === 'souk' ? 'Souk local' : 'Hanout',
        category,
        tags,
        receipt_url: photoUrl,
        is_recurring: false,
        recurring_frequency: null,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // reset states
      setAmount(0);
      setDescription('');
      setPhotoUrl(null);
      setLocation(null);
      return true;
    } catch (err) {
      console.error("[useQuickCashEntry] Failed to submit cash transaction:", err);
      return false;
    }
  };

  return {
    mode,
    setMode,
    amount,
    setAmount,
    category,
    setCategory,
    description,
    setDescription,
    photoUrl,
    setPhotoUrl,
    location,
    requestLocation,
    tags,
    setTags,
    submitCashEntry,
    // Taxi helpers
    estimateTaxiFare,
    // Voice helpers
    voiceSupported,
    isListening,
    voiceTranscript,
    startVoiceInput
  };
}
