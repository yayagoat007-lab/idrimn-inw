"use client";

import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Next.js Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="bg-rose-50 text-rose-600 p-4 rounded-full">
        <ShieldAlert size={40} />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
          Oups, une erreur s'est produite !
        </h2>
        <p className="text-xs text-gray-400 max-w-sm">
          Nous avons rencontré un problème inattendu lors de la manipulation de vos enveloppes de budget.
        </p>
      </div>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
      >
        Réessayer
      </button>
    </div>
  );
}
