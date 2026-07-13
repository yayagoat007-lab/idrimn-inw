"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertTriangle, RefreshCw, Layers, ArrowLeft, ArrowRight, Play, Eye } from 'lucide-react';
import { useTransactions } from '../../../../hooks/use-transactions';
import { formatCurrency } from '../../../../lib/utils';
import { MOROCCAN_CATEGORIES } from '../../../../lib/categories';
import { Language } from '../../../../lib/i18n';

interface ImportPageProps {
  language: Language;
  onNavigate: (route: string) => void;
}

interface ParsedRow {
  id: string;
  transaction_date: string;
  merchant: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
}

export default function ImportPage({
  language,
  onNavigate
}: ImportPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBank, setSelectedBank] = useState<'cih' | 'attijari' | 'bmce' | 'bcp'>('cih');
  const [isParsing, setIsParsing] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const { createTransaction } = useTransactions();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    
    // Simulate real high-fidelity parsing based on chosen bank layout
    setTimeout(() => {
      let simulatedRows: ParsedRow[] = [];

      if (selectedBank === 'cih') {
        simulatedRows = [
          {
            id: 'row-1',
            transaction_date: '2026-07-02',
            merchant: 'Marjane',
            description: 'PAIEMENT PAR CARTE MARJANE CASABLANCA',
            amount: 450.50,
            type: 'expense',
            category: 'food'
          },
          {
            id: 'row-2',
            transaction_date: '2026-07-04',
            merchant: 'Virement reçu',
            description: 'VIREMENT SALAIRE DE: INGENIA SARL',
            amount: 14500.00,
            type: 'income',
            category: 'salary'
          },
          {
            id: 'row-3',
            transaction_date: '2026-07-05',
            merchant: 'Lydec',
            description: 'PRELEVEMENT LYDEC EAU ELECTRICITE',
            amount: 320.00,
            type: 'expense',
            category: 'bills'
          },
          {
            id: 'row-4',
            transaction_date: '2026-07-10',
            merchant: 'Decathlon',
            description: 'ACHAT DECATHLON BOUSKOURA',
            amount: 150.00,
            type: 'expense',
            category: 'leisure'
          }
        ];
      } else {
        // Attijariwafa, BMCE or BCP simulated formats
        simulatedRows = [
          {
            id: 'row-1',
            transaction_date: '2026-07-01',
            merchant: 'BIM Stores',
            description: 'RETRAIT GAB ATTIJARIWAFA',
            amount: 500.00,
            type: 'expense',
            category: 'food'
          },
          {
            id: 'row-2',
            transaction_date: '2026-07-03',
            merchant: 'Afriquia Gaz',
            description: 'PAIEMENT AFRIQUIA MAROC',
            amount: 250.00,
            type: 'expense',
            category: 'transport'
          }
        ];
      }

      setParsedRows(simulatedRows);
      setIsParsing(false);
      setStep(2);
    }, 1200);
  };

  const handleRowValueChange = (id: string, field: keyof ParsedRow, value: any) => {
    setParsedRows(prev => prev.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleImportAll = async () => {
    setIsParsing(true);
    try {
      for (const row of parsedRows) {
        await createTransaction({
          account_id: 'acc-checking',
          bucket_id: null,
          type: row.type,
          amount: row.amount,
          description: row.description,
          merchant: row.merchant,
          category: row.category,
          tags: ['imported', selectedBank],
          receipt_url: null,
          is_recurring: false,
          recurring_frequency: null,
          transaction_date: row.transaction_date
        });
      }

      alert(`${parsedRows.length} transactions importées avec succès dans votre journal de compte.`);
      onNavigate('transactions');
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde des transactions.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('transactions')}
          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Import Relevé Bancaire</h2>
          <p className="text-xs text-slate-400 font-semibold">Récupérez vos extraits de comptes PDF ou CSV sans saisie manuelle</p>
        </div>
      </div>

      {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bank Config */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">1. Sélectionnez votre banque</h4>
              <p className="text-[10px] text-slate-400 font-bold">Nous supportons les formats d'extraction officiels</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'cih', name: 'CIH Bank (Code 30 / E-CIH)', color: 'border-orange-200 hover:border-orange-400 text-orange-700 bg-orange-50/5' },
                { id: 'attijari', name: 'Attijariwafa Bank (L\'Bankalik)', color: 'border-amber-200 hover:border-amber-400 text-amber-700 bg-amber-50/5' },
                { id: 'bmce', name: 'Bank of Africa - BMCE', color: 'border-blue-200 hover:border-blue-400 text-blue-700 bg-blue-50/5' },
                { id: 'bcp', name: 'Banque Populaire (Chaabi Net)', color: 'border-rose-200 hover:border-rose-400 text-rose-700 bg-rose-50/5' }
              ].map(bank => {
                const isSelected = selectedBank === bank.id;
                return (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id as any)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${isSelected ? 'border-emerald-500 bg-emerald-50/10 text-emerald-800 ring-1 ring-emerald-500' : bank.color}`}
                  >
                    {bank.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-xs flex flex-col justify-between min-h-[350px]">
            <div className="space-y-2 text-center max-w-md mx-auto">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">2. Glissez votre relevé de compte</h4>
              <p className="text-[10px] text-slate-400 font-bold">Fichiers PDF originaux ou extraits au format CSV / XLS.</p>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-12 text-center cursor-pointer transition-colors hover:bg-emerald-50/5 flex flex-col justify-center items-center gap-4 relative group flex-1 m-4"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.csv,.xls,.xlsx"
                className="hidden"
              />

              {isParsing ? (
                <div className="space-y-2">
                  <RefreshCw size={32} className="animate-spin text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Lecture et classification par IA des lignes...</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Parsing de {selectedBank.toUpperCase()} Relevé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload size={36} className="text-slate-400 group-hover:text-emerald-500 mx-auto transition-all" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Sélectionner un fichier sur votre appareil</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Recommandé : Relevé mensuel officiel</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4.5 rounded-2xl text-xs font-semibold text-slate-500 mt-2 border border-slate-100/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={16} />
                <span>Vos documents ne sont jamais envoyés sur un serveur tiers (traitement client).</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* STEP 2 : Validation grid of parsed rows */
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Vérification de l'extraction ({parsedRows.length} transactions)</h4>
              <p className="text-[10px] text-slate-400 font-bold">Associez les catégories ou corrigez les libellés avant validation</p>
            </div>
            
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
            >
              Réimporter un autre relevé
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Bénéficiaire Extrait</th>
                  <th className="px-4 py-3">Mémo / Détail</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map(row => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/30">
                    {/* Date */}
                    <td className="px-4 py-2.5">
                      <input
                        type="date"
                        value={row.transaction_date}
                        onChange={(e) => handleRowValueChange(row.id, 'transaction_date', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700"
                      />
                    </td>

                    {/* Merchant */}
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.merchant}
                        onChange={(e) => handleRowValueChange(row.id, 'merchant', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-800 w-full"
                      />
                    </td>

                    {/* Description */}
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleRowValueChange(row.id, 'description', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 w-full"
                      />
                    </td>

                    {/* Category Selector */}
                    <td className="px-4 py-2.5">
                      <select
                        value={row.category}
                        onChange={(e) => handleRowValueChange(row.id, 'category', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700"
                      >
                        {MOROCCAN_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name_fr}</option>
                        ))}
                      </select>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-2.5 text-right font-black text-xs">
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleRowValueChange(row.id, 'amount', parseFloat(e.target.value))}
                        className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-slate-800 text-right w-24"
                      />
                    </td>

                    {/* Type Tag */}
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${row.type === 'expense' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {row.type === 'expense' ? 'Débit' : 'Crédit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Validation Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">Toutes les données sont prêtes à être stockées localement.</span>
            
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleImportAll}
                className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Importer {parsedRows.length} transactions</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
