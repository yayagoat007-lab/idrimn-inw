import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Smartphone, MapPin, ArrowRight, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRegister } from '../../hooks/use-auth';
import { registerSchema } from '../../lib/validators';
import { getTranslation, Language } from '../../lib/i18n';
import { SocialAuthButtons } from './SocialAuthButtons';

interface RegisterFormProps {
  onRegister: () => void;
  onNavigateLogin: () => void;
  language: Language;
}

const MOROCCAN_CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Tétouan", "Oujda", 
  "Kenitra", "Safi", "El Jadida", "Beni Mellal", "Nador", "Khemisset", "Settat", 
  "Khouribga", "Larache", "Ksar El Kebir", "Guelmim", "Ouarzazate"
];

export function RegisterForm({
  onRegister,
  onNavigateLogin,
  language
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { mutateAsync: registerMutate, isLoading, error: authError } = useRegister();

  // Password strength logic
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('Inconnu');
  const [strengthColor, setStrengthColor] = useState('bg-slate-200');

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

    // Validate with register Zod schema
    const dataToValidate = {
      fullName,
      email,
      phone,
      city,
      password,
      confirmPassword,
      acceptTerms
    };

    const validation = registerSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(formattedErrors);
      return;
    }

    setValidationErrors({});

    try {
      await registerMutate(dataToValidate);
      onRegister();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOAuthGoogle = () => {
    console.log('[OAuth Google] Signup action...');
    // Mock auto fill details
    setFullName('Karim Alaoui');
    setEmail('karim.alaoui@gmail.com');
  };

  const handleOAuthApple = () => {
    console.log('[OAuth Apple] Signup action...');
    setFullName('Karim Alaoui');
    setEmail('karim.alaoui@gmail.com');
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none">
          {getTranslation('registerButton', language)}
        </h2>
        <p className="text-xs font-semibold text-slate-400">
          Rejoignez Floussi et suivez vos enveloppes de dépenses en DH
        </p>
      </div>

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-relaxed">
          <ShieldAlert size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{authError.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('fullNameLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User size={16} />
            </span>
            <input
              type="text"
              required
              disabled={isLoading}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Karim Alaoui"
              className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${
                validationErrors.fullName ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
          </div>
          {validationErrors.fullName && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.fullName}</p>
          )}
        </div>

        {/* Email */}
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
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: karim.alaoui@gmail.com"
              className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${
                validationErrors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
          </div>
          {validationErrors.email && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.email}</p>
          )}
        </div>

        {/* Phone */}
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
              disabled={isLoading}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: +212 612345678 ou 0612345678"
              className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${
                validationErrors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
          </div>
          {validationErrors.phone && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.phone}</p>
          )}
        </div>

        {/* City Select */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('cityLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin size={16} />
            </span>
            <select
              required
              disabled={isLoading}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${
                validationErrors.city ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 outline-hidden transition-all`}
            >
              <option value="" disabled>{getTranslation('cityPlaceholder', language)}</option>
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {validationErrors.city && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.city}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            {getTranslation('passwordLabel', language)} *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2 bg-slate-50 border ${
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
          
          {/* Password strength progress bar and metrics */}
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
                  {/[^A-Za-z0-9]/.test(password) ? "✓" : "•"} 1 Caractère spécial
                </li>
              </ul>
            </div>
          )}

          {validationErrors.password && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Confirmation du mot de passe *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock size={16} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2 bg-slate-50 border ${
                validationErrors.confirmPassword ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              } rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 outline-hidden transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Accept Terms Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              required
              disabled={isLoading}
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
              {getTranslation('acceptTermsLabel', language)}
            </span>
          </label>
          {validationErrors.acceptTerms && (
            <p className="text-[10px] text-rose-600 font-bold">{validationErrors.acceptTerms}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>S'enregistrer...</span>
            </>
          ) : (
            <>
              <span>{getTranslation('registerButton', language)}</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-100"></div>
        <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-wider">ou s'inscrire avec</span>
        <div className="flex-grow border-t border-slate-100"></div>
      </div>

      <SocialAuthButtons
        onGoogleAction={handleOAuthGoogle}
        onAppleAction={handleOAuthApple}
        language={language}
        actionType="register"
      />

      <div className="text-center pt-2">
        <p className="text-[11px] font-bold text-slate-400">
          {getTranslation('hasAccountPrompt', language)}{' '}
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-emerald-600 hover:text-emerald-700 font-black hover:underline cursor-pointer"
          >
            {getTranslation('loginLink', language)}
          </button>
        </p>
      </div>
    </div>
  );
}
export default RegisterForm;
