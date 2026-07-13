"use client";

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-xs space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
          Politique de Confidentialité 🔒
        </h2>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          Chez Floussi, la confidentialité et la sécurité de vos informations financières sont notre priorité absolue. Vos données budgétaires vous appartiennent.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Nous mettons en œuvre un chiffrement de bout en bout sur toutes les transactions stockées et synchronisées dans notre infrastructure Supabase Cloud. Si vous utilisez Floussi hors-ligne, vos données de budget restent confinées dans la mémoire IndexedDB sécurisée de votre smartphone (Capacitor wrapper).
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Nous ne vendons ni ne partageons vos données financières privées avec des organismes de crédit ou des banques tierces. Toute intégration publicitaire (Google AdSense pour les utilisateurs gratuits) s'effectue de manière anonymisée.
        </p>
      </div>
    </div>
  );
}
