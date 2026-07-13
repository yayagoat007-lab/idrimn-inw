import { Transaction, Bucket, Goal } from '../types';
import { formatCurrency } from './utils';

export interface ReportConfig {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  periodName: string;
  sections: string[];
  healthScore: number;
  benchmarksDiff: number; // percentage
  anomaliesCount: number;
}

export function generateClientPDF(
  profile: any,
  transactions: Transaction[],
  buckets: Bucket[],
  goals: Goal[],
  config: ReportConfig
) {
  const userName = profile?.full_name || "Utilisateur Floussi";
  const userTier = profile?.subscription_tier || "free";
  const dateStr = new Date().toLocaleDateString('fr-MA', { year: 'numeric', month: 'long', day: 'numeric' });

  // Compute metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  // Build rows for transactions table
  const transactionRows = transactions.slice(0, 15).map(t => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px;">${t.transaction_date}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 600;">${t.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; text-transform: uppercase;">${t.category}</td>
      <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; font-weight: 700; text-align: right; color: ${t.type === 'income' ? '#10B981' : '#EF4444'}">
        ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
      </td>
    </tr>
  `).join('');

  // Build rows for buckets
  const bucketRows = buckets.map(b => {
    const ratio = b.allocated_amount > 0 ? Math.round((b.spent_amount / b.allocated_amount) * 100) : 0;
    const isOver = b.spent_amount > b.allocated_amount;
    return `
      <div style="border: 1px solid #E2E8F0; padding: 12px; border-radius: 12px; background: #F8FAFC; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #1E293B;">
          <span>Sandoq: ${b.name}</span>
          <span>${formatCurrency(b.spent_amount)} / ${formatCurrency(b.allocated_amount)}</span>
        </div>
        <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 3px; margin-top: 8px; overflow: hidden;">
          <div style="width: ${Math.min(100, ratio)}%; height: 100%; background: ${isOver ? '#EF4444' : '#10B981'}; border-radius: 3px;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #64748B; margin-top: 5px;">
          <span>Rempli à ${ratio}%</span>
          <span>Reste: ${formatCurrency(Math.max(0, b.allocated_amount - b.spent_amount))}</span>
        </div>
      </div>
    `;
  }).join('');

  // Build rows for goals
  const goalRows = goals.map(g => {
    const ratio = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
    return `
      <div style="border-left: 4px solid #3B82F6; background: #EFF6FF; padding: 10px 15px; border-radius: 8px; margin-bottom: 8px;">
        <div style="font-size: 11px; font-weight: 700; color: #1E3A8A;">${g.name}</div>
        <div style="font-size: 10px; color: #3B82F6; font-weight: 600; margin-top: 2px;">
          Progression: ${formatCurrency(g.current_amount)} sur ${formatCurrency(g.target_amount)} (${ratio}%)
        </div>
      </div>
    `;
  }).join('');

  // Generate complete HTML page
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Rapport Financier Floussi - ${config.periodName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          color: #1E293B;
          background-color: #FFFFFF;
          margin: 0;
          padding: 40px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #E2E8F0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: #10B981;
          letter-spacing: -0.5px;
        }
        .meta-info {
          text-align: right;
          font-size: 11px;
          color: #64748B;
          font-weight: 500;
        }
        .title-section {
          margin-bottom: 25px;
        }
        .title-section h1 {
          font-size: 20px;
          font-weight: 800;
          margin: 0;
          color: #0F172A;
        }
        .title-section p {
          font-size: 12px;
          color: #64748B;
          margin: 5px 0 0 0;
          font-weight: 500;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .kpi-card {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 15px;
          background: #FFFFFF;
        }
        .kpi-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748B;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
          margin-top: 5px;
        }
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          color: #0F172A;
          border-bottom: 1px solid #E2E8F0;
          padding-bottom: 8px;
          margin-top: 30px;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          background-color: #F1F5F9;
          padding: 10px;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          color: #475569;
        }
        .badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 9px;
          font-weight: 700;
          border-radius: 9999px;
          text-transform: uppercase;
        }
        .badge-success {
          background-color: #D1FAE5;
          color: #065F46;
        }
        .badge-warning {
          background-color: #FEF3C7;
          color: #92400E;
        }
        @media print {
          body {
            padding: 20px;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div style="max-width: 800px; margin: 0 auto;">
        
        <!-- Print Header Trigger (Non-printed in physical output) -->
        <div style="background: #F1F5F9; padding: 12px 20px; border-radius: 12px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;" class="no-print">
          <span style="font-size: 11px; font-weight: 600; color: #475569;">Votre rapport executive PDF est prêt à l'impression.</span>
          <button onclick="window.print()" style="background: #10B981; color: white; border: none; font-size: 11px; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
            Imprimer / Enregistrer en PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo-text">Floussi</div>
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 1px; margin-top: 2px;">
              Dakira Malia Lil-Marok
            </div>
          </div>
          <div class="meta-info">
            <div>Édité le : ${dateStr}</div>
            <div>Abonnement : <span style="text-transform: uppercase; font-weight: 700; color: #10B981;">${userTier}</span></div>
            <div>ID : ${profile?.id || "N/A"}</div>
          </div>
        </div>

        <div class="title-section">
          <h1>Rapport de Synthèse de Patrimoine & Budget</h1>
          <p>Période couverte : ${config.periodName} • Préparé pour ${userName}</p>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card" style="border-top: 4px solid #10B981;">
            <div class="kpi-label">Revenus Totaux</div>
            <div class="kpi-value" style="color: #059669;">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="kpi-card" style="border-top: 4px solid #EF4444;">
            <div class="kpi-label">Dépenses Totales</div>
            <div class="kpi-value" style="color: #DC2626;">${formatCurrency(totalSpent)}</div>
          </div>
          <div class="kpi-card" style="border-top: 4px solid #3B82F6;">
            <div class="kpi-label">Épargne Réalisée</div>
            <div class="kpi-value" style="color: #2563EB;">${formatCurrency(savings)}</div>
          </div>
          <div class="kpi-card" style="border-top: 4px solid #F59E0B;">
            <div class="kpi-label">Score de Santé</div>
            <div class="kpi-value" style="color: #D97706;">${config.healthScore} / 100</div>
          </div>
        </div>

        ${config.sections.includes('overview') ? `
          <div class="section-title">Analyse Budgétaire de Trésorerie</div>
          <div class="grid-2">
            <div>
              <h3 style="font-size: 12px; font-weight: 700; margin-bottom: 12px; color: #475569;">État des Sandoqs (Enveloppes)</h3>
              ${bucketRows || '<p style="font-size: 11px; color: #94A3B8;">Aucun sandoq configuré.</p>'}
            </div>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px;">
              <h3 style="font-size: 12px; font-weight: 700; margin-bottom: 10px; color: #475569;">Diagnostic Coach Floussi</h3>
              <p style="font-size: 11px; line-height: 1.6; color: #334155; font-weight: 500;">
                Votre taux d'épargne sur ce mois s'établit à <strong>${savingsRate}%</strong>. Pour un foyer marocain moyen, Bank Al-Maghrib recommande de conserver un volant de sécurité de 15% à 20% des revenus réguliers.
              </p>
              <p style="font-size: 11px; line-height: 1.6; color: #334155; font-weight: 500; margin-top: 10px;">
                ${savingsRate >= 15 
                  ? "Félicitations ! Votre discipline de sandoqs porte ses fruits. Vous dépassez le seuil d'épargne recommandé." 
                  : "Attention, votre matelas d'épargne est bas. Nous conseillons de revoir vos dépenses d'alimentation hors foyer et de réduire de 10% vos abonnements non-essentiels."}
              </p>
            </div>
          </div>
        ` : ''}

        ${config.sections.includes('net_worth') && goals.length > 0 ? `
          <div class="section-title">Objectifs d'Épargne Active</div>
          <div style="margin-bottom: 25px;">
            ${goalRows}
          </div>
        ` : ''}

        ${config.sections.includes('benchmarks') ? `
          <div class="section-title">Comparaison Régionale HCP Maroc</div>
          <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 15px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #92400E;">
              <span>Indicateurs de Dépenses HCP</span>
            </div>
            <p style="font-size: 11px; line-height: 1.6; color: #78350F; margin-top: 6px; font-weight: 500;">
              Par rapport aux ménages ayant des caractéristiques similaires à <strong>${profile?.city || "Casablanca"}</strong>, vos charges d'alimentation sont de <strong>${config.benchmarksDiff > 0 ? `+${config.benchmarksDiff}%` : `${config.benchmarksDiff}%`}</strong> par rapport à l'indice de référence du Haut-Commissariat au Plan.
            </p>
          </div>
        ` : ''}

        <div class="section-title">Relevé des Transactions Majeures</div>
        <table style="margin-bottom: 40px;">
          <thead>
            <tr>
              <th style="width: 15%;">Date</th>
              <th style="width: 45%;">Description</th>
              <th style="width: 20%;">Catégorie</th>
              <th style="width: 20%; text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94A3B8; font-size: 11px;">Aucune transaction à afficher.</td></tr>'}
          </tbody>
        </table>

        <div style="border-top: 1px solid #E2E8F0; padding-top: 15px; text-align: center; font-size: 9px; color: #94A3B8; font-weight: 600;">
          Floussi S.A.R.L - Conforme aux réglementations financières locales marocaines. Merci de faire confiance à Floussi.
        </div>

      </div>
    </body>
    </html>
  `;

  // Open in custom window or print frame
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert("Veuillez autoriser les fenêtres contextuelles (popups) pour générer et imprimer le rapport PDF.");
  }
}
