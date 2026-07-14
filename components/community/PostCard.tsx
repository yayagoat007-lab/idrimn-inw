import React, { useState } from 'react';
import { CommunityPost, Comment } from '../../types';
import { ReactionBar } from './ReactionBar';
import { CommentSection } from './CommentSection';
import { 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Lightbulb, 
  HelpCircle, 
  Trophy 
} from 'lucide-react';

interface PostCardProps {
  post: CommunityPost;
  comments: Comment[];
  lang: 'fr' | 'darija';
  onReact: (postId: string, emoji: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export function PostCard({ post, comments = [], lang, onReact, onAddComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);

  const t = {
    achievement: lang === 'darija' ? 'Khabar Zarif (Exploit)' : 'Exploit Épargne',
    tip: lang === 'darija' ? 'Fikra (Astuce)' : 'Astuce Budget',
    question: lang === 'darija' ? 'So2al (Question)' : 'Question Entraide',
    commentsToggle: lang === 'darija' ? `Ta3liqat (${post.commentsCount})` : `Commentaires (${post.commentsCount})`,
    relatedGoal: lang === 'darija' ? 'Hadaf dyalo :' : 'Objectif lié :'
  };

  const getBadgeStyle = () => {
    switch (post.type) {
      case 'achievement':
        return {
          bg: 'bg-emerald-50 border-emerald-100/50 text-emerald-800',
          icon: <Trophy size={11} className="text-emerald-600 animate-bounce" />
        };
      case 'tip':
        return {
          bg: 'bg-blue-50 border-blue-100/50 text-blue-800',
          icon: <Lightbulb size={11} className="text-blue-600" />
        };
      case 'question':
        return {
          bg: 'bg-amber-50 border-amber-100/50 text-amber-800',
          icon: <HelpCircle size={11} className="text-amber-600" />
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100/50 text-slate-800',
          icon: <Sparkles size={11} />
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden font-sans" id={`post-${post.id}`}>
      
      {/* Decorative ambient background accent for Achievements */}
      {post.type === 'achievement' && (
        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start gap-2 mb-3 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-black text-slate-800 text-sm">
              @{post.authorAlias}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-bold border border-slate-100">
              <MapPin size={9} />
              <span>{post.authorCity}</span>
            </span>
          </div>
          
          <span className="text-[9px] text-slate-400 font-bold block mt-1 font-mono flex items-center gap-1">
            <Calendar size={10} />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </span>
        </div>

        {/* Post Type Badge */}
        <div className={`flex items-center gap-1 px-2.5 py-1 border rounded-full text-[9px] font-black uppercase tracking-wider ${badge.bg}`}>
          {badge.icon}
          <span>{t[post.type]}</span>
        </div>
      </div>

      {/* Linked Goal Badge */}
      {post.relatedGoalName && (
        <div className="mb-3.5 flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl text-[10px] text-slate-600 font-bold border border-slate-100/40 w-fit">
          <Sparkles size={11} className="text-amber-500 animate-pulse" />
          <span>{t.relatedGoal} <strong className="font-black text-slate-800">{post.relatedGoalName}</strong></span>
        </div>
      )}

      {/* Post content */}
      <p className="text-slate-700 text-xs leading-relaxed font-medium whitespace-pre-wrap mb-4 relative z-10">
        {post.content}
      </p>

      {/* Footer Interactions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50/60">
        
        {/* Clickable Reactions Bar */}
        <ReactionBar 
          reactions={post.reactions} 
          onReact={(emoji) => onReact(post.id, emoji)} 
        />

        {/* Toggle Comments Button */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black tracking-wide border transition-all cursor-pointer ${
            showComments 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100/50' 
              : 'bg-slate-50 hover:bg-slate-100/60 text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          <MessageSquare size={13} className={showComments ? 'text-emerald-600' : 'text-slate-400'} />
          <span>{t.commentsToggle}</span>
        </button>
      </div>

      {/* Comments Drawer / Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          lang={lang}
          onAddComment={(content) => onAddComment(post.id, content)}
        />
      )}

    </div>
  );
}
export default PostCard;
