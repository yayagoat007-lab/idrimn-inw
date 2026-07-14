import React from 'react';
import { getTranslation } from '../lib/i18n';

export const metadata = {
  title: 'Floussi - Mon Budget Enveloppe',
  description: 'Maîtrisez vos finances cash, planifiez vos sandoqs et gérez vos budgets d\'espèces au Maroc en toute simplicité.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
