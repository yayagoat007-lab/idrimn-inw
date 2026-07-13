"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, RefreshCw, ShieldAlert } from 'lucide-react';
import { getTranslation, Language } from '../../../lib/i18n';
import AuthLayout from '../layout';

interface ResetPasswordPageProps {
  onNavigateLogin?: () => void;
  language?: Language;
}

export default function ResetPasswordPage({ onNavigateLogin, language = 'fr' }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('Inconnu');
  const [strengthColor, setStrengthColor] = useState('bg-slate-200');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);

    if (password.length === 0) {
      setStrengthLabel('Inconnu');
      setStrengthColor('bg-slate-200');
    } else if (score <= 1) {
      setStrengthLabel('Faible 🔴');
      setStrengthColor('bg-rose-500');
    } else if (score === 2) {
      setStrengthLabel('Moyen 🟠');
      setStrengthColor('bg-amber-500');
    } else if (score === 3) {
      setStrengthLabel('Bon 🟡');
      setStrengthColor('bg-yellow-500');
    } else if (score === 4) {
      setStrengthLabel('Excellent 🟢');
      setStrengthColor('bg-emerald-500');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Le mot de passe ne respecte pas les critères de sécurité.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      // Simulate Supabase password update
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSuccess(true);
      setTimeout(() => {
        // Redirect
        if (onNavigateLogin) {
          onNavigateLogin();
        } else {
          const event = new CustomEvent('floussi_navigate', { detail: 'login' });
          window.dispatchEvent(event);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 font-sans">
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
            {getTranslation('resetPasswordTitle', language)}
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            {getTranslation('resetPasswordSubtitle', language)}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed">
            <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-emerald-950">Succès !</h3>
            <p className="text-xs text-emerald-800 font-medium">
              Votre mot de passe a été modifié. Redirection vers la page de connexion...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400">Force : {strengthLabel}</span>
                    <span className="text-slate-400">{password.length} caractères</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strengthColor} transition-all duration-300`} 
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <ul className="text-[9px] text-slate-400 font-medium grid grid-cols-2 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                    <li className={password.length >= 8 ? "text-emerald-600 flex items-center gap-1 font-bold" : "flex items-center gap-1"}>
                      {password.length >= 8 ? "✓" : "•"} Min. 8 caractères
                    </li>
                    <li className={/[A-Z]/.test(password) ? "text-emerald-600 flex items-center gap-1 font-bold" : "flex items-center gap-1"}>
                      {/[A-Z]/.test(password) ? "✓" : "•"} 1 Majuscule
                    </li>
                    <li className={/[0-9]/.test(password) ? "text-emerald-600 flex items-center gap-1 font-bold" : "flex items-center gap-1"}>
                      {/[0-9]/.test(password) ? "✓" : "•"} 1 Chiffre
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-600 flex items-center gap-1 font-bold" : "flex items-center gap-1"}>
                      {/[^A-Za-z0-9]/.test(password) ? "✓" : "•"} 1 Spécial
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>{getTranslation('saveNewPasswordButton', language)}</span>}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
