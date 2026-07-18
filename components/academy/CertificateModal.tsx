import React, { useRef, useState, useEffect } from 'react';
import { CompletionCertificate } from '../../lib/academy-progress';
import { X, Download, Share2, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useFocusTrap } from '../../hooks/use-focus-trap';

interface CertificateModalProps {
  certificate: CompletionCertificate;
  onClose: () => void;
  language: 'fr' | 'darija';
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
  language
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen: true, onClose });

  useEffect(() => {
    // Generate the certificate image on canvas
    const drawCertificate = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set dimensions (1200x800 for high resolution landscape ratio)
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Draw elegant delicate cream/parchment background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1200, 800);
        bgGrad.addColorStop(0, '#FCFBF7');
        bgGrad.addColorStop(0.5, '#FFFFFF');
        bgGrad.addColorStop(1, '#F5F3E9');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);

        // 2. Draw sophisticated Moroccan-inspired geometric double frame
        const p1 = 40; // outer padding
        const p2 = 55; // inner padding
        
        // Outer thin border
        ctx.strokeStyle = '#047857'; // emerald-700
        ctx.lineWidth = 2;
        ctx.strokeRect(p1, p1, 1200 - p1 * 2, 800 - p1 * 2);

        // Inner thicker border
        ctx.strokeStyle = '#065F46'; // emerald-800
        ctx.lineWidth = 5;
        ctx.strokeRect(p2, p2, 1200 - p2 * 2, 800 - p2 * 2);

        // Draw Moroccan star accents in the four corners
        const drawMoroccanCornerStar = (cx: number, cy: number, size: number) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.strokeStyle = '#D97706'; // amber-650
          ctx.lineWidth = 3;
          ctx.fillStyle = '#FEF3C7'; // amber-100
          
          // First square
          ctx.beginPath();
          ctx.rect(-size/2, -size/2, size, size);
          ctx.stroke();
          ctx.fill();

          // Second square rotated 45deg
          ctx.beginPath();
          ctx.rotate(Math.PI / 4);
          ctx.rect(-size/2, -size/2, size, size);
          ctx.stroke();
          ctx.fill();

          // Small central circle
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#D97706';
          ctx.fill();

          ctx.restore();
        };

        // Draw in all 4 corners
        drawMoroccanCornerStar(p2, p2, 40);
        drawMoroccanCornerStar(1200 - p2, p2, 40);
        drawMoroccanCornerStar(p2, 800 - p2, 40);
        drawMoroccanCornerStar(1200 - p2, 800 - p2, 40);

        // 3. Elegant Arabic / Moroccan theme header background elements
        ctx.beginPath();
        ctx.arc(600, 0, 200, 0, Math.PI);
        ctx.fillStyle = 'rgba(4, 120, 87, 0.04)'; // 4% emerald opacity
        ctx.fill();

        // 4. Header: Floussi Branding
        ctx.fillStyle = '#065F46';
        ctx.font = 'black 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨  ACADÉMIE FLOUSSI  ✨', 600, 110);

        ctx.fillStyle = '#6B7280';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('FINANCE PERSONNELLE & IDDIKHAR', 600, 145);

        // 5. Main Title: CERTIFICAT DE RÉUSSITE
        ctx.fillStyle = '#D97706'; // amber-600
        ctx.font = 'black 48px sans-serif';
        ctx.fillText('CERTIFICAT DE RÉUSSITE', 600, 215);

        // Arabic version of the title
        ctx.fillStyle = '#0F172A';
        ctx.font = '800 24px sans-serif';
        ctx.fillText('شهادة إتمام الكفاءة المالية', 600, 265);

        // 6. Presentation text
        ctx.fillStyle = '#475569'; // slate-600
        ctx.font = 'italic 16px sans-serif';
        ctx.fillText('Ce diplôme d\'honneur est fièrement décerné à :', 600, 325);

        // User Name (Stunning, large, capitalized, high-contrast)
        ctx.fillStyle = '#0F172A'; // deep slate
        ctx.font = 'black 38px sans-serif';
        ctx.fillText(certificate.userName.toUpperCase(), 600, 385);

        // Divider
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(400, 420);
        ctx.lineTo(800, 420);
        ctx.stroke();

        // 7. Achievement statement
        ctx.fillStyle = '#475569';
        ctx.font = '16px sans-serif';
        ctx.fillText('Pour avoir complété avec brio et validé l\'ensemble des modules de formation de :', 600, 455);

        // Module Name
        ctx.fillStyle = '#047857'; // emerald-700
        ctx.font = 'black 28px sans-serif';
        ctx.fillText(`« ${certificate.moduleTitle.toUpperCase()} »`, 600, 505);

        ctx.fillStyle = '#64748B';
        ctx.font = '600 14px sans-serif';
        ctx.fillText('Démontrant ainsi sa rigueur et sa maîtrise des concepts fondamentaux de l\'éducation financière marocaine.', 600, 545);

        // 8. Bottom Seal and Signatures
        const sealY = 660;

        // Left Side: Date
        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('DATE DE DÉLIVRANCE', 180, sealY - 15);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(certificate.completedAt, 180, sealY + 15);

        // Right Side: Secure Verification Code
        ctx.textAlign = 'right';
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('CODE DE VÉRIFICATION', 1020, sealY - 15);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(certificate.validationCode, 1020, sealY + 15);

        // Center: Gold Seal of Floussi
        ctx.save();
        ctx.translate(600, sealY);
        ctx.textAlign = 'center';

        // Outer star seal shape (drawn simply with rotated boxes)
        ctx.fillStyle = '#F59E0B'; // amber-500
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 8);
          ctx.fillRect(-35, -35, 70, 70);
        }

        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#FEF3C7'; // light amber-100
        ctx.fill();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('🎓', 0, 0);

        ctx.restore();

        // Save canvas as base64 URL
        const dataUrl = canvas.toDataURL('image/png');
        setImageUrl(dataUrl);
        setIsGenerating(false);

      } catch (err) {
        console.error("Error drawing certificate canvas", err);
        setIsGenerating(false);
      }
    };

    drawCertificate();
  }, [certificate]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.download = `Floussi_Certificat_${certificate.moduleId}.png`;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        id={`certificate-modal-${certificate.moduleId}`}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-800 text-sm md:text-base">
              {language === 'darija' ? 'Chahadat d-kamal' : 'Certificat Officiel de Réussite'}
            </h3>
          </div>
          <button 
            id="close-certificate-modal"
            onClick={onClose}
            aria-label="Fermer le certificat / إغلاق الشهادة"
            className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Body) */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Certificate Canvas Frame */}
          <div className="w-full max-w-2xl border-4 border-double border-amber-200 rounded-2xl shadow-md bg-stone-50 overflow-hidden relative">
            {isGenerating ? (
              <div className="aspect-[3/2] flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                <span className="text-sm font-bold">Génération du diplôme...</span>
              </div>
            ) : (
              imageUrl && (
                <img 
                  src={imageUrl} 
                  alt="Floussi Academy Certificate" 
                  className="w-full h-auto object-contain block"
                  referrerPolicy="no-referrer"
                />
              )
            )}
            
            {/* Hidden Canvas used only for drawing */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Validation Info card */}
          <div className="mt-6 w-full max-w-xl p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-800 font-black flex items-center gap-1">
                {language === 'darija' ? 'Chahada mo3tamada' : 'Certificat vérifié et sécurisé'}
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
              </p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Ce diplôme d\'honneur atteste de ton assiduité financière. Il comporte un code unique de contrôle (<strong>{certificate.validationCode}</strong>). Tu peux le télécharger et le partager directement sur tes réseaux professionnels.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3">
          <span className="text-xs text-slate-400 text-center sm:text-left mb-2 sm:mb-0">
            {language === 'darija' ? 'N-tazzem m3a Floussi f l-mostaqbal !' : 'Continue à bâtir ta discipline financière avec Floussi !'}
          </span>
          <button
            id="download-certificate-btn"
            onClick={handleDownload}
            disabled={!imageUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/10 active:scale-95"
          >
            <Download className="w-4 h-4" />
            {language === 'darija' ? 'T-charger chahada' : 'Télécharger le certificat'}
          </button>
        </div>
      </div>
    </div>
  );
};
