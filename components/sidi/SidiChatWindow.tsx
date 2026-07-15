import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, HelpCircle } from 'lucide-react';
import { useSidiChat } from '../../hooks/use-sidi-chat';
import { SidiMessageBubble } from './SidiMessageBubble';
import { SidiQuickChips } from './SidiQuickChips';
import { useAuth } from '../../hooks/use-auth';

interface SidiChatWindowProps {
  onClose: () => void;
}

export function SidiChatWindow({ onClose }: SidiChatWindowProps) {
  const { profile } = useAuth();
  const { messages, isTyping, sendMessage, clearHistory, handleCorrection } = useSidiChat();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Check for prefilled messages
  useEffect(() => {
    const prefilled = localStorage.getItem('sidi_prefilled_message');
    if (prefilled) {
      localStorage.removeItem('sidi_prefilled_message');
      const timer = setTimeout(() => {
        sendMessage(prefilled);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [sendMessage]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleChipClick = (text: string) => {
    sendMessage(text);
  };

  // Handles quick action button clicks (like Oui/Non or tip selections)
  const handleActionButtonClick = (payload: Record<string, any>) => {
    const action = payload.action;

    if (action === "activate_seasonal_profile") {
      sendMessage("Oui, active le profil saisonnier s'il te plaît !");
    } else if (action === "dismiss") {
      sendMessage("Non merci, je garde mes enveloppes habituelles.");
    } else if (action === "tip_save_coffee") {
      sendMessage("Comment économiser sur le café ? ☕");
    } else if (action === "tip_avoid_loans") {
      sendMessage("Pourquoi éviter les petits crédits ? 🚫");
    } else if (action === "correct_category") {
      if (handleCorrection) {
        handleCorrection(payload.transactionId, payload.category);
      }
    } else {
      sendMessage("D'accord !");
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full md:w-[420px] bg-slate-900/40 backdrop-blur-sm flex justify-end"
      id="sidi-chat-container"
    >
      {/* Sliding Main Panel */}
      <div
        className="w-full max-w-[420px] bg-white h-full flex flex-col shadow-2xl relative border-l border-slate-100"
        id="sidi-chat-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Fez Head styling badge */}
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-bold text-rose-700">
              🇲🇦
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-none">Sidi Floussi</h3>
              <span className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase mt-0.5 block">
                ● Conseiller Virtuel Serein
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Clear conversation button */}
            <button
              id="clear-chat-history"
              onClick={clearHistory}
              title="Effacer la conversation"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-150 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
            {/* Close Panel Button */}
            <button
              id="close-sidi-chat"
              onClick={onClose}
              title="Fermer"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-150 hover:text-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 bg-slate-50/50"
          id="sidi-chat-scroll-stream"
        >
          {messages.map((msg) => (
            <SidiMessageBubble
              key={msg.id}
              message={msg}
              onActionButtonClick={handleActionButtonClick}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5 mb-4 animate-pulse" id="sidi-typing-indicator">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-sm">
                🇲🇦
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-white border border-slate-100 text-slate-400 text-xs font-semibold">
                Sidi est en train d'écrire
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions Quick Chips */}
        <div className="bg-slate-50/50 pt-2 shrink-0">
          <SidiQuickChips onChipClick={handleChipClick} />
        </div>

        {/* Input Bar Area */}
        <div className="p-3.5 border-t border-slate-100 bg-white shrink-0 flex items-center gap-2">
          <input
            type="text"
            id="sidi-input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écris un message ou dis : sraft 50 DH..."
            className="flex-1 px-4 py-2 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-full transition-colors bg-slate-50/50"
          />
          <button
            id="sidi-send-btn"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-md"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default SidiChatWindow;
