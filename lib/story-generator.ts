import { FloussiTheme, FLOUSSI_THEMES } from './themes';

/**
 * Generates an achievement story card for Instagram (1080x1920) via HTML Canvas.
 * Returns a Promise of a PNG data URL.
 */
export function generateAchievementStoryImage(
  goalName: string,
  targetAmount: number,
  durationText: string = 'Quelques mois',
  themeId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const activeTheme = FLOUSSI_THEMES.find(t => t.id === themeId) || FLOUSSI_THEMES[0];
      
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get 2D canvas context');
      }

      // 1. Draw elegant background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, activeTheme.background || '#FAF9F6');
      bgGrad.addColorStop(0.5, '#FFFFFF');
      bgGrad.addColorStop(1, activeTheme.surface || '#E2E8F0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Draw modern decorative circles/patterns (Ambient glow)
      ctx.beginPath();
      ctx.arc(1080, 0, 450, 0, Math.PI * 2);
      ctx.fillStyle = `${activeTheme.primary}0D`; // 5% opacity
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 1920, 600, 0, Math.PI * 2);
      ctx.fillStyle = `${activeTheme.secondary}0D`;
      ctx.fill();

      // 3. Draw Moroccan-inspired elegant corner borders / framing
      const framePadding = 50;
      const cornerSize = 120;
      ctx.strokeStyle = `${activeTheme.primary}44`; // 25% opacity
      ctx.lineWidth = 6;
      ctx.strokeRect(framePadding, framePadding, 1080 - framePadding * 2, 1920 - framePadding * 2);

      // Draw elegant corner brackets
      ctx.strokeStyle = activeTheme.primary;
      ctx.lineWidth = 14;
      
      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(framePadding + cornerSize, framePadding);
      ctx.lineTo(framePadding, framePadding);
      ctx.lineTo(framePadding, framePadding + cornerSize);
      ctx.stroke();

      // Top-Right corner
      ctx.beginPath();
      ctx.moveTo(1080 - framePadding - cornerSize, framePadding);
      ctx.lineTo(1080 - framePadding, framePadding);
      ctx.lineTo(1080 - framePadding, framePadding + cornerSize);
      ctx.stroke();

      // Bottom-Left corner
      ctx.beginPath();
      ctx.moveTo(framePadding + cornerSize, 1920 - framePadding);
      ctx.lineTo(framePadding, 1920 - framePadding);
      ctx.lineTo(framePadding, 1920 - framePadding - cornerSize);
      ctx.stroke();

      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(1080 - framePadding - cornerSize, 1920 - framePadding);
      ctx.lineTo(1080 - framePadding, 1920 - framePadding);
      ctx.lineTo(1080 - framePadding, 1920 - framePadding - cornerSize);
      ctx.stroke();

      // 4. Header: Floussi Branding
      ctx.fillStyle = activeTheme.text;
      ctx.font = 'black 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨  FLOUSSI  ✨', 1080 / 2, 180);

      // Small subtitle under branding
      ctx.fillStyle = `${activeTheme.text}AA`;
      ctx.font = '800 24px sans-serif';
      ctx.fillText('Mihfadati & Iddikhar', 1080 / 2, 235);

      // 5. Huge celebration text
      ctx.fillStyle = activeTheme.primary;
      ctx.font = 'black 84px sans-serif';
      ctx.fillText('MABROUK !', 1080 / 2, 450);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText('OBJECTIF ATTEINT À 100%', 1080 / 2, 540);

      // 6. Draw central high-contrast Card for the Goal Name
      const cardY = 660;
      const cardHeight = 550;
      const cardWidth = 840;
      const cardX = (1080 - cardWidth) / 2;

      // Card shadow
      ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;

      // Draw rounded card
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 48);
      ctx.fill();

      // Card border
      ctx.shadowColor = 'transparent'; // Reset shadow for subsequent drawings
      ctx.strokeStyle = `${activeTheme.primary}1A`;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inside Card: Goal Name
      ctx.fillStyle = '#64748B';
      ctx.font = '800 32px sans-serif';
      ctx.fillText('PROJET DE VIE SUIVI SUR FLOUSSI', 1080 / 2, cardY + 90);

      ctx.fillStyle = activeTheme.text;
      ctx.font = 'black 64px sans-serif';
      // Wrap text in case goal name is long
      const maxGoalWidth = cardWidth - 100;
      const goalWords = goalName.toUpperCase().split(' ');
      let currentLine = '';
      let lineY = cardY + 180;
      const lines: string[] = [];
      
      goalWords.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxGoalWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);

      // Draw goal title lines (limit to 2 lines)
      lines.slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, 1080 / 2, lineY + index * 80);
      });

      // Inside Card: Amount Display
      const amountY = cardY + 390;
      ctx.fillStyle = activeTheme.primary;
      ctx.font = 'black 110px sans-serif';
      ctx.fillText(`${targetAmount.toLocaleString('fr-FR')} DH`, 1080 / 2, amountY);

      // 7. Success Badge / Medal (Illustrated using standard shapes)
      const starY = 1330;
      ctx.fillStyle = '#F59E0B'; // Amber
      ctx.beginPath();
      ctx.arc(1080 / 2, starY, 90, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer border on badge
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Draw star in badge
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '90px sans-serif';
      ctx.fillText('🏆', 1080 / 2, starY);

      // 8. Duration detail below the card
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`Épargné en : ${durationText}`, 1080 / 2, 1500);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 28px sans-serif';
      ctx.fillText('Discipline & Rigueur', 1080 / 2, 1560);

      // 9. QR Code placeholder or App Link Footer
      ctx.fillStyle = `${activeTheme.text}CC`;
      ctx.font = 'black 32px sans-serif';
      ctx.fillText('REJOIGNEZ LA COMMUNAUTÉ', 1080 / 2, 1720);

      ctx.fillStyle = `${activeTheme.text}88`;
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('www.floussi.ma  •  Épargnez Intelligent', 1080 / 2, 1775);

      // Resolve base64 image URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);

    } catch (e) {
      reject(e);
    }
  });
}
