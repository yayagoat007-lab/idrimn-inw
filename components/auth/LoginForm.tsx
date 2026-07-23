import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import { useLogin } from '../../hooks/use-auth';
import { loginSchema } from '../../lib/validators';
import { getTranslation, Language } from '../../lib/i18n';
import { SocialAuthButtons } from './SocialAuthButtons';

interface LoginFormProps {
  onLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateForgotPassword: () => void;
  onNavigateGuest?: () => void;
  language: Language;
}

export function LoginForm({
  onLogin,
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateGuest,
  language
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Client-side Rate Limiting State
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const { mutateAsync: loginMutate, isLoading, error: authError } = useLogin();

  // Handle rate limiting cooldown timer
  useEffect(() => {
    // Load initial cooldown from localStorage if any
    const storedCooldownStr = localStorage.getItem('floussi_login_cooldown');
    if (storedCooldownStr) {
      const storedTime = parseInt(storedCooldownStr, 10);
      const remaining = Math.ceil((storedTime - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
        setAttempts(5);
      } else {
        localStorage.removeItem('floussi_login_cooldown');
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem('floussi_login_cooldown');
          setAttempts(0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    // Check rate limit
    if (attempts >= 5) {
      const cooldownExpiry = Date.now() + 60 * 1000;
      localStorage.setItem('floussi_login_cooldown', cooldownExpiry.toString());
      setCooldown(60);
      return;
    }

    // Zod Validation
    const validation = loginSchema.safeParse({ email, password, rememberMe });
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(formattedErrors);
      setAttempts((prev) => prev + 1);
      return;
    }

    setValidationErrors({});

    try {
      await loginMutate({ email, password });
      
      // If remember me is checked, set cookie or flag
      if (rememberMe) {
        localStorage.setItem('floussi_remember_me', 'true');
        // Standard session persistence is already handled by Supabase, but we flag it
      } else {
        localStorage.removeItem('floussi_remember_me');
      }

      onLogin();
    } catch (err) {
      // Increment attempts on authentication failure
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= 5) {
          const cooldownExpiry = Date.now() + 60 * 1000;
          localStorage.setItem('floussi_login_cooldown', cooldownExpiry.toString());
          setCooldown(60);
        }
        return newAttempts;
      });
    }
  };

  const handleOAuthGoogle = () => {
    console.log('[OAuth Google] Redirection vers le fournisseur Google Auth...');
    onLogin(); // Simulate login success on mock
  };

  const handleOAuthApple = () => {
    console.log('[OAuth Apple] Redirection vers le fournisseur Apple Auth...');
    onLogin(); // Simulate login success on mock
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
          {getTranslation('loginTitle', language)}
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          {getTranslation('loginSubtitle', language)}
        </p>
      </div>

      {cooldown > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-relaxed">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <span>
            {getTranslation('rateLimitMessage', language).replace('{seconds}', cooldown.toString())}
          </span>
        </div>
      )}

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-relaxed">
          <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{authError.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
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
              disabled={isLoading || cooldown > 0}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: karim.alaoui@gmail.com"
              className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                validationErrors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
          </div>
          {validationErrors.email && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">
              {getTranslation('passwordLabel', language)} *
            </label>
            <button
              type="button"
              onClick={onNavigateForgotPassword}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              {getTranslation('forgotPasswordLink', language)}
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              disabled={isLoading || cooldown > 0}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border ${
                validationErrors.password ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.password}</p>
          )}
        </div>

        {/* Remember Me Option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              disabled={isLoading || cooldown > 0}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
              {getTranslation('rememberMeLabel', language)}
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || cooldown > 0}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>{language === 'darija' ? "Tahmil..." : "Chargement..."}</span>
            </>
          ) : (
            <>
              <span>{getTranslation('loginButton', language)}</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Guest Mode Demo */}
      {onNavigateGuest && (
        <button
          type="button"
          onClick={async () => {
            try {
              await loginMutate({ email: 'invite@floussi.ma', password: 'guestpassword' });
              onLogin();
            } catch (err) {
              onNavigateGuest();
            }
          }}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{getTranslation('guestModeButton', language)}</span>
        </button>
      )}

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-100"></div>
        <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          {language === 'darija' ? "wla kemel b" : "ou continuer avec"}
        </span>
        <div className="flex-grow border-t border-slate-100"></div>
      </div>

      {/* Social login buttons */}
      <SocialAuthButtons
        onGoogleAction={handleOAuthGoogle}
        onAppleAction={handleOAuthApple}
        language={language}
        actionType="login"
      />

      <div className="text-center pt-2">
        <p className="text-[11px] font-bold text-slate-400">
          {getTranslation('noAccountPrompt', language)}{' '}
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-emerald-600 hover:text-emerald-700 font-black hover:underline cursor-pointer"
          >
            {getTranslation('registerLink', language)}
          </button>
        </p>
      </div>
    </div>
  );
}
export default LoginForm;
