"use client";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-2xl p-8 shadow-xs space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
          À propos de Floussi 🇲🇦
        </h2>
        <p className="text-xs text-gray-500 font-semibold leading-relaxed">
          Floussi est né de la volonté d'adapter la méthode universelle et éprouvée des enveloppes budgétaires (rendue célèbre par BucketBudgetApp) aux particularités uniques du marché marocain.
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Au Maroc, la gestion financière est fortement ancrée dans le cash (79% des transactions) et repose sur de magnifiques mécanismes de solidarité communautaire, tels que la tontine traditionnelle amicale "Daret".
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Notre mission est de donner à chaque citoyen marocain les outils technologiques modernes pour suivre ses dépenses d'espèces quotidiennes, anticiper les grandes échéances familiales et religieuses (Ramadan, Aïd al-Adha), et faire prospérer son épargne en toute sérénité.
        </p>
      </div>
    </div>
  );
}
