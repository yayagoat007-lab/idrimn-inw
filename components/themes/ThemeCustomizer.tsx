import React, { useState } from 'react';
import { CustomThemeConfig, FloussiTheme } from '../../lib/themes';
import { Sliders, CheckCircle, Save, Sparkles, RefreshCw } from 'lucide-react';

interface ThemeCustomizerProps {
  currentTheme: FloussiTheme;
  initialConfig: CustomThemeConfig | null;
  onSave: (config: CustomThemeConfig) => void;
  isLocked: boolean;
  onUpgradeClick: () => void;
}

export function ThemeCustomizer({ currentTheme, initialConfig, onSave, isLocked, onUpgradeClick }: ThemeCustomizerProps) {
  const [primary, setPrimary] = useState(initialConfig?.primary || currentTheme.primary);
  const [secondary, setSecondary] = useState(initialConfig?.secondary || currentTheme.secondary);
  const [background, setBackground] = useState(initialConfig?.background || currentTheme.background);
  const [surface, setSurface] = useState(initialConfig?.surface || currentTheme.surface);
  const [text, setText] = useState(initialConfig?.text || currentTheme.text);
  const [accent, setAccent] = useState(initialConfig?.accent || currentTheme.accent);
  const [fontFamily, setFontFamily] = useState<CustomThemeConfig['fontFamily']>(initialConfig?.fontFamily || 'Inter');
  const [borderRadius, setBorderRadius] = useState<number>(initialConfig?.borderRadius ?? 12);
  const [density, setDensity] = useState<CustomThemeConfig['density']>(initialConfig?.density || 'comfortable');

  const handleApply = () => {
    if (isLocked) {
      onUpgradeClick();
      return;
    }
    onSave({
      primary,
      secondary,
      background,
      surface,
      text,
      accent,
      fontFamily,
      borderRadius,
      density
    });
  };

  const handleReset = () => {
    setPrimary(currentTheme.primary);
    setSecondary(currentTheme.secondary);
    setBackground(currentTheme.background);
    setSurface(currentTheme.surface);
    setText(currentTheme.text);
    setAccent(currentTheme.accent);
    setFontFamily('Inter');
    setBorderRadius(12);
    setDensity('comfortable');
  };

  return (
    <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs relative">
      {isLocked && (
        <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[1px] rounded-2xl z-20 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-800">Personnalisation Avancée Réservée</h4>
          <p className="text-[10px] text-slate-400 font-semibold max-w-xs mt-1 mb-3">
            Définissez vos propres codes hexadécimaux, arrondis et polices avec le forfait Floussi Elite.
          </p>
          <button
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] uppercase tracking-wide py-1.5 px-3 rounded-lg shadow-xs"
          >
            Passer à Elite
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
        <Sliders className="w-4 h-4 text-emerald-600" />
        <h4 className="text-xs font-black text-slate-800 tracking-tight">Studio Personnalisation Elite</h4>
      </div>

      <div className="space-y-4">
        {/* Colors Grid */}
        <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-500">
          <div>
            <label className="block mb-1">Couleur Primaire</label>
            <div className="flex gap-1.5">
              <input 
                type="color" 
                value={primary} 
                onChange={(e) => setPrimary(e.target.value)}
                className="w-6 h-6 border rounded-md cursor-pointer shrink-0" 
              />
              <input 
                type="text" 
                value={primary} 
                onChange={(e) => setPrimary(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold" 
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Accentuation</label>
            <div className="flex gap-1.5">
              <input 
                type="color" 
                value={accent} 
                onChange={(e) => setAccent(e.target.value)}
                className="w-6 h-6 border rounded-md cursor-pointer shrink-0" 
              />
              <input 
                type="text" 
                value={accent} 
                onChange={(e) => setAccent(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold" 
              />
            </div>
          </div>
        </div>

        {/* Fonts & Radius */}
        <div className="space-y-3 pt-2 border-t border-slate-50">
          <div className="text-[10px] font-bold text-slate-500">
            <label className="block mb-1">Style de Police</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="w-full border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-700 bg-white"
            >
              <option value="Inter">Inter (Moderne/Sans)</option>
              <option value="Amiri">Amiri (Traditionnel/Serif)</option>
              <option value="Tajawal">Tajawal (Arabe épuré)</option>
            </select>
          </div>

          <div className="text-[10px] font-bold text-slate-500">
            <div className="flex justify-between mb-1">
              <label>Arrondi des bordures</label>
              <span>{borderRadius}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="24" 
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
          </div>

          <div className="text-[10px] font-bold text-slate-500">
            <label className="block mb-1.5">Densité de l'interface</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  density === 'compact' 
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Compact (Étroit)
              </button>
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  density === 'comfortable' 
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                Confortable
              </button>
            </div>
          </div>
        </div>

        {/* Save / Reset */}
        <div className="flex gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] uppercase py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-xl transition-all flex items-center justify-center"
            title="Réinitialiser"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ThemeCustomizer;
