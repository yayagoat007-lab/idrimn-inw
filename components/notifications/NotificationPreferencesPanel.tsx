import React from 'react';
import { Moon, Bell, Mail, MessageSquare, ShieldAlert, Sparkles, Trophy, Users, Settings, Clock } from 'lucide-react';
import { NotificationPreferences } from '../../hooks/use-notification-center';
import { Language } from '../../lib/i18n';

interface NotificationPreferencesPanelProps {
  preferences: NotificationPreferences;
  onUpdatePreferences: (prefs: Partial<NotificationPreferences>) => void;
  language: Language;
}

export function NotificationPreferencesPanel({
  preferences,
  onUpdatePreferences,
  language
}: NotificationPreferencesPanelProps) {
  
  // Translation Helper
  const t = {
    fr: {
      quietSection: "Mode Sommeil (Heures Silencieuses)",
      quietDesc: "Met en sourdine toutes les alertes non-urgentes pendant les heures choisies pour préserver votre paix d'esprit.",
      quietEnable: "Activer les heures silencieuses",
      quietStart: "Heure de début",
      quietEnd: "Heure de fin",
      categoriesSection: "Catégories de notifications",
      categoriesDesc: "Cochez les types de messages que vous souhaitez recevoir sur l'application.",
      channelsSection: "Canaux de réception",
      channelsDesc: "Activez les canaux de communication via lesquels vous souhaitez recevoir vos alertes.",
      saveSuccess: "Préférences mises à jour !",
      
      catFinance: "Finance & Alertes Budgétaires",
      catFinanceDesc: "Dépassements de sandoq, contributions Daret, alertes de solde.",
      catSidi: "Optimisations Sidi Floussi AI",
      catSidiDesc: "Recommandations proactives, conseils personnalisés d'épargne.",
      catGami: "Récompenses & Académie",
      catGamiDesc: "Déblocage de badges, gains de points XP, réussite d'examens.",
      catSocial: "Social & Entraide",
      catSocialDesc: "Invitations de membres de famille, posts d'entraide.",
      catSystem: "Mises à jour système",
      catSystemDesc: "Alertes de synchronisation, rapports prêts, sécurité.",

      chanPush: "Notifications Push",
      chanPushDesc: "Alertes directes sur votre appareil mobile ou ordinateur.",
      chanEmail: "Alertes par Email",
      chanEmailDesc: "Rapports hebdomadaires, alertes de sécurité.",
      chanSms: "Rapports par SMS",
      chanSmsDesc: "Alertes critiques instantanées sur votre téléphone."
    },
    darija: {
      quietSection: "Trankil (Waqt n-N3ass)",
      quietDesc: "Hiyyed koll l-tanbihat l-3adiya f had l-weqt bach tkon trankil.",
      quietEnable: "Khdem s-Silance",
      quietStart: "Weqt l-bdaya",
      quietEnd: "Weqt n-nhaya",
      categoriesSection: "Anwa3 d-tanbih",
      categoriesDesc: "Khtar l-messages li bghiti twsal bihom f l-app.",
      channelsSection: "Toroq d-tanbih",
      channelsDesc: "Khdem l-blasa mnin bghiti ijiwk l-alertes.",
      saveSuccess: "T-bdel mzyan !",

      catFinance: "Maly o Tanbihat d-Sandoq",
      catFinanceDesc: "Mizaniya saylat, daret, alertes d-flous.",
      catSidi: "Nsayah Sidi Floussi AI",
      catSidiDesc: "Nsayah d-iddikhar o t-tadbira mn 3and Sidi.",
      catGami: "Badges o l-Academie",
      catGamiDesc: "Badges jdad, d-dourous, o points XP.",
      catSocial: "Aila o n-Nas",
      catSocialDesc: "Inviyations d-l'Aila o l-moussa3ada.",
      catSystem: "System d-App",
      catSystemDesc: "Synchronisation d-data, rapors, securite.",

      chanPush: "Tanbihat f-Telephone (Push)",
      chanPushDesc: "Alertes directes f t-telephone dialek.",
      chanEmail: "Tanbihat f l-Email",
      chanEmailDesc: "Rapors dial s-smana o l-amen.",
      chanSms: "Tanbihat f l-SMS",
      chanSmsDesc: "Alertes d-flous mzyanin f s-sms dialek."
    }
  }[language];

  const handleToggleCategory = (catKey: string) => {
    const categoriesEnabled = { ...preferences.categoriesEnabled };
    categoriesEnabled[catKey] = !categoriesEnabled[catKey];
    onUpdatePreferences({ categoriesEnabled });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6">
      {/* 1. Quiet Hours Sommeil section */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Moon size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
              {t.quietSection}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              {t.quietDesc}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100/60 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold text-slate-800">{t.quietEnable}</span>
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => onUpdatePreferences({ quietHoursEnabled: e.target.checked })}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
            />
          </label>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={11} />
                  <span>{t.quietStart}</span>
                </label>
                <select
                  value={preferences.quietHoursStart}
                  onChange={(e) => onUpdatePreferences({ quietHoursStart: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                >
                  {hours.map(h => (
                    <option key={h} value={h}>
                      {h}h00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={11} />
                  <span>{t.quietEnd}</span>
                </label>
                <select
                  value={preferences.quietHoursEnd}
                  onChange={(e) => onUpdatePreferences({ quietHoursEnd: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                >
                  {hours.map(h => (
                    <option key={h} value={h}>
                      {h}h00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Categories Toggles Section */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            {t.categoriesSection}
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {t.categoriesDesc}
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
          {/* Urgent Finance */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl flex-shrink-0 mt-0.5">
                <ShieldAlert size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.catFinance}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.catFinanceDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.categoriesEnabled?.urgent_financial ?? true}
              onChange={() => handleToggleCategory('urgent_financial')}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* Sidi Advice */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.catSidi}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.catSidiDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.categoriesEnabled?.sidi ?? true}
              onChange={() => handleToggleCategory('sidi')}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* Gamification */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0 mt-0.5">
                <Trophy size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.catGami}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.catGamiDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.categoriesEnabled?.gamification ?? true}
              onChange={() => handleToggleCategory('gamification')}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* Social */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 mt-0.5">
                <Users size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.catSocial}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.catSocialDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.categoriesEnabled?.social ?? true}
              onChange={() => handleToggleCategory('social')}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* System */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-xl flex-shrink-0 mt-0.5">
                <Settings size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.catSystem}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.catSystemDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.categoriesEnabled?.system ?? true}
              onChange={() => handleToggleCategory('system')}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* 3. Channels Section */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
            {t.channelsSection}
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            {t.channelsDesc}
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
          {/* Push Channel */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0 mt-0.5">
                <Bell size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.chanPush}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.chanPushDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channelPush}
              onChange={(e) => onUpdatePreferences({ channelPush: e.target.checked })}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* Email Channel */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-xl flex-shrink-0 mt-0.5">
                <Mail size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.chanEmail}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.chanEmailDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channelEmail}
              onChange={(e) => onUpdatePreferences({ channelEmail: e.target.checked })}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>

          {/* SMS Channel */}
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0 mt-0.5">
                <MessageSquare size={16} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{t.chanSms}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{t.chanSmsDesc}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.channelSms}
              onChange={(e) => onUpdatePreferences({ channelSms: e.target.checked })}
              className="w-8 h-4 bg-slate-200 checked:bg-emerald-600 rounded-full appearance-none relative transition-colors cursor-pointer before:content-[''] before:absolute before:w-3 before:h-3 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform mt-1.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
