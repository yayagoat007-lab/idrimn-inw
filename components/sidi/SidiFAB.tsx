import React, { useState, useEffect } from 'react';
import { useSidiProactive } from '../../hooks/use-sidi-proactive';
import { SidiAvatar } from './SidiAvatar';
import { SidiChatWindow } from './SidiChatWindow';
import { X, Sparkles } from 'lucide-react';

export function SidiFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { pendingProactiveMessages, dismissProactiveMessage } = useSidiProactive();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-sidi-chat', handleOpen);
    return () => {
      window.removeEventListener('open-sidi-chat', handleOpen);
    };
  }, []);

  // If there are unread proactive messages, we'll show a badge count
  const badgeCount = pendingProactiveMessages.length;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3" id="sidi-fab-outer-container">
        {/* Proactive Toasts/Alerts stack popping up above the FAB */}
        {badgeCount > 0 && !isOpen && (
          <div className="flex flex-col gap-2 max-w-[280px] md:max-w-[320px] items-end" id="sidi-proactive-stack">
            {pendingProactiveMessages.map((msg) => (
              <div
                key={msg.id}
                id={`proactive-toast-${msg.id}`}
                className="bg-white border border-slate-100 shadow-xl rounded-xl p-3 flex gap-3 items-start animate-bounce text-left relative overflow-hidden group"
              >
                {/* Visual indicator bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    msg.type === 'warning' ? 'bg-amber-500' : msg.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                />

                <SidiAvatar size={28} mood={msg.type === 'warning' ? 'worried' : 'neutral'} />

                <div className="flex-1 pr-4">
                  <h4 className="text-[11px] font-black text-slate-800 leading-tight flex items-center gap-1">
                    {msg.title}
                    <Sparkles size={10} className="text-amber-500 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                    {msg.message}
                  </p>

                  {/* Actions associated with the proactive rule */}
                  {msg.actionLabel && (
                    <button
                      id={`toast-action-${msg.id}`}
                      onClick={() => {
                        setIsOpen(true);
                        // Clicking open or trigger is managed nicely
                      }}
                      className="mt-1.5 text-[9px] font-black text-emerald-600 hover:text-emerald-700 tracking-wider uppercase block"
                    >
                      {msg.actionLabel} →
                    </button>
                  )}
                </div>

                {/* Dismiss Button */}
                <button
                  id={`dismiss-toast-${msg.id}`}
                  onClick={() => dismissProactiveMessage(msg.id)}
                  title="Fermer"
                  className="p-1 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* The FAB Trigger Circle */}
        <button
          id="sidi-fab-trigger"
          data-tour-id="sidi-fab"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 hover:rotate-12 hover:scale-110 shadow-2xl flex items-center justify-center transition-all duration-300 focus:outline-none group border border-emerald-500/30"
        >
          {/* Pulsing halo indicator if notifications are active */}
          {badgeCount > 0 && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-25" />
          )}

          {/* Sidi Face Avatar as the FAB Icon */}
          <SidiAvatar
            mood={badgeCount > 0 ? 'worried' : 'neutral'}
            size={52}
            className="rounded-full shadow-inner"
          />

          {/* Badge Alert Count indicator */}
          {badgeCount > 0 && (
            <div
              id="sidi-fab-badge-count"
              className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-pulse"
            >
              {badgeCount}
            </div>
          )}
        </button>
      </div>

      {/* Sidi Chat Panel Window */}
      {isOpen && (
        <SidiChatWindow onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
export default SidiFAB;
