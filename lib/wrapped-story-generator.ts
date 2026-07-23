import { WrappedStats } from './wrapped-stats';
import { FLOUSSI_THEMES } from './themes';

/**
 * Draws a mock QR code on the canvas for Slide 7
 */
function drawMockQRCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, darkColor: string, lightColor: string) {
  // White background card for QR
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 20, y - 20, size + 40, size + 40, 24);
  ctx.fill();

  // QR outer frame
  ctx.fillStyle = darkColor;

  // 1. Top-Left Position detection pattern
  drawQRAnchor(ctx, x, y, 60, darkColor);

  // 2. Top-Right Position detection pattern
  drawQRAnchor(ctx, x + size - 60, y, 60, darkColor);

  // 3. Bottom-Left Position detection pattern
  drawQRAnchor(ctx, x, y + size - 60, 60, darkColor);

  // 4. Fill random noise modules (QR pixels)
  const modules = 21; // 21x21 grid
  const moduleSize = size / modules;

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      // Skip the anchors
      if (
        (row < 7 && col < 7) ||
        (row < 7 && col >= modules - 7) ||
        (row >= modules - 7 && col < 7)
      ) {
        continue;
      }

      // Pseudo-random but consistent pattern based on row/col formulas
      const isBlack = ((row * 3 + col * 7) % 5 === 0) || ((row + col) % 3 === 0 && (row * col) % 2 === 0);
      if (isBlack) {
        ctx.fillStyle = darkColor;
        ctx.fillRect(
          x + col * moduleSize,
          y + row * moduleSize,
          moduleSize + 0.5,
          moduleSize + 0.5
        );
      }
    }
  }
}

function drawQRAnchor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x + size / 7, y + size / 7, size - (size / 7) * 2, size - (size / 7) * 2);
  ctx.fillStyle = color;
  ctx.fillRect(x + (size / 7) * 2, y + (size / 7) * 2, size - (size / 7) * 4, size - (size / 7) * 4);
}

/**
 * Generates an array of Base64 image strings (each 1080x1920) corresponding to the slides
 */
export function generateWrappedStoryImages(
  stats: WrappedStats,
  themeId: string,
  language: 'fr' | 'darija'
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      const activeTheme = FLOUSSI_THEMES.find(t => t.id === themeId) || FLOUSSI_THEMES[0];
      const slides: string[] = [];

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      const totalSlides = 7;

      const runSlideGeneration = async () => {
        for (let sIdx = 1; sIdx <= totalSlides; sIdx++) {
          // Clear canvas
          ctx.clearRect(0, 0, 1080, 1920);

          // 1. Base Gradient
          const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
          bgGrad.addColorStop(0, activeTheme.background || '#FAF9F6');
          bgGrad.addColorStop(0.4, '#FFFFFF');
          bgGrad.addColorStop(1, activeTheme.surface || '#E2E8F0');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 1080, 1920);

          // Ambient glowing spots
          ctx.beginPath();
          ctx.arc(1080, 300, 500, 0, Math.PI * 2);
          ctx.fillStyle = `${activeTheme.primary}12`; // 7% opacity
          ctx.fill();

          ctx.beginPath();
          ctx.arc(0, 1600, 700, 0, Math.PI * 2);
          ctx.fillStyle = `${activeTheme.secondary}12`;
          ctx.fill();

          // Elegant framing
          const padding = 50;
          ctx.strokeStyle = `${activeTheme.primary}33`; // 20% opacity
          ctx.lineWidth = 4;
          ctx.strokeRect(padding, padding, 1080 - padding * 2, 1920 - padding * 2);

          // Header Branding (consistent on all slides except intro)
          if (sIdx > 1) {
            ctx.fillStyle = activeTheme.primary;
            ctx.font = 'black 42px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨  FLOUSSI WRAPPED  ✨', 1080 / 2, 140);
          }

          // Render specific slide content
          switch (sIdx) {
            case 1: // Intro Slide
              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 64px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('FLOUSSI', 1080 / 2, 450);

              ctx.fillStyle = '#1E293B';
              ctx.font = 'black 84px sans-serif';
              const yrText = language === 'fr' ? `Mon Année ${stats.year}` : `3am ${stats.year} Dyali`;
              ctx.fillText(yrText.toUpperCase(), 1080 / 2, 560);

              // Large central medal or illustration
              ctx.fillStyle = '#F59E0B';
              ctx.beginPath();
              ctx.arc(1080 / 2, 950, 180, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#FFFFFF';
              ctx.font = '160px sans-serif';
              ctx.fillText('🎊', 1080 / 2, 960);

              // Amount Epargné
              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 36px sans-serif';
              const savedLbl = language === 'fr' ? 'Épargne totale accumulée' : 'L-majmo3 d l-flouss li khbiti';
              ctx.fillText(savedLbl.toUpperCase(), 1080 / 2, 1260);

              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 120px sans-serif';
              ctx.fillText(`${stats.totalSaved.toLocaleString('fr-FR')} DH`, 1080 / 2, 1390);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 48px sans-serif';
              const congrats = language === 'fr' ? 'BRAVO POUR CET EFFORT !' : 'TBARKELLAH 3LIK !';
              ctx.fillText(congrats, 1080 / 2, 1560);
              break;

            case 2: // Best & Worst Month
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 64px sans-serif';
              const highlightsTitle = language === 'fr' ? 'Mes Temps Forts' : 'L-aw9at l-9wiya dyali';
              ctx.fillText(highlightsTitle, 1080 / 2, 350);

              // Best month card
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(120, 480, 840, 480, 36);
              ctx.fill();
              ctx.strokeStyle = `${activeTheme.primary}1A`;
              ctx.stroke();

              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 44px sans-serif';
              const bestTitle = language === 'fr' ? '🏆 MEILLEUR MOIS' : '🏆 7SEN CHHAR';
              ctx.fillText(bestTitle, 1080 / 2, 560);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 84px sans-serif';
              ctx.fillText(stats.bestMonth.month.toUpperCase(), 1080 / 2, 680);

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 34px sans-serif';
              const savedSumText = language === 'fr' ? 'Record d\'épargne nette :' : 'Ikhray d l-iddikhar :';
              ctx.fillText(savedSumText, 1080 / 2, 770);

              ctx.fillStyle = '#10B981';
              ctx.font = 'black 54px sans-serif';
              ctx.fillText(`+${stats.bestMonth.savedAmount.toLocaleString('fr-FR')} DH`, 1080 / 2, 850);

              // Worst month card
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(120, 1020, 840, 480, 36);
              ctx.fill();
              ctx.strokeStyle = '#EF44441A';
              ctx.stroke();

              ctx.fillStyle = '#EF4444';
              ctx.font = 'black 44px sans-serif';
              const worstTitle = language === 'fr' ? '⚠️ DERAPAGE DU MASROUF' : '⚠️ ALERTE L-MASROUF';
              ctx.fillText(worstTitle, 1080 / 2, 1100);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 84px sans-serif';
              ctx.fillText(stats.worstMonth.month.toUpperCase(), 1080 / 2, 1220);

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 34px sans-serif';
              const overspentText = language === 'fr' ? 'Dépassement notable sur :' : 'R-khef d s-srf bzaf f :';
              ctx.fillText(overspentText, 1080 / 2, 1310);

              ctx.fillStyle = '#EF4444';
              ctx.font = 'black 54px sans-serif';
              ctx.fillText(stats.worstMonth.overspentBucket, 1080 / 2, 1390);
              break;

            case 3: // Top category & Pie chart
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 64px sans-serif';
              const spendTitle = language === 'fr' ? 'Ta Dépense N°1' : 'L-masrouf dyalek l-kbir';
              ctx.fillText(spendTitle, 1080 / 2, 350);

              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 36px sans-serif';
              const subSpend = language === 'fr' ? 'Là où ton portefeuille a fondu :' : 'Fin mchaw lik floussek bzaf :';
              ctx.fillText(subSpend, 1080 / 2, 420);

              // Category name in huge text
              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 90px sans-serif';
              ctx.fillText(stats.topCategory.name.toUpperCase(), 1080 / 2, 560);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 110px sans-serif';
              ctx.fillText(`${stats.topCategory.percentOfTotal}%`, 1080 / 2, 700);

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 32px sans-serif';
              const totalSpentLabel = language === 'fr' ? 'de tes dépenses totales de l\'année' : 'mn l-majmo3 d masarif d l-3am';
              ctx.fillText(totalSpentLabel, 1080 / 2, 770);

              // Draw Pie Chart manually in the center
              const cX = 1080 / 2;
              const cY = 1120;
              const radius = 240;
              const topCategoryPercent = stats.topCategory.percentOfTotal;

              // 1. Draw "Other expenses" background slice (100%)
              ctx.beginPath();
              ctx.moveTo(cX, cY);
              ctx.arc(cX, cY, radius, 0, Math.PI * 2);
              ctx.fillStyle = `${activeTheme.primary}22`; // 13% opacity
              ctx.fill();

              // 2. Draw "Top category" slice
              const startAngle = -Math.PI / 2; // start at top (12 o'clock)
              const sliceAngle = (topCategoryPercent / 100) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(cX, cY);
              ctx.arc(cX, cY, radius, startAngle, startAngle + sliceAngle);
              ctx.fillStyle = activeTheme.primary;
              ctx.fill();

              // Inner donut hole for modern design
              ctx.beginPath();
              ctx.arc(cX, cY, radius * 0.55, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();

              // Icon or text inside donut hole
              ctx.fillStyle = '#0F172A';
              ctx.font = 'bold 50px sans-serif';
              ctx.fillText('🛍️', cX, cY);

              // Total spent in this category
              ctx.fillStyle = '#475569';
              ctx.font = 'bold 34px sans-serif';
              const amountLabel = language === 'fr' ? `Soit un total de : ${stats.topCategory.amount.toLocaleString('fr-FR')} DH` : `Fl-majmo3 d : ${stats.topCategory.amount.toLocaleString('fr-FR')} DH`;
              ctx.fillText(amountLabel, 1080 / 2, 1480);

              // Comparison details if available
              ctx.fillStyle = '#10B981';
              ctx.font = 'black 34px sans-serif';
              const compLabel = language === 'fr' 
                ? `📉 Réduction sur ${stats.mostImprovedCategory.name} : -${stats.mostImprovedCategory.percentReduction}%`
                : `📉 N-9ess f l-${stats.mostImprovedCategory.name} : -${stats.mostImprovedCategory.percentReduction}%`;
              ctx.fillText(compLabel, 1080 / 2, 1580);
              break;

            case 4: // Goals Completed
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 64px sans-serif';
              const goalsTitle = language === 'fr' ? 'Tes Rêves Réalisés' : 'L-ahdaf li wsselti liha';
              ctx.fillText(goalsTitle, 1080 / 2, 350);

              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 36px sans-serif';
              const subGoals = language === 'fr' ? 'Tes projets bouclés avec succès :' : 'L-macharikh d l-moustaqbal li kamalti :';
              ctx.fillText(subGoals, 1080 / 2, 420);

              if (stats.goalsCompleted.length === 0) {
                // No goals completed fallback
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.roundRect(120, 520, 840, 500, 36);
                ctx.fill();
                ctx.strokeStyle = `${activeTheme.primary}1A`;
                ctx.stroke();

                ctx.fillStyle = '#475569';
                ctx.font = 'bold 38px sans-serif';
                const noGoalsText1 = language === 'fr' ? 'Aucun projet finalisé encore' : 'Makayn 7ta chi hadaf mkmel dba';
                ctx.fillText(noGoalsText1, 1080 / 2, 700);

                ctx.fillStyle = activeTheme.primary;
                ctx.font = 'black 42px sans-serif';
                const noGoalsText2 = language === 'fr' ? 'Continue l\'effort pour {nextYear} !' : 'Kammel l-iddikhar l s-sif oula ch-char !';
                ctx.fillText(noGoalsText2.replace('{nextYear}', String(stats.year + 1)), 1080 / 2, 800);
              } else {
                // Draw completed goals list
                let listY = 540;
                stats.goalsCompleted.slice(0, 4).forEach((goal, gIdx) => {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.beginPath();
                  ctx.roundRect(120, listY, 840, 180, 24);
                  ctx.fill();
                  ctx.strokeStyle = `${activeTheme.primary}1A`;
                  ctx.stroke();

                  // Icon
                  ctx.fillStyle = '#0F172A';
                  ctx.font = '48px sans-serif';
                  ctx.fillText('⭐', 180, listY + 90);

                  // Goal title
                  ctx.fillStyle = '#0F172A';
                  ctx.font = 'black 34px sans-serif';
                  ctx.textAlign = 'left';
                  // truncate goal title if too long
                  const shortGoalName = goal.name.length > 25 ? `${goal.name.slice(0, 25)}...` : goal.name;
                  ctx.fillText(shortGoalName.toUpperCase(), 250, listY + 70);

                  ctx.fillStyle = '#64748B';
                  ctx.font = 'bold 26px sans-serif';
                  const compAt = language === 'fr' ? `Atteint le : ${goal.completedDate}` : `Kmmeltih f : ${goal.completedDate}`;
                  ctx.fillText(compAt, 250, listY + 120);

                  // Target amount
                  ctx.fillStyle = '#10B981';
                  ctx.font = 'black 38px sans-serif';
                  ctx.textAlign = 'right';
                  ctx.fillText(`${goal.amount.toLocaleString('fr-FR')} DH`, 900, listY + 100);

                  ctx.textAlign = 'center'; // reset alignment for next loops
                  listY += 230;
                });
              }

              // Visual badge at bottom
              ctx.fillStyle = '#F59E0B';
              ctx.font = '100px sans-serif';
              ctx.fillText('🏆', 1080 / 2, 1550);
              ctx.fillStyle = '#475569';
              ctx.font = 'bold 36px sans-serif';
              const disciplineMsg = language === 'fr' ? 'La clé de ton succès !' : 'Sarout d l-iddikhar dyalek !';
              ctx.fillText(disciplineMsg, 1080 / 2, 1650);
              break;

            case 5: // Streak & Logged stats
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 64px sans-serif';
              const disciplineTitle = language === 'fr' ? 'Ta Discipline Quotidienne' : 'L-indibat d koula nhar';
              ctx.fillText(disciplineTitle, 1080 / 2, 350);

              // Streak Card
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(120, 480, 840, 480, 36);
              ctx.fill();
              ctx.strokeStyle = `${activeTheme.primary}1A`;
              ctx.stroke();

              ctx.fillStyle = '#F97316';
              ctx.font = '100px sans-serif';
              ctx.fillText('🔥', 1080 / 2, 580);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 90px sans-serif';
              ctx.fillText(`${stats.longestStreak} JOURS`, 1080 / 2, 740);

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 34px sans-serif';
              const streakLabel = language === 'fr' ? 'Streak de saisie consécutif' : 'Nhar dial l-kttaba moutsalsala';
              ctx.fillText(streakLabel, 1080 / 2, 830);

              // Transactions Logged Card
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(120, 1020, 840, 480, 36);
              ctx.fill();
              ctx.strokeStyle = `${activeTheme.secondary}1A`;
              ctx.stroke();

              ctx.fillStyle = activeTheme.primary;
              ctx.font = '100px sans-serif';
              ctx.fillText('✍️', 1080 / 2, 1120);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 90px sans-serif';
              ctx.fillText(`${stats.totalTransactionsLogged}`, 1080 / 2, 1280);

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 34px sans-serif';
              const txsLabel = language === 'fr' ? 'Transactions saisies cette année' : 'Mou3amalat li sejjelti had l-3am';
              ctx.fillText(txsLabel, 1080 / 2, 1370);

              // Small OCR receipt badge info if scanned > 0
              if (stats.ocrReceiptsScanned > 0) {
                ctx.fillStyle = '#10B981';
                ctx.font = 'black 34px sans-serif';
                const ocrMsg = language === 'fr' 
                  ? `📸 Dont ${stats.ocrReceiptsScanned} tickets numérisés via OCR !` 
                  : `📸 Mnha ${stats.ocrReceiptsScanned} tickets sowwerti b l-cam !`;
                ctx.fillText(ocrMsg, 1080 / 2, 1620);
              }
              break;

            case 6: // Personality Badge
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 64px sans-serif';
              const profileTitle = language === 'fr' ? 'Ton Profil Floussi' : 'L-profil dyalek fl-flouss';
              ctx.fillText(profileTitle, 1080 / 2, 350);

              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 36px sans-serif';
              const badgeSubtitle = language === 'fr' ? 'Un badge honorifique pour clore l\'année :' : 'Xara d l-i7tiram d l-3am :';
              ctx.fillText(badgeSubtitle, 1080 / 2, 420);

              // Draw a glowing ambient circle
              ctx.beginPath();
              ctx.arc(1080 / 2, 730, 210, 0, Math.PI * 2);
              ctx.fillStyle = `${activeTheme.accent}1F`;
              ctx.fill();

              ctx.beginPath();
              ctx.arc(1080 / 2, 730, 180, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
              ctx.strokeStyle = activeTheme.primary;
              ctx.lineWidth = 6;
              ctx.stroke();

              // Giant emoji inside badge
              ctx.fillStyle = '#0F172A';
              ctx.font = '150px sans-serif';
              // Check profile type to set proper emoji
              let profEmoji = '👑';
              if (stats.personalityBadgeFr.includes('Discipliné')) profEmoji = '🪙';
              else if (stats.personalityBadgeFr.includes('Dépensier')) profEmoji = '☕';
              else if (stats.personalityBadgeFr.includes('Acheteur')) profEmoji = '💸';
              else if (stats.personalityBadgeFr.includes('Gestionnaire')) profEmoji = '👨‍👩‍👧‍👦';
              ctx.fillText(profEmoji, 1080 / 2, 750);

              // Draw badge title
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 54px sans-serif';
              const badgeVal = language === 'fr' ? stats.personalityBadgeFr : stats.personalityBadgeDarija;
              ctx.fillText(badgeVal, 1080 / 2, 1050);

              // Draw level info
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(160, 1150, 760, 260, 28);
              ctx.fill();
              ctx.strokeStyle = `${activeTheme.primary}1A`;
              ctx.stroke();

              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 32px sans-serif';
              const scoreTitleText = language === 'fr' ? 'SCORE FLOUSSI GLOBAL' : 'S-SKOUR FLOUSSI L-KLI';
              ctx.fillText(scoreTitleText, 1080 / 2, 1205);

              // Large Score Number
              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 72px sans-serif';
              const finalScore = stats.floussiScore || 350;
              const finalTier = stats.floussiTier || 'Discipliné';
              ctx.fillText(`${finalScore} PTS`, 1080 / 2, 1290);

              // Tier designation
              ctx.fillStyle = '#F59E0B'; // Gold color
              ctx.font = 'black 38px sans-serif';
              const tierText = language === 'fr' ? `Palier : ${finalTier}` : `R-Rutba : ${finalTier}`;
              ctx.fillText(tierText.toUpperCase(), 1080 / 2, 1365);

              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 30px sans-serif';
              const activeAdv = language === 'fr' 
                ? `Une année au rang de ${finalTier} Floussi !`
                : `3am d l-mouwa9aba f r-rutba d ${finalTier} !`;
              ctx.fillText(activeAdv, 1080 / 2, 1480);
              break;

            case 7: // Outro slide with styled QR code pointing to app
              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 64px sans-serif';
              ctx.fillText('FLOUSSI', 1080 / 2, 350);

              ctx.fillStyle = '#0F172A';
              ctx.font = 'black 76px sans-serif';
              const joinTitle = language === 'fr' ? 'REJOINS-MOI SUR FLOUSSI !' : 'YALLAH L FLOUSSI !';
              ctx.fillText(joinTitle, 1080 / 2, 450);

              ctx.fillStyle = '#64748B';
              ctx.font = 'bold 36px sans-serif';
              const subJoin = language === 'fr' ? 'L\'application pour épargner malin au Maroc' : 'L-appli d tawfir w l-indibat f l-Masrouf';
              ctx.fillText(subJoin, 1080 / 2, 520);

              // Draw the Mock QR Code
              const qrSize = 420;
              const qrX = (1080 - qrSize) / 2;
              const qrY = 660;
              drawMockQRCode(ctx, qrX, qrY, qrSize, activeTheme.primary, '#FFFFFF');

              // Amount Epargné as a nice callout card below QR
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.roundRect(160, 1200, 760, 240, 28);
              ctx.fill();
              ctx.strokeStyle = `${activeTheme.primary}1A`;
              ctx.stroke();

              ctx.fillStyle = '#475569';
              ctx.font = 'bold 32px sans-serif';
              const myTotalSaved = language === 'fr' ? `J'ai épargné au total :` : `Majmo3 li khbit f l-iddikhar :`;
              ctx.fillText(myTotalSaved, 1080 / 2, 1270);

              ctx.fillStyle = '#10B981';
              ctx.font = 'black 64px sans-serif';
              ctx.fillText(`${stats.totalSaved.toLocaleString('fr-FR')} DH !`, 1080 / 2, 1360);

              // Bottom URL info
              ctx.fillStyle = '#475569';
              ctx.font = 'bold 32px sans-serif';
              ctx.fillText('Scannez pour télécharger l\'application', 1080 / 2, 1560);

              ctx.fillStyle = activeTheme.primary;
              ctx.font = 'black 40px sans-serif';
              ctx.fillText('www.floussi.ma', 1080 / 2, 1630);
              break;
          }

          // Output image data URL
          const slideUrl = canvas.toDataURL('image/png');
          slides.push(slideUrl);
        }

        resolve(slides);
      };

      runSlideGeneration();

    } catch (e) {
      reject(e);
    }
  });
}
