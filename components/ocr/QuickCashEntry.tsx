import React, { useState } from 'react';
import { 
  ShoppingBag, Car, ShoppingCart, DollarSign, Navigation, 
  Mic, MicOff, Camera, Check, RefreshCw, Layers, PlusCircle, Volume2
} from 'lucide-react';
import { useQuickCashEntry, QuickCashMode } from '../../hooks/use-quick-cash-entry';
import { compressImage } from '../../lib/image-compression';
import { formatCurrency } from '../../lib/utils';

interface QuickCashEntryProps {
  onClose: () => void;
  lang: 'fr' | 'darija';
}

export function QuickCashEntry({ onClose, lang }: QuickCashEntryProps) {
  const {
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
    submitCashEntry,
    estimateTaxiFare,
    voiceSupported,
    isListening,
    voiceTranscript,
    startVoiceInput
  } = useQuickCashEntry();

  const [saving, setSaving] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<number>(5);

  // Compress photo if selected
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBlob = await compressImage(file, 200); // compress to 200KB max
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    } catch (err) {
      console.error("[QuickCashEntry] Photo compression failed:", err);
    }
  };

  const handleTaxiDistanceChange = (km: number) => {
    setSelectedDistance(km);
    const estimation = estimateTaxiFare(km);
    setAmount(estimation.rate);
    const timeLabel = estimation.isNight ? 'Nuit' : 'Jour';
    setDescription(`Course Petit Taxi (~${km}km, Tarif ${timeLabel})`);
  };

  // Hanout specific: Quick Coin additions
  const handleAddHanoutChip = (value: number) => {
    setAmount(prev => prev + value);
  };

  const handleClearAmount = () => {
    setAmount(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert(lang === 'darija' ? "S'il vous plaît dakhal montant s'hih kbar m 0 DH." : "Veuillez saisir un montant supérieur à 0 DH.");
      return;
    }

    setSaving(true);
    const success = await submitCashEntry();
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xl max-w-md w-full font-sans text-xs">
      
      {/* Mode selectors */}
      <div className="space-y-1.5 mb-5">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {lang === 'darija' ? "Fin khsserti l-kash ?" : "Mode de saisie cash express"}
        </label>
        
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setMode('souk')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              mode === 'souk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-bold">Souk</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('taxi')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              mode === 'taxi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4 text-amber-500" />
            <span className="text-[9px] font-bold">Taxi</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hanout')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              mode === 'hanout' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-indigo-500" />
            <span className="text-[9px] font-bold">Hanout</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('other')}
            className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              mode === 'other' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-rose-500" />
            <span className="text-[9px] font-bold">Autre</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Render Form based on Mode */}

        {/* Mode 1: Souk */}
        {mode === 'souk' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Montant Global (DH)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-base font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-3.5 font-bold text-slate-400">DH</span>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Note / Achats Souk</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex. Khodra, deghra, bssla..."
              />
            </div>

            {/* Photo illustration (optional, compressed) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Photo Souk (Optionnelle)</label>
              {photoUrl ? (
                <div className="relative w-full h-24 rounded-2xl overflow-hidden border border-slate-200">
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Souk bill" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(null)}
                    className="absolute top-1.5 right-1.5 bg-slate-900/80 hover:bg-slate-900 text-white p-1 rounded-lg text-[9px] font-bold"
                  >
                    Effacer
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer relative transition-all bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="space-y-1 flex flex-col items-center justify-center">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="font-bold text-slate-700 text-[10px]">Photo Souk / Panier</span>
                    <span className="text-[8px] text-slate-400 font-medium">Capture directe compressée</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Taxi */}
        {mode === 'taxi' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Distance Selector (HCP & Transport rates based) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estimer la distance</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => handleTaxiDistanceChange(km)}
                    className={`py-2 border rounded-xl font-bold cursor-pointer transition-all ${
                      selectedDistance === km 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time calculated fare display */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center">
              <div>
                <p className="font-extrabold text-slate-800 text-[11px]">Tarif suggéré</p>
                <p className="text-[9px] text-slate-500 font-bold font-mono">
                  {estimateTaxiFare(selectedDistance).breakdown}
                </p>
              </div>
              <span className="font-mono text-base font-black text-amber-700">
                {amount} DH
              </span>
            </div>

            {/* Custom Amount override */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ajuster le montant réel (DH)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl text-sm font-bold text-slate-800 focus:outline-hidden font-mono"
                />
                <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-400">DH</span>
              </div>
            </div>

            {/* Optional Geolocation validation (to match horodatage) */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <p className="font-extrabold text-slate-800 text-[11px]">Enregistrer la position ?</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  {location ? `Taggé : ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Horodatage contextuel"}
                </p>
              </div>
              <button
                type="button"
                onClick={requestLocation}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  location ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mode 3: Hanout (Moul Hanout quick micro-buys) */}
        {mode === 'hanout' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick coin chips */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pièces rapides cumulables</label>
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="text-[9px] font-bold uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded"
                >
                  Effacer
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[3, 5, 10, 20, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddHanoutChip(val)}
                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 rounded-xl font-mono font-black text-xs flex flex-col items-center justify-center cursor-pointer shadow-2xs hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>+{val}</span>
                    <span className="text-[8px] uppercase tracking-wide opacity-70">DH</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Total display */}
            <div className="p-3 bg-indigo-900/10 border border-indigo-200/40 rounded-2xl flex justify-between items-center font-mono">
              <span className="text-[10px] font-black uppercase text-indigo-950">Total Hanout</span>
              <span className="text-sm font-black text-indigo-800">
                {amount} DH
              </span>
            </div>

            {/* Voice Dictation (using client-side Web Speech API if supported) */}
            {voiceSupported && (
              <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase font-black text-indigo-600 tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    Saisie Vocale Sidi Floussi
                  </span>
                  <button
                    type="button"
                    onClick={startVoiceInput}
                    className={`p-2 rounded-xl shadow-xs transition-all cursor-pointer ${
                      isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
                
                <p className="text-[10px] leading-relaxed text-indigo-900/80">
                  {isListening 
                    ? "Sidi Floussi écoute... (Dites par ex: 'quinze dirhams pain')" 
                    : voiceTranscript 
                      ? `Compris : "${voiceTranscript}"`
                      : "Cliquez sur le micro pour dicter vos achats du hanout."}
                </p>
              </div>
            )}

            {/* Manual note */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Détail des achats</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                placeholder="Ex: Pain, sidi ali, biscuit"
              />
            </div>
          </div>
        )}

        {/* Mode 4: Other generic cash entry */}
        {mode === 'other' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Montant (DH)</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-150 rounded-2xl text-base font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-3.5 font-bold text-slate-400">DH</span>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Libellé</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                placeholder="Description du paiement cash..."
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-2xl font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="alimentation">{lang === 'darija' ? 'Makla' : 'Alimentation'}</option>
                <option value="transport">{lang === 'darija' ? 'Transport' : 'Transport'}</option>
                <option value="hygiene">{lang === 'darija' ? 'Hygiène' : 'Hygiène'}</option>
                <option value="logement">{lang === 'darija' ? 'Logement' : 'Maison / Logement'}</option>
                <option value="telecom">{lang === 'darija' ? 'Télécom' : 'Télécom'}</option>
                <option value="loisirs">{lang === 'darija' ? 'Loisirs' : 'Loisirs / Resto'}</option>
                <option value="education">{lang === 'darija' ? 'Éducation' : 'Éducation'}</option>
                <option value="autres">{lang === 'darija' ? 'Autre' : 'Autre'}</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            {lang === 'darija' ? 'Ghi rj3' : 'Annuler'}
          </button>
          
          <button
            type="submit"
            disabled={saving || amount <= 0}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>{lang === 'darija' ? 'Kytssejel...' : 'Enregistrement...'}</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>{lang === 'darija' ? 'Sejjel' : 'Valider'}</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
