"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useMoroccanEvents } from '../../../hooks/use-moroccan-events';
import { useReports } from '../../../hooks/use-reports';
import { useAIInsights } from '../../../hooks/use-ai-insights';
import { PlanGate } from '../../../components/shared/PlanGate';
import { EventsCalendar } from '../../../components/events/EventsCalendar';
import { EventProgressCard } from '../../../components/events/EventProgressCard';
import { SeasonalProfilesManager } from '../../../components/events/SeasonalProfilesManager';
import { EventForm } from '../../../components/events/EventForm';
import { BudgetContributeDialog } from '../../../components/events/BudgetContributeDialog';
import { ReportGenerator } from '../../../components/reports/ReportGenerator';
import { ReportCard } from '../../../components/reports/ReportCard';
import { ExpertTipCard } from '../../../components/reports/ExpertTipCard';
import { BenchmarkChart } from '../../../components/reports/BenchmarkChart';
import { AIPredictionCard } from '../../../components/reports/AIPredictionCard';
import { MoroccanEvent, Report } from '../../../types';
import { Calendar, BookOpen, Sparkles, Plus, PlusCircle, HelpCircle, FileText } from 'lucide-react';
import { Language, getTranslation } from '../../../lib/i18n';

interface ReportsPageProps {
  language: Language;
}

export default function ReportsPage({ language }: ReportsPageProps) {
  const { user, profile } = useAuth();
  const userId = user?.id || "mock-user-id-9999";
  const userTier = profile?.subscription_tier || 'free';

  // Moroccan events hooks
  const {
    events,
    loading: eventsLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    contributeToEvent,
    duplicateEvent,
    getDaysRemaining,
    getEventStatus
  } = useMoroccanEvents(userId);

  // PDF reports hook
  const {
    reports,
    loading: reportsLoading,
    generateReport,
    deleteReport,
    simulatePDFDownload
  } = useReports(userId);

  // AI insights hook
  const { aiResults, loading: aiLoading } = useAIInsights(userId, language);

  const [isGenerating, setIsGenerating] = useState(false);

  // Page active tabs for dividing Events from PDF archives
  const [activeTab, setActiveTab] = useState<'events' | 'pdf'>('events');

  // UI state overlays
  const [selectedEvent, setSelectedEvent] = useState<MoroccanEvent | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MoroccanEvent | undefined>(undefined);
  const [showContributeDialog, setShowContributeDialog] = useState<MoroccanEvent | null>(null);

  // Form submission helpers
  const handleCreateOrUpdateEvent = async (data: any) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      await createEvent(data);
    }
    setShowEventForm(false);
    setEditingEvent(undefined);
  };

  const handleContribute = async (amount: number) => {
    if (showContributeDialog) {
      await contributeToEvent(showContributeDialog.id, amount);
      setShowContributeDialog(null);
    }
  };

  const handleGenerateReportSubmit = async (config: {
    type: 'monthly' | 'quarterly' | 'annual';
    periodName: string;
    sections: string[];
    format: 'pdf' | 'excel' | 'csv';
  }) => {
    setIsGenerating(true);
    // Prepare data summary
    const summary = {
      totalIncome: 14500,
      totalExpense: 9200,
      savingsRate: 36.5,
      healthScore: aiResults?.healthScore || 78,
      sections: config.sections,
      periodName: config.periodName,
      format: config.format
    };

    setTimeout(async () => {
      await generateReport(config.type, summary);
      setIsGenerating(false);
      alert(`Votre rapport d'analyse financière (${config.type}) a été généré avec succès !`);
    }, 2000);
  };

  const handleExpertActionClick = (key: string) => {
    alert(`Action d'optimisation intelligente lancée pour : ${key}`);
  };

  return (
    <PlanGate requiredTier="family">
      <div className="space-y-6 font-sans">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BookOpen className="text-emerald-600 w-5 h-5" />
              <span>Al-Mounassabat & Taqarir (Événements & Rapports)</span>
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              Anticipez les fêtes traditionnelles marocaines, gérez les profils de budget de saison et éditez vos synthèses financières.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-black uppercase tracking-wider border border-slate-200">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'events' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Fêtes & Saisons
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === 'pdf' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Rapports PDF & IA
            </button>
          </div>
        </div>

        {/* 1. Moroccan Events tab view */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            
            {/* Seasonal Budget switch profiles panel */}
            <SeasonalProfilesManager />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Timeline list of all upcoming events */}
              <div className="lg:col-span-2 space-y-4">
                <EventsCalendar
                  events={events}
                  getDaysRemaining={getDaysRemaining}
                  getEventStatus={getEventStatus}
                  onCreateNew={() => {
                    setEditingEvent(undefined);
                    setShowEventForm(true);
                  }}
                  onSelectEvent={setSelectedEvent}
                />
              </div>

              {/* Sidebar item: details card for selected event */}
              <div className="space-y-6">
                <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Détail de l'enveloppe
                </span>

                {selectedEvent ? (
                  <EventProgressCard
                    event={selectedEvent}
                    getDaysRemaining={getDaysRemaining}
                    onContribute={setShowContributeDialog}
                    onDuplicate={duplicateEvent}
                    onEdit={(ev) => {
                      setEditingEvent(ev);
                      setShowEventForm(true);
                    }}
                    onDelete={deleteEvent}
                  />
                ) : events.length > 0 ? (
                  <div 
                    onClick={() => setSelectedEvent(events[0])}
                    className="bg-white border border-slate-200 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500/50 transition-all space-y-2 py-10 shadow-sm"
                  >
                    <Calendar className="w-8 h-8 text-emerald-500/40 mx-auto animate-pulse" />
                    <p className="text-xs font-black text-slate-700">Sélectionnez une fête dans la liste</p>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Cliquez sur n'importe quel événement à gauche pour suivre la progression de sa cagnotte, modifier son budget ou verser des contributions.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-bold italic">Aucun événement planifié.</p>
                )}

                {/* Cultural Help guide */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100 p-5 rounded-2xl space-y-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    Cagnottes Familiales
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                    Les fêtes au Maroc (Ramadan, Aïd) engendrent des pics de dépenses temporaires significatifs. Le secret de la sérénité réside dans l'épargne progressive : versez 200 ou 300 DH par mois tout au long de l'année dans chaque cagnotte pour lisser vos coûts.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. Executive PDF reports tab view */}
        {activeTab === 'pdf' && (
          <div className="space-y-6">
            {/* AI Diagnostics & Predictions Panel */}
            {aiResults && (
              <AIPredictionCard
                score={aiResults.healthScore}
                projection={aiResults.potential12mSavings}
                anomalies={aiResults.anomalies}
                suggestions={aiResults.suggestions}
                onActionClick={handleExpertActionClick}
              />
            )}

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Benchmark chart */}
                {aiResults?.benchmarks && (
                  <BenchmarkChart data={aiResults.benchmarks} />
                )}

                {/* Historical Reports compilation */}
                <div className="border border-slate-150 rounded-2xl bg-white p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Historique des Audits de Performance
                  </h4>

                  <div className="space-y-2.5">
                    {reportsLoading ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-bold">Chargement des rapports...</div>
                    ) : reports.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-150 rounded-2xl text-xs text-slate-400 font-bold">
                        Aucun audit n'a encore été compilé. Remplissez le formulaire de droite pour commencer.
                      </div>
                    ) : (
                      reports.map((report) => (
                        <div key={report.id}>
                          <ReportCard
                            report={report}
                            onDownload={simulatePDFDownload}
                            onDelete={(id) => { deleteReport(id); }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* 5-Step Wizard builder */}
                <ReportGenerator
                  onGenerate={handleGenerateReportSubmit}
                  isGenerating={isGenerating}
                />

                {/* Expert tip cards */}
                <ExpertTipCard
                  category="Épargne trimestrielle"
                  title="Constituer Dakira progressivement"
                  content="Vos sandoqs révèlent une fluctuation de masrouf d'environ 15% le week-end. Augmentez votre épargne de sécurité automatique de 150 DH pour parer aux imprévus de l'Aïd."
                  onApply={() => handleExpertActionClick('dakira_booster')}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL overlay: Add / Edit Event form */}
        {showEventForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-xl">
              <EventForm
                event={editingEvent}
                onSave={handleCreateOrUpdateEvent}
                onCancel={() => {
                  setShowEventForm(false);
                  setEditingEvent(undefined);
                }}
              />
            </div>
          </div>
        )}

        {/* MODAL overlay: Contribute To Event savings budget */}
        {showContributeDialog && (
          <BudgetContributeDialog
            event={showContributeDialog}
            onConfirm={handleContribute}
            onCancel={() => setShowContributeDialog(null)}
          />
        )}

      </div>
    </PlanGate>
  );
}
