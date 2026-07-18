import React, { useState, useEffect } from 'react';
import { useStorageHealth } from '../../hooks/use-storage-health';
import { useBackupRestore } from '../../hooks/use-backup-restore';
import { X, Trash2, ShieldAlert, Sparkles, Database, Check, RefreshCw, Key } from 'lucide-react';

interface StorageCleanupModalProps {
  userId: string;
  language: 'fr' | 'darija';
  onClose: () => void;
}

export default function StorageCleanupModal({ userId, language, onClose }: StorageCleanupModalProps) {
  const {
    cleanupCandidates,
    executeCleanup,
    isCleaning,
    refreshHealth
  } = useStorageHealth(userId, language);

  const {
    createBackup,
    isCreatingBackup,
    lastBackupDate
  } = useBackupRestore(userId);

  // States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [backupPassword, setBackupPassword] = useState('');
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [backupErrorMessage, setBackupErrorMessage] = useState<string | null>(null);
  const [cleanupSuccess, setCleanupSuccess] = useState<string | null>(null);

  // Auto-select all candidates by default
  useEffect(() => {
    setSelectedIds(cleanupCandidates.map(c => c.id));
  }, [cleanupCandidates]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cleanupCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cleanupCandidates.map(c => c.id));
    }
  };

  // Check if backup is missing
  const hasNoRecentBackup = !lastBackupDate;

  // Handle instant backup
  const handleQuickBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupSuccessMessage(null);
    setBackupErrorMessage(null);

    if (!backupPassword) {
      setBackupErrorMessage(language === 'darija' ? "Dkhkhil l-password d backup" : "Veuillez entrer un mot de passe pour chiffrer la sauvegarde.");
      return;
    }

    const success = await createBackup(backupPassword);
    if (success) {
      setBackupSuccessMessage(
        language === 'darija' 
          ? "T-dar l-backup b najah ! Téléchargé safi. ✨" 
          : "Sauvegarde créée et téléchargée avec succès ! Vous pouvez maintenant nettoyer en toute sécurité. ✨"
      );
      setBackupPassword('');
    } else {
      setBackupErrorMessage(
        language === 'darija'
          ? "Khata2 f create l-backup."
          : "Erreur lors de la création de la sauvegarde."
      );
    }
  };

  const handleRunCleanup = async () => {
    if (selectedIds.length === 0) return;
    
    setCleanupSuccess(null);
    const result = await executeCleanup(selectedIds);
    
    const freedKB = Math.round(result.bytesFreed / 1024);
    setCleanupSuccess(
      language === 'darija'
        ? `Safi ! T-mseh l-m3loumat o t-khwat ${freedKB} KB dyal l-blassa. 🧹`
        : `Nettoyage réussi ! ${freedKB} Ko ont été libérés avec succès de votre stockage local. 🧹`
    );
    
    // Refresh candidates
    refreshHealth();
    setSelectedIds([]);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Ko';
    return `${(bytes / 1024).toFixed(1)} Ko`;
  };

  const totalFreedEstimated = cleanupCandidates
    .filter(c => selectedIds.includes(c.id))
    .reduce((sum, c) => sum + c.estimatedBytesFreed, 0);

  const t = {
    title: language === 'darija' ? "Tandif l-Khazna" : "Nettoyage du stockage local",
    subtitle: language === 'darija' ? "Khtar achno bghiti t-mseh bach t-khwi l-blassa" : "Sélectionnez les éléments à nettoyer pour libérer de l'espace",
    selectAll: language === 'darija' ? "Khtar Kolchi" : "Tout sélectionner",
    deselectAll: language === 'darija' ? "Hyed Kolchi" : "Tout désélectionner",
    estimatedFreed: language === 'darija' ? "L-Massa7a l-Mo9addara" : "Espace estimé libéré",
    cleanBtn: language === 'darija' ? "Mseh l-m3loumat l-mousstakhdama" : "Supprimer la sélection définitivement",
    closeBtn: language === 'darija' ? "Rje3" : "Fermer",
    emptyState: language === 'darija' ? "Khazna dyalk n9iya ! Ma kayn walou msselak t-naddaf." : "Aucun candidat au nettoyage détecté. Votre stockage est déjà optimisé.",
    backupFirstTitle: language === 'darija' ? "Recommandé : Dir Backup s-Sada9a ! 🛡️" : "Recommandé : Sauvegarder d'abord ! 🛡️",
    backupFirstDesc: language === 'darija'
      ? "Nta ma 3ndekch backup s-Settings. Bach t-fada l-khassara, dir backup chiffré dyal m3loumat dyalk."
      : "Vous n'avez pas créé de sauvegarde récente. Pour éviter toute perte accidentelle, téléchargez un fichier de sauvegarde (.floussi-backup) chiffré maintenant.",
    passwordPlaceholder: language === 'darija' ? "Koud dyal l-backup (Min 4 chars)" : "Mot de passe de l'archive (min. 4 car.)",
    backupBtn: language === 'darija' ? "Sauvegarder et Télécharger 📥" : "Sauvegarder et Télécharger 📥",
    dangerZone: language === 'darija' ? "Tanbih Amân" : "Zone de Sécurité & Prévention"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative bg-white border border-slate-100 rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-50 shrink-0 flex items-start justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 leading-none">{t.title}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-2">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Success / Alert Messages */}
          {cleanupSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">{cleanupSuccess}</p>
            </div>
          )}

          {/* Backup recommendations block */}
          {hasNoRecentBackup && !cleanupSuccess && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <ShieldAlert size={18} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-900 leading-none">{t.backupFirstTitle}</h4>
                  <p className="text-[11px] font-medium text-amber-800 leading-normal mt-1.5">{t.backupFirstDesc}</p>
                </div>
              </div>

              <form onSubmit={handleQuickBackup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-amber-500">
                    <Key size={14} />
                  </div>
                  <input
                    type="password"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-9 pr-4 py-2 bg-white/80 border border-amber-200 rounded-xl text-xs font-medium text-amber-950 placeholder-amber-600/50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreatingBackup || !backupPassword}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isCreatingBackup ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Database size={14} />
                  )}
                  <span>{t.backupBtn}</span>
                </button>
              </form>

              {backupSuccessMessage && (
                <p className="text-[10px] font-bold text-emerald-700">{backupSuccessMessage}</p>
              )}
              {backupErrorMessage && (
                <p className="text-[10px] font-bold text-rose-700">{backupErrorMessage}</p>
              )}
            </div>
          )}

          {/* List of Cleanup candidates */}
          {cleanupCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                <Check size={24} />
              </div>
              <p className="text-xs font-bold text-slate-500 max-w-sm">{t.emptyState}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {cleanupCandidates.length} suggestions
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800"
                >
                  {selectedIds.length === cleanupCandidates.length ? t.deselectAll : t.selectAll}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {cleanupCandidates.map((candidate) => {
                  const isSelected = selectedIds.includes(candidate.id);
                  const isCriticalData = candidate.category === 'core_data';
                  
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => toggleSelect(candidate.id)}
                      className={`p-4 border rounded-2xl flex items-start gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-100 bg-indigo-50/20' 
                          : 'border-slate-100/70 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-slate-200 bg-white'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            candidate.action === 'recompress' 
                              ? 'bg-sky-50 text-sky-700 border border-sky-100' 
                              : candidate.action === 'archive'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}>
                            {candidate.action}
                          </span>
                          {isCriticalData && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                              {language === 'darija' ? "Muhim bzzaf" : "Données critiques"}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-700 leading-normal">
                          {language === 'darija' ? candidate.description.darija : candidate.description.fr}
                        </p>
                      </div>

                      {/* Estimations */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-indigo-600">
                          -{formatBytes(candidate.estimatedBytesFreed)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safety / Disclaimer */}
          <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 flex gap-3">
            <ShieldAlert size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{t.dangerZone}</h5>
              <p className="text-[10px] font-medium text-slate-500 leading-normal">
                {language === 'darija'
                  ? "Ga3 ma ghadi i-t-mseh chi m3loumat maliya (bhal l-mu3amalat wla l-buckets) bla ma t-kked lina explicite d l'utilisateur. L-mu3amalat s-safya tab9a kamla."
                  : "Aucune suppression de données financières clés (transactions, budgets, tontines) ne s'effectue sans votre confirmation explicite. Seules les données superflues ou les pièces jointes archivées seront modifiées."}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50 shrink-0 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.estimatedFreed}</p>
            <p className="text-xl font-black text-indigo-600">
              {formatBytes(totalFreedEstimated)}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black rounded-xl transition-all cursor-pointer"
            >
              {t.closeBtn}
            </button>
            <button
              disabled={isCleaning || selectedIds.length === 0}
              onClick={handleRunCleanup}
              className="flex-2 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCleaning ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>{t.cleanBtn}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
