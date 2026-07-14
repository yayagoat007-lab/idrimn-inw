import React from 'react';

interface ReactionBarProps {
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
}

export function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const emojis = ['👍', '❤️', '🎉', '🔥', '💡'];

  return (
    <div className="flex flex-wrap gap-2 py-2 items-center" id="reaction-bar">
      {emojis.map((emoji) => {
        const count = reactions[emoji] || 0;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              count > 0 
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-100 shadow-3xs' 
                : 'bg-slate-50/50 hover:bg-slate-50 text-slate-400 border border-transparent'
            }`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {count > 0 && (
              <span className="font-mono text-[10px] text-slate-500">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
