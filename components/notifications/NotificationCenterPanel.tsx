import React, { useState } from 'react';
import { X, Check, Trash2, ShieldAlert, Sparkles, Trophy, Users, Info, Settings, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FloussiNotification, categorizeNotification } from '../../lib/notification-hub';
import { NotificationPreferences } from '../../hooks/use-notification-center';
import { NotificationPreferencesPanel } from './NotificationPreferencesPanel';

interface NotificationCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: FloussiNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  onNavigate: (route: string) => void;
  language: 'fr' | 'darija';
  preferences: NotificationPreferences;
  onUpdatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

const CATEGORIES = [
  { id: 'all', fr: 'Tout', darija: 'Kollchi', icon: Info, color: 'text-slate-600 bg-slate-50 border-slate-100' },
  { id: 'urgent_financial', fr: 'Finance & Alertes', darija: 'Mali & Tanbihat', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { id: 'sidi', fr: 'Conseils Sidi', darija: 'Nsayah Sidi', icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'gamification', fr: 'Récompenses', darija: 'Jawaiz', icon: Trophy, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'social', fr: 'Social', darija: 'Ijtimai', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'system', fr: 'Système', darija: 'System', icon: Settings, color: 'text-slate-600 bg-slate-50 border-slate-100' },
];

export function NotificationCenterPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  onNavigate,
  language,
  preferences,
  onUpdatePreferences,
}: NotificationCenterPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  const filteredNotifs = notifications.filter(n => {
    const category = categorizeNotification(n);
    if (selectedCategory === 'all') return true;
    return category === selectedCategory;
  });

  // Date Grouping Helper
  const groupNotifications = () => {
    const today: FloussiNotification[] = [];
    const yesterday: FloussiNotification[] = [];
    const thisWeek: FloussiNotification[] = [];
    const older: FloussiNotification[] = [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    filteredNotifs.forEach(n => {
      const nDate = new Date(n.timestamp);
      const nDateStr = n.timestamp.split('T')[0];

      if (nDateStr === todayStr) {
        today.push(n);
      } else if (nDateStr === yesterdayStr) {
        yesterday.push(n);
      } else if (nDate > oneWeekAgo) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const groups = groupNotifications();

  const getCategoryDetails = (notif: FloussiNotification) => {
    const cat = categorizeNotification(notif);
    return CATEGORIES.find(c => c.id === cat) || CATEGORIES[0];
  };

  const handleNotificationClick = (notif: FloussiNotification) => {
    markAsRead(notif.id);
    if (notif.actionPayload && notif.actionPayload.targetPage) {
      onNavigate(notif.actionPayload.targetPage);
      onClose();
    }
  };

  // Translations dictionary
  const t = {
    fr: {
      title: "Centre de Notifications",
      emptyState: "Aucune notification dans cette catégorie",
      markAllRead: "Tout marquer lu",
      settings: "Réglages",
      today: "Aujourd'hui",
      yesterday: "Hier",
      thisWeek: "Cette semaine",
      older: "Plus ancien",
      swipeToDelete: "Faites glisser vers la gauche pour supprimer",
      unreadBadge: "non lues",
      prefsTitle: "Préférences d'Alertes",
    },
    darija: {
      title: "Tanbihat",
      emptyState: "Hatta tanbih f had l-category",
      markAllRead: "Kollchi qraya",
      settings: "Tadabir",
      today: "L-Youm",
      yesterday: "L-Bareh",
      thisWeek: "Had l-smana",
      older: "Qdim",
      swipeToDelete: "Jor l-issar bach tmseh",
      unreadBadge: "ma qraytch",
      prefsTitle: "Tadabir d-Tanbih",
    }
  }[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-100"
          >
            {showPreferences ? (
              /* Preferences Panel View */
              <>
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowPreferences(false)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {t.prefsTitle}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <NotificationPreferencesPanel
                    preferences={preferences}
                    onUpdatePreferences={onUpdatePreferences}
                    language={language}
                  />
                </div>
              </>
            ) : (
              /* Standard Notification Center View */
              <>
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {t.title}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={t.settings}
                    >
                      <Settings size={18} />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                {notifications.length > 0 && (
                  <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100/50 flex items-center justify-between text-xs">
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold tracking-tight cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{t.markAllRead}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {t.swipeToDelete}
                    </span>
                  </div>
                )}

                {/* Category Filter Chips */}
                <div className="px-6 py-4 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-100 flex-shrink-0">
                  {CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{language === 'darija' ? cat.darija : cat.fr}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {filteredNotifs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                        <Info size={22} className="text-slate-300" />
                      </div>
                      <p className="text-xs font-bold leading-relaxed">{t.emptyState}</p>
                    </div>
                  ) : (
                    Object.entries(groups).map(([groupKey, list]) => {
                      if (list.length === 0) return null;
                      const headerTitle = {
                        today: t.today,
                        yesterday: t.yesterday,
                        thisWeek: t.thisWeek,
                        older: t.older,
                      }[groupKey as 'today' | 'yesterday' | 'thisWeek' | 'older'];

                      return (
                        <div key={groupKey} className="space-y-2">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-1 flex items-center justify-between">
                            <span>{headerTitle}</span>
                            <span className="font-medium lowercase">({list.length})</span>
                          </h4>
                          <div className="space-y-2">
                            <AnimatePresence initial={false}>
                              {list.map(notif => {
                                const details = getCategoryDetails(notif);
                                const CategoryIcon = details.icon;

                                return (
                                  <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    drag="x"
                                    dragDirectionLock
                                    dragConstraints={{ left: -120, right: 0 }}
                                    dragElastic={{ left: 0.15, right: 0 }}
                                    onDragEnd={(e, info) => {
                                      if (info.offset.x < -80) {
                                        deleteNotification(notif.id);
                                      }
                                    }}
                                    className="relative overflow-hidden bg-white border border-slate-100 rounded-xl shadow-xs cursor-pointer group hover:border-slate-200 transition-all active:scale-98"
                                  >
                                    {/* Swipe Behind Trash Background */}
                                    <div className="absolute inset-0 bg-rose-50 flex items-center justify-end px-5 pointer-events-none z-0">
                                      <div className="flex flex-col items-center gap-1 text-rose-600">
                                        <Trash2 size={16} className="animate-bounce" />
                                        <span className="text-[8px] font-black tracking-widest uppercase">Mseh</span>
                                      </div>
                                    </div>

                                    {/* Main Card Content */}
                                    <motion.div
                                      onClick={() => handleNotificationClick(notif)}
                                      className="relative z-10 bg-white p-4 flex gap-3 items-start border-l-4 border-l-transparent transition-colors group-hover:bg-slate-50/40"
                                      style={{
                                        borderLeftColor: notif.priority === 'urgent' ? '#f43f5e' : notif.priority === 'important' ? '#f59e0b' : '#10b981'
                                      }}
                                    >
                                      {/* Icon */}
                                      <div className={`p-2 rounded-xl flex-shrink-0 ${details.color}`}>
                                        <CategoryIcon size={16} />
                                      </div>

                                      {/* Text details */}
                                      <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center justify-between gap-1.5">
                                          <p className={`text-xs font-black truncate ${notif.isRead ? 'text-slate-600' : 'text-slate-950 font-black'}`}>
                                            {notif.title}
                                          </p>
                                          {!notif.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                          )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-relaxed break-words font-medium">
                                          {notif.message}
                                        </p>

                                        <div className="flex items-center justify-between gap-1 pt-1 text-[9px] text-slate-400 font-bold">
                                          <span>{new Date(notif.timestamp).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'ar-MA', { hour: '2-digit', minute: '2-digit' })}</span>
                                          {notif.actionLabel && (
                                            <span className="text-emerald-600 hover:underline flex items-center gap-0.5 font-extrabold uppercase tracking-wide">
                                              {notif.actionLabel} &rarr;
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Delete manual action */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notif.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all ml-1 cursor-pointer"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </motion.div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default NotificationCenterPanel;
