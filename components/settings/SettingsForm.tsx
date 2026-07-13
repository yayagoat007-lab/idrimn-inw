import React, { useState } from 'react';
import { MOROCCAN_CITIES } from '../../lib/constants';
import { Camera, Save } from 'lucide-react';

interface SettingsFormProps {
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    avatarUrl: string | null;
  };
  onSave: (data: any) => void;
}

export function SettingsForm({ initialData, onSave }: SettingsFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      onSave(formData);
      setSaving(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
        <div className="relative w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-800 text-lg shadow-inner overflow-hidden">
          {formData.avatarUrl ? (
            <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            formData.fullName.charAt(0)
          )}
          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white">
            <Camera size={14} />
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900">Photo de profil</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Glissez une photo ou cliquez pour uploader</p>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Ville de résidence</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
          >
            {MOROCCAN_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email (Non modifiable)</label>
          <input
            type="email"
            disabled
            value={formData.email}
            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-250 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">N° de téléphone (WhatsApp)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
      >
        <Save size={14} />
        <span>{saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
      </button>
    </form>
  );
}
export default SettingsForm;
