import React, { useState } from 'react';
import { useGoals } from '../../hooks/use-goals';
import { useAuth } from '../../hooks/use-auth';
import { X, Sparkles, Lightbulb, HelpCircle, Send } from 'lucide-react';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'darija';
  onCreatePost: (content: string, type: 'achievement' | 'tip' | 'question', relatedGoalName?: string) => void;
}

export function CreatePostModal({ isOpen, onClose, lang, onCreatePost }: CreatePostModalProps) {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";
  const { goals } = useGoals(userId);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'tip' | 'question'>('tip');
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  const t = {
    title: lang === 'darija' ? 'Kteb Post Jdid' : 'Créer une publication',
    placeholderTip: lang === 'darija' ? 'Share chi astuce d l-budget dyalk... Ex: Kifash n-n9ss f fatoura d l-ma' : 'Partagez une astuce budgétaire... Ex: Comment économiser sur les courses avec l\'OCR Floussi',
    placeholderQuestion: lang === 'darija' ? 'Sowl l-comunauté Floussi chi so2al...' : 'Posez une question d\'entraide financière à la communauté Floussi...',
    typeLabel: lang === 'darija' ? 'No3 d l-post :' : 'Type de publication :',
    tip: lang === 'darija' ? 'Fikra (Astuce)' : 'Astuce Budget',
    question: lang === 'darija' ? 'So2al (Question)' : 'Question / Entraide',
    goalLabel: lang === 'darija' ? 'Hadaf dyalk d l-epargne (Facultatif) :' : 'Lier à l\'un de vos objectifs d\'épargne (Optionnel) :',
    selectGoal: lang === 'darija' ? '-- Khtar Hadaf --' : '-- Choisir un objectif --',
    publish: lang === 'darija' ? 'Nashr (Publier)' : 'Publier',
    cancel: lang === 'darija' ? 'Ilgha2 (Annuler)' : 'Annuler',
    emptyAlert: lang === 'darija' ? 'Kteb chi haja f l-post d l-owl.' : 'Veuillez rédiger le contenu de votre message avant de publier.'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert(t.emptyAlert);
      return;
    }

    const linkedGoal = goals.find(g => g.id === selectedGoalId);
    onCreatePost(content, type, linkedGoal?.name);
    
    // reset form
    setContent('');
    setSelectedGoalId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="create-post-modal">
      <div ref={modalRef} className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Fermer la publication / إغلاق المنشور"
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer transition-all"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles size={16} />
          </div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
            {t.title}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Post Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              {t.typeLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('tip')}
                className={`flex items-center justify-center gap-1.5 p-3 border text-xs font-black rounded-2xl cursor-pointer transition-all ${
                  type === 'tip'
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lightbulb size={14} className={type === 'tip' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>{t.tip}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('question')}
                className={`flex items-center justify-center gap-1.5 p-3 border text-xs font-black rounded-2xl cursor-pointer transition-all ${
                  type === 'question'
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HelpCircle size={14} className={type === 'question' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>{t.question}</span>
              </button>
            </div>
          </div>

          {/* Goal Link Dropdown */}
          {goals.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {t.goalLabel}
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="">{t.selectGoal}</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.current_amount}/{g.target_amount} DH)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content TextArea */}
          <div className="space-y-1.5">
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={type === 'tip' ? t.placeholderTip : t.placeholderQuestion}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl p-4 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400/80 resize-none leading-relaxed"
            />
          </div>

          {/* Action Row */}
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
              disabled={!content.trim()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer shadow-md shadow-emerald-100 flex items-center gap-1.5 transition-all"
            >
              <Send size={12} />
              <span>{t.publish}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
export default CreatePostModal;
