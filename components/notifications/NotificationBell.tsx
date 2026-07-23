import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationCenter } from '../../hooks/use-notification-center';
import { NotificationCenterPanel } from './NotificationCenterPanel';
import { Language } from '../../lib/i18n';

interface NotificationBellProps {
  userId?: string;
  language: Language;
  onNavigate: (route: string) => void;
}

export function NotificationBell({ userId, language, onNavigate }: NotificationBellProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    notificationPreferences,
    updatePreferences
  } = useNotificationCenter(userId);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      {/* The actual bell button in Header */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center"
        aria-label={language === 'darija' ? "Tanbihat" : "Notifications"}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white animate-fade-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Main Drawer Panel */}
      <NotificationCenterPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        deleteNotification={deleteNotification}
        onNavigate={onNavigate}
        language={language}
        preferences={notificationPreferences}
        onUpdatePreferences={updatePreferences}
      />
    </>
  );
}

export default NotificationBell;
