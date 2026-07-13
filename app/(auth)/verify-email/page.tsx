"use client";

import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import AuthLayout from '../layout';

interface VerifyEmailPageProps {
  onNavigateLogin?: () => void;
  language?: Language;
  emailAddress?: string;
}

export default function VerifyEmailPage({ onNavigateLogin, language = 'fr', emailAddress = '' }: VerifyEmailPageProps) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    setSentSuccess(false);

    try {
      // Simulate sending email verification link
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSentSuccess(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || "Impossible de renvoyer l'email.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      const event = new CustomEvent('floussi_navigate', { detail: 'login' });
      window.dispatchEvent(event);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans text-center">
        <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 animate-bounce">
          <Mail size={24} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {getTranslation('verifyEmailTitle', language)}
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            {getTranslation('verifyEmailSubtitle', language)} {emailAddress && <span className="text-emerald-600 font-bold">{emailAddress}</span>}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-bold leading-relaxed text-left">
            <ShieldAlert size={16} className="text-rose-600 inline-block mr-1.5 align-text-bottom" />
            <span>{error}</span>
          </div>
        )}

        {sentSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold leading-relaxed">
            <CheckCircle2 size={16} className="text-emerald-600 inline-block mr-1.5 align-text-bottom" />
            <span>Nouveau lien de vérification envoyé avec succès !</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-2 text-[11px] text-slate-500 font-medium leading-relaxed">
          <p className="font-bold text-slate-700">Pas encore reçu ?</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Vérifiez votre dossier de courriers indésirables (Spam).</li>
            <li>Assurez-vous que l'adresse saisie lors de l'inscription est correcte.</li>
            <li>Attendez quelques instants puis cliquez sur le bouton ci-dessous pour renvoyer le lien.</li>
          </ul>
        </div>

        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:pointer-events-none"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <span>
              {cooldown > 0 ? `Renvoyer le lien dans ${cooldown}s` : getTranslation('resendEmailButton', language)}
            </span>
          )}
        </button>

        <div>
          <button
            onClick={handleBackToLogin}
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
