import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Delete, 
  AlertCircle, 
  X, 
  Lock, 
  Fingerprint, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { useBiometricAuth } from '../../hooks/use-biometric-auth';

interface PinConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount?: number;
  language: 'fr' | 'darija';
  title?: string;
  subtitle?: string;
}

export function PinConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  amount = 0,
  language,
  title,
  subtitle
}: PinConfirmModalProps) {
  const { isEnabled: isBiometricEnabled, authenticate } = useBiometricAuth();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Steps: 
  // 'enter_pin' -> first PIN entry
  // 'double_confirm' -> only for amounts > 5000 DH (second PIN entry or biometric prompt)
  // 'success' -> validated
  const [step, setStep] = useState<'enter_pin' | 'double_confirm' | 'success'>('enter_pin');
  const [doubleConfirmCountdown, setDoubleConfirmCountdown] = useState<number>(3);
  const [savedPin, setSavedPin] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  const DEFAULT_PIN = localStorage.getItem('secure_pin') || '1234';

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setStep('enter_pin');
      setDoubleConfirmCountdown(3);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setAttempts(0);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'double_confirm' && doubleConfirmCountdown > 0) {
      timer = setTimeout(() => {
        setDoubleConfirmCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, doubleConfirmCountdown]);

  const handleKeyPress = (num: string) => {
    if (lockoutTime > 0) return;
    setError('');
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // If entered 4 digits
      if (nextPin.length === 4) {
        // Trigger completion logic after a minor delay for visual feedback
        setTimeout(() => {
          validatePin(nextPin);
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    if (lockoutTime > 0) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (lockoutTime > 0) return;
    setPin('');
  };

  const validatePin = async (enteredPin: string) => {
    if (lockoutTime > 0) return;

    if (enteredPin !== DEFAULT_PIN) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        setError(language === 'darija' 
          ? 'Trop de tentatives ! Veuillez patienter 30 secondes.' 
          : 'Trop de tentatives ! Veuillez patienter 30 secondes.'
        );
        setLockoutTime(30);
      } else {
        setError(language === 'darija' 
          ? `Code PIN rale7 ! B9a likom ${3 - nextAttempts} d tjarib.` 
          : `Code PIN incorrect ! Encore ${3 - nextAttempts} essai(s).`
        );
      }
      setPin('');
      return;
    }

    setAttempts(0);

    // High amount guard (> 5000 DH)
    if (amount > 5000 && step === 'enter_pin') {
      setSavedPin(enteredPin);
      setPin('');
      setStep('double_confirm');
      setDoubleConfirmCountdown(3);
      return;
    }

    // If step was 'double_confirm', or amount <= 5000 DH, we are fully validated!
    handleSuccess();
  };

  const handleSuccess = () => {
    setStep('success');
    setTimeout(() => {
      onConfirm();
      onClose();
    }, 1200);
  };

  const handleBiometricOverride = async () => {
    if (!isBiometricEnabled) return;
    const success = await authenticate(
      language === 'darija' 
        ? "Msa3adat t-haqoq l-biometri l l-mabla9 l-kbir"
        : "Validation biométrique de sécurité renforcée"
    );
    if (success) {
      handleSuccess();
    } else {
      setError(language === 'darija' ? 'Khta f-biometria' : 'Échec de la validation biométrique');
    }
  };

  const t = {
    modalTitle: title || (language === 'darija' ? 'Taqid l-Amaliya' : 'Confirmation de sécurité'),
    modalSub: subtitle || (language === 'darija' ? 'Kteb koud l-PIN dyalk (Par défaut: 1234)' : 'Entrez votre code PIN secret (Par défaut: 1234)'),
    doubleConfirmTitle: language === 'darija' ? '🔒 Taqid Sani - Mabla9 Kbir' : '🔒 Double Validation - Montant Élevé',
    doubleConfirmSub: language === 'darija' 
      ? `Mabla9 kbir (> 5000 DH). 3awed kteb l-PIN dyalk bch t-aqad d-tahwil.`
      : `Montant supérieur à 5 000 DH (${amount.toLocaleString('fr-FR')} DH). Veuillez confirmer à nouveau pour éviter toute erreur.`,
    cooldownMsg: (secs: number) => language === 'darija' 
      ? `Sna s-saniat... (${secs}s)` 
      : `Veuillez patienter... (${secs}s)`,
    biometricsBtn: language === 'darija' ? 'Dir Biometria (FaceID)' : 'Confirmer par Biométrie',
    successMsg: language === 'darija' ? 'T-haqoq Maqboula !' : 'Transaction Validée !',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock size={16} />
              </div>
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
                {step === 'double_confirm' ? t.doubleConfirmTitle : t.modalTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 flex-1 flex flex-col items-center justify-center space-y-6">
            
            {/* Amount Warning */}
            {amount > 0 && (
              <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-center font-mono w-full">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Montant à valider</span>
                <span className="text-lg font-black text-slate-800">{amount.toLocaleString('fr-FR')} DH</span>
              </div>
            )}

            {step === 'enter_pin' && (
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-500 font-bold leading-relaxed px-2">
                  {t.modalSub}
                </p>
              </div>
            )}

            {step === 'double_confirm' && (
              <div className="text-center space-y-2 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl w-full">
                <p className="text-xs text-amber-800 font-black flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{language === 'darija' ? 'Double confirmation' : 'Sécurité Renforcée'}</span>
                </p>
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  {t.doubleConfirmSub}
                </p>
              </div>
            )}

            {/* Error view */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-red-600 font-black uppercase flex items-center gap-1.5"
              >
                <AlertCircle size={13} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Steps Rendering */}
            {step === 'success' ? (
              <div className="py-8 flex flex-col items-center space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
                >
                  <CheckCircle2 size={36} />
                </motion.div>
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.successMsg}</p>
              </div>
            ) : (
              <div className="w-full space-y-6 flex flex-col items-center">
                {/* Visual PIN Dots */}
                <div className="flex gap-4 justify-center items-center h-8">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                        index < pin.length
                          ? 'bg-blue-600 border-blue-600 scale-110'
                          : 'border-slate-300 bg-transparent'
                      } ${lockoutTime > 0 ? 'border-red-300 bg-red-100' : ''}`}
                    />
                  ))}
                </div>

                {/* Lockout status indicator */}
                {lockoutTime > 0 && (
                  <div className="px-4 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 font-extrabold text-[9px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                    <Lock size={11} />
                    <span>Bloqué : {lockoutTime}s</span>
                  </div>
                )}

                {/* Biometric unlock option in Double Confirm */}
                {step === 'double_confirm' && isBiometricEnabled && (
                  <button
                    onClick={handleBiometricOverride}
                    disabled={lockoutTime > 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase cursor-pointer transition-colors disabled:opacity-40"
                  >
                    <Fingerprint size={14} />
                    <span>{t.biometricsBtn}</span>
                  </button>
                )}

                {/* Tactile Keypad (Custom 10-key) */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] font-mono">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={(step === 'double_confirm' && doubleConfirmCountdown > 0) || lockoutTime > 0}
                      onClick={() => handleKeyPress(num)}
                      className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 active:bg-blue-50 active:text-blue-600 flex items-center justify-center text-lg font-black transition-colors border border-slate-100 cursor-pointer disabled:opacity-40"
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Clear Key */}
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={lockoutTime > 0}
                    className="w-16 h-16 rounded-full bg-transparent text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer uppercase tracking-wider disabled:opacity-30"
                  >
                    Clear
                  </button>

                  {/* 0 Key */}
                  <button
                    type="button"
                    disabled={(step === 'double_confirm' && doubleConfirmCountdown > 0) || lockoutTime > 0}
                    onClick={() => handleKeyPress('0')}
                    className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 active:bg-blue-50 active:text-blue-600 flex items-center justify-center text-lg font-black transition-colors border border-slate-100 cursor-pointer disabled:opacity-40"
                  >
                    0
                  </button>

                  {/* Backspace Key */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={lockoutTime > 0}
                    className="w-16 h-16 rounded-full bg-transparent text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer disabled:opacity-30"
                  >
                    <Delete size={20} />
                  </button>
                </div>

                {/* Cooldown prompt for Double confirmation */}
                {step === 'double_confirm' && doubleConfirmCountdown > 0 && (
                  <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                    <RefreshCw size={11} className="animate-spin" />
                    <span>{t.cooldownMsg(doubleConfirmCountdown)}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
