import React, { useState, useEffect } from 'react';
import { generateAchievementStoryImage } from '../../lib/story-generator';
import { X, Download, Share2, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { Language } from '../../lib/i18n';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalName: string;
  targetAmount: number;
  themeId?: string;
  language: Language;
}

export function StoryShareModal({
  isOpen,
  onClose,
  goalName,
  targetAmount,
  themeId = 'default',
  language
}: StoryShareModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [shared, setShared] = useState(false);

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });
  const isDarija = language === 'darija';

  const t = {
    title: isDarija ? 'Share d Story dyalk ! 🤳' : 'Partager ma Story 🤳',
    subtitle: isDarija ? 'Fe7er b l-enjaz dyalk f Instagram, WhatsApp, or Facebook' : 'Célébrez votre discipline budgétaire avec vos amis sur vos réseaux favoris !',
    download: isDarija ? 'Telecharger d d-Dar' : 'Télécharger l\'image',
    shareMobile: isDarija ? 'Partager direct' : 'Partager la Story',
    successMsg: isDarija ? 'Story t-downloadat m3a l-khir!' : 'Story prête pour le partage !',
    generating: isDarija ? 'Kancheklo l-Story d l-batal...' : 'Génération de votre visuel Story...'
  };

  // Generate the high-res canvas image whenever the goal details change
  useEffect(() => {
    if (!isOpen) return;
    setGenerating(true);
    setImageUrl(null);
    setShared(false);

    generateAchievementStoryImage(goalName, targetAmount, '12 mois', themeId)
      .then((url) => {
        setImageUrl(url);
        setGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate story image:', err);
        setGenerating(false);
      });
  }, [isOpen, goalName, targetAmount, themeId]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!imageUrl) return;

    // Convert data URL to blob & share if supported
    try {
      if (navigator.share) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'floussi_story.png', { type: 'image/png' });

        await navigator.share({
          files: [file],
          title: `Objectif atteint sur Floussi : ${goalName}`,
          text: `Mabrouk ! J'ai atteint mon objectif d'épargne de ${targetAmount} DH sur Floussi !`
        });
        setShared(true);
      } else {
        // Fallback: Trigger standard download
        handleDownload();
      }
    } catch (e) {
      console.log('Sharing failed or cancelled:', e);
      // Fallback: Just download
      handleDownload();
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `Floussi_Story_${goalName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setShared(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-55 animate-fadeIn" id="story-share-modal">
      <div ref={modalRef} className="bg-slate-900 text-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center">
        
        {/* Close */}
        <button 
          onClick={onClose}
          aria-label="Fermer le partage de Story / إغلاق مشاركة القصة"
          className="absolute top-4 right-4 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-5 w-full">
          <span className="text-[9px] uppercase font-black text-emerald-400 tracking-widest flex items-center justify-center gap-1">
            <Sparkles size={11} className="animate-spin" />
            <span>Success Story Template</span>
          </span>
          <h2 className="text-base font-black tracking-tight uppercase mt-1">
            {t.title}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1 px-4">
            {t.subtitle}
          </p>
        </div>

        {/* Story Preview Container */}
        <div className="w-full aspect-[9/16] max-h-[380px] bg-slate-950 rounded-2xl border border-slate-800/80 shadow-inner flex items-center justify-center overflow-hidden relative">
          {generating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-emerald-500 animate-spin" size={28} />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.generating}</span>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Story Achievement Card" 
              className="w-full h-full object-contain select-none shadow-md animate-scaleIn"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs text-rose-500 font-black">Erreur de chargement.</span>
          )}
        </div>

        {/* Status Messages */}
        {shared && (
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase">
            <CheckCircle2 size={12} className="animate-bounce" />
            <span>{t.successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={generating || !imageUrl}
            className="flex items-center justify-center gap-1.5 py-3 border border-slate-700 hover:border-slate-600 bg-slate-850 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95"
          >
            <Download size={13} />
            <span>{t.download}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            disabled={generating || !imageUrl}
            className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
          >
            <Share2 size={13} />
            <span>{t.shareMobile}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
export default StoryShareModal;
