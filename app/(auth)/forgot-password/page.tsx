"use client";

import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, ArrowRight, RefreshCw, Key, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import { useTranslation } from '../../../hooks/use-translation';
import AuthLayout from '../layout';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  language?: Language;
}

export default function ForgotPasswordPage({ onNavigateLogin, language: propLanguage }: ForgotPasswordPageProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [sent, setSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError(language === 'darija' ? "3afak dakhil email s7i7." : "Veuillez saisir une adresse email valide.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || (language === 'darija' ? "Khata2 f l-irsal d l-rabit." : "Erreur lors de l'envoi du lien."));
    } finally {
      setLoading(false);
    }
  };

  const handleSendSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^(?:\+212|0)[5-7]\d{8}$/.test(phone)) {
      setError(language === 'darija' ? "Raqm l-telefon ghalt." : "Numéro marocain invalide.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || (language === 'darija' ? "Khata2 f l-irsal d SMS." : "Erreur lors de l'envoi du SMS."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError(language === 'darija' ? "L-koud khassou 6 d r-raqm." : "Le code doit contenir 6 chiffres.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (otpCode === '123456' || otpCode.length === 6) {
        setOtpVerified(true);
        // Navigate to password reset
        setTimeout(() => {
          const event = new CustomEvent('floussi_navigate', { detail: 'reset-password' });
          window.dispatchEvent(event);
        }, 1200);
      } else {
        throw new Error(language === 'darija' ? "Koud ghalt." : "Code incorrect.");
      }
    } catch (err: any) {
      setError(err.message || (language === 'darija' ? "Koud ghalt." : "Code incorrect."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {getTranslation('forgotPasswordTitle', language)}
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            {getTranslation('forgotPasswordSubtitle', language)}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed">
            <span>{error}</span>
          </div>
        )}

        {/* Method selector tab */}
        {!sent && !otpSent && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => { setMethod('email'); setError(''); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                method === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'darija' ? "B Email" : "Par Email"}
            </button>
            <button
              onClick={() => { setMethod('sms'); setError(''); }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                method === 'sms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {language === 'darija' ? "B SMS (OTP l-Maghrib)" : "Par SMS (OTP Maroc)"}
            </button>
          </div>
        )}

        {/* EMAIL SUBMIT FLOW */}
        {method === 'email' && (
          sent ? (
            <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-extrabold text-sm text-emerald-950">
                {language === 'darija' ? "Rabit tsifet!" : "Lien envoyé !"}
              </h3>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                {getTranslation('verifyEmailSubtitle', language)}
              </p>
              
              <button
                disabled={cooldown > 0}
                onClick={handleSubmitEmail}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all"
              >
                {cooldown > 0 
                  ? (language === 'darija' ? `A3id l-irsal f ${cooldown}s` : `Renvoyer dans ${cooldown}s`) 
                  : getTranslation('resendEmailButton', language)}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {getTranslation('emailLabel', language)} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Ex: karim.alaoui@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>{getTranslation('sendResetLinkButton', language)}</span>}
              </button>
            </form>
          )
        )}

        {/* SMS OTP SUBMIT FLOW */}
        {method === 'sms' && (
          otpVerified ? (
            <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-sm text-emerald-950">
                {language === 'darija' ? "T-t7a9aqna mn l-koud b najah !" : "Code vérifié avec succès !"}
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                {language === 'darija' ? "Ghadi n-diwek l r-reinitialisation..." : "Redirection vers l'écran de réinitialisation..."}
              </p>
            </div>
          ) : otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {getTranslation('otpCodeLabel', language)} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 tracking-widest placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>{getTranslation('verifyOtpButton', language)}</span>}
              </button>

              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleSendSmsOtp}
                className="w-full text-center text-[11px] font-bold text-emerald-600 disabled:text-slate-400 font-sans"
              >
                {cooldown > 0 
                  ? (language === 'darija' ? `A3id l-irsal f ${cooldown}s` : `Renvoyer le code dans ${cooldown}s`) 
                  : (language === 'darija' ? "A3id irsal SMS" : "Renvoyer le code SMS")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendSmsOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {getTranslation('phoneLabel', language)} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Smartphone size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: +212 612345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>{language === 'darija' ? "Tsifet SMS OTP" : "Envoyer le SMS OTP"}</span>}
              </button>
            </form>
          )
        )}

        <div className="text-center">
          <button
            onClick={onNavigateLogin}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{getTranslation('backToLogin', language)}</span>
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
