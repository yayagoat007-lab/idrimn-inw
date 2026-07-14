import React, { useState } from 'react';
import { X, Sparkles, Plus, Calendar, Coins } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'darija';
  onCreateGroup: (name: string, targetAmount: number, deadline: string, invitedMembers: string[]) => void;
}

export function CreateGroupModal({ isOpen, onClose, lang, onCreateGroup }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [invited, setInvited] = useState<string[]>([]);

  if (!isOpen) return null;

  const mockFriends = [
    { id: 'friend-1', name: 'Ahmed_Casa42', city: 'Casablanca' },
    { id: 'friend-2', name: 'Samira_Rabat', city: 'Rabat' },
    { id: 'friend-3', name: 'Youssef_Fassi', city: 'Fès' },
    { id: 'friend-4', name: 'Nadia_Marrakech', city: 'Marrakech' }
  ];

  const t = {
    title: lang === 'darija' ? 'Fe7el Group d l-Epargne' : 'Créer un groupe d\'épargne',
    nameLabel: lang === 'darija' ? 'Smiya d l-Group :' : 'Nom du projet / Groupe :',
    namePlaceholder: lang === 'darija' ? 'Ex: Krawel d l-Aïd 🐑' : 'Ex: Voyage d\'été 🏖️ ou Cadeau de Reda 🎁',
    targetLabel: lang === 'darija' ? 'Hadaf dyal l-flous (DH) :' : 'Objectif de la cagnotte (DH) :',
    deadlineLabel: lang === 'darija' ? 'Ajel (Date limite) :' : 'Date de fin / Échéance :',
    inviteLabel: lang === 'darija' ? '3red 3la s7abek (Inviter des amis) :' : 'Inviter des membres de la communauté (Optionnel) :',
    submit: lang === 'darija' ? 'Sabit l-Group' : 'Lancer le groupe',
    cancel: lang === 'darija' ? 'Ilgha2' : 'Annuler',
    errorAlert: lang === 'darija' ? '3emmer ga3 l-khanat.' : 'Veuillez renseigner tous les champs obligatoires.'
  };

  const handleToggleFriend = (friendName: string) => {
    if (invited.includes(friendName)) {
      setInvited(invited.filter(n => n !== friendName));
    } else {
      setInvited([...invited, friendName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(targetAmount);
    if (!name.trim() || isNaN(amt) || amt <= 0 || !deadline) {
      alert(t.errorAlert);
      return;
    }

    onCreateGroup(name, amt, deadline, invited);
    
    // reset
    setName('');
    setTargetAmount('');
    setDeadline('');
    setInvited([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="create-group-modal">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative">
        
        {/* Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer transition-all"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Coins size={16} />
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
            {t.title}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Group Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {t.nameLabel}
            </label>
            <input
              type="text"
              required
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Goal Amount & Date side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Target amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {t.targetLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[10px] text-slate-400 font-mono">DH</span>
                <input
                  type="number"
                  required
                  placeholder="Ex: 5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2.5 pl-9 pr-3 text-xs font-black text-slate-800 focus:outline-hidden transition-all font-mono"
                />
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {t.deadlineLabel}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-hidden transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Checklist of mock invites */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {t.inviteLabel}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
              {mockFriends.map((f) => {
                const isChecked = invited.includes(f.name);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleToggleFriend(f.name)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left border text-[10px] font-bold cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <span className="block font-black">@{f.name}</span>
                      <span className="text-[8px] text-slate-400 font-bold">{f.city}</span>
                    </div>
                    {isChecked && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
            >
              <Plus size={12} />
              <span>{t.submit}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
export default CreateGroupModal;
