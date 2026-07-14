import React, { useState } from 'react';
import { Comment } from '../../types';
import { Send, MessageSquare, Calendar } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  lang: 'fr' | 'darija';
  onAddComment: (content: string) => void;
}

export function CommentSection({ postId, comments = [], lang, onAddComment }: CommentSectionProps) {
  const [text, setText] = useState('');

  const t = {
    placeholder: lang === 'darija' ? 'Kteb chi ta3liq...' : 'Écrire un commentaire...',
    noComments: lang === 'darija' ? 'Makan ta ta3liq had l-weqt. Kteb l-owl!' : 'Aucun commentaire pour l\'instant. Soyez le premier !',
    submit: lang === 'darija' ? 'Sifat' : 'Envoyer',
    commentsTitle: lang === 'darija' ? 'Ta3liqat' : 'Commentaires'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4" id={`comment-section-${postId}`}>
      
      {/* List of comments */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-[10px] text-slate-400 font-semibold italic flex items-center gap-1.5 py-1">
            <MessageSquare size={12} />
            <span>{t.noComments}</span>
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-50 border border-slate-100/50 rounded-2xl p-3 text-xs leading-normal">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-slate-800 text-[11px]">
                  @{comment.authorAlias}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar size={10} />
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <p className="text-slate-600 font-medium whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Write a comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder={t.placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-sm"
        >
          <Send size={13} />
        </button>
      </form>

    </div>
  );
}
