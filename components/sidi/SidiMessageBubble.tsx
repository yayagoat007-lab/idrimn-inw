import React from 'react';
import { SidiMessage } from '../../hooks/use-sidi-chat';
import { SidiAvatar } from './SidiAvatar';
import { BillPaymentForm } from '../wallet/BillPaymentForm';
import { RechargeForm } from '../wallet/RechargeForm';

interface SidiMessageBubbleProps {
  message: SidiMessage;
  onActionButtonClick: (payload: Record<string, any>) => void;
  language: 'fr' | 'darija';
}

export function SidiMessageBubble({ message, onActionButtonClick, language }: SidiMessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isFormMessage = message.intentId === 'pay_bill_via_sidi' || message.intentId === 'recharge_via_sidi';
  
  // Choose Sidi's avatar mood based on intent category or words
  const getAvatarMood = (): 'neutral' | 'happy' | 'worried' => {
    if (isUser) return 'neutral';
    const id = message.intentId || "";
    if (id === 'add_income' || id === 'praise_sidi' || id === 'joke_request') {
      return 'happy';
    }
    if (id === 'add_expense' || id === 'fallback') {
      const textLower = message.text.toLowerCase();
      if (textLower.includes("hchouma") || textLower.includes("attention") || textLower.includes("déduit") || textLower.includes("gouffres")) {
        return 'worried';
      }
    }
    return 'neutral';
  };

  // Format local timestamp nicely
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  return (
    <div
      className={`flex items-start gap-2.5 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      id={`msg-bubble-${message.id}`}
    >
      {/* Sidi's Avatar on the left */}
      {!isUser && (
        <SidiAvatar mood={getAvatarMood()} size={36} className="mt-0.5 border border-slate-200 rounded-full" />
      )}

      {/* Message Bubble Container */}
      <div className={`flex flex-col ${isFormMessage ? 'w-full max-w-[90%]' : 'max-w-[75%]'} ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm border ${
            isUser
              ? 'bg-emerald-600 border-emerald-700 text-white rounded-tr-none'
              : 'bg-white border-slate-100 text-slate-800 rounded-tl-none'
          }`}
        >
          {/* Main message text */}
          <p className="whitespace-pre-line">{message.text}</p>

          {/* Embedded Forms */}
          {message.intentId === 'pay_bill_via_sidi' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
              <BillPaymentForm language={language} onSuccess={() => {}} />
            </div>
          )}

          {message.intentId === 'recharge_via_sidi' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
              <RechargeForm language={language} onSuccess={() => {}} />
            </div>
          )}

          {/* Quick Buttons/Actions inside bubble */}
          {message.quickButtons && message.quickButtons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3" id={`quick-actions-${message.id}`}>
              {message.quickButtons.map((btn, idx) => (
                <button
                   key={idx}
                   id={`action-btn-${idx}`}
                   onClick={() => onActionButtonClick(btn.payload)}
                   className="px-3 py-1.5 text-[10px] font-black tracking-wide uppercase rounded-lg bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[9px] font-mono font-medium text-slate-400 mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
export default SidiMessageBubble;
