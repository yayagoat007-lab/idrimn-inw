import React, { useState } from 'react';
import { useCommunityFeed } from '../../hooks/use-community-feed';
import { useChallenges } from '../../hooks/use-challenges';
import { useSavingsGroups } from '../../hooks/use-savings-groups';
import { Language } from '../../lib/i18n';
import { PostCard } from './PostCard';
import { ChallengeCard } from './ChallengeCard';
import { SavingsGroupCard } from './SavingsGroupCard';
import { CreatePostModal } from './CreatePostModal';
import { CreateGroupModal } from './CreateGroupModal';
import { StoryShareModal } from './StoryShareModal';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  Plus, 
  MapPin, 
  Filter, 
  Award, 
  Flame, 
  Sparkles, 
  Share2, 
  Search,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface CommunityPageProps {
  language: Language;
}

export function CommunityPage({ language }: CommunityPageProps) {
  const isDarija = language === 'darija';
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'groups'>('feed');

  // Hooks state engines
  const { 
    posts, 
    comments, 
    loading: feedLoading, 
    userAlias, 
    userCity, 
    createPost, 
    addReaction, 
    addComment 
  } = useCommunityFeed();

  const { 
    challenges, 
    joinChallenge, 
    leaveChallenge 
  } = useChallenges();

  const { 
    groups, 
    createGroup, 
    contribute, 
    isCreator, 
    getGroupContributions 
  } = useSavingsGroups();

  // Modals visibility
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedStoryGoal, setSelectedStoryGoal] = useState<{ name: string; amount: number } | null>(null);

  // Filters for the Feed
  const [cityFilter, setCityFilter] = useState<'all' | 'mine'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'achievement' | 'tip' | 'question'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dictionary translation mapping
  const t = {
    title: isDarija ? 'L-Comunauté Floussi' : 'La Communauté Floussi',
    subtitle: isDarija ? 'T-sharek, d-deffa3, o t-bni s7abek dyal l-iddikhar' : 'Échangez des astuces, relevez des défis et épargnez à plusieurs sans tabou !',
    tabFeed: isDarija ? 'Nashrat (Le Feed)' : 'Le Feed',
    tabChallenges: isDarija ? 'Tahadiyat (Défis)' : 'Défis Hebdo',
    tabGroups: isDarija ? 'Majmou3at (Groupes)' : 'Groupes d\'Épargne',
    newPost: isDarija ? 'Kteb Post' : 'Nouvelle Publication',
    newGroup: isDarija ? 'Fe7el Group' : 'Créer un Groupe',
    allCities: isDarija ? 'Ga3 l-Moudoun' : 'Toutes les villes',
    myCity: isDarija ? `Ma Ville (${userCity})` : `Ma ville (${userCity})`,
    filterAll: isDarija ? 'Koulchi' : 'Tout voir',
    filterAchievements: isDarija ? 'Enjazat (Exploits)' : 'Exploits',
    filterTips: isDarija ? 'Nassa2i7 (Astuces)' : 'Astuces',
    filterQuestions: isDarija ? 'As2ila (Questions)' : 'Questions',
    searchPlaceholder: isDarija ? 'Qleb 3la astuce...' : 'Rechercher une publication...',
    emptyFeed: isDarija ? 'Makan hta post f had l-weqt. Kteb l-owl!' : 'Aucune publication ne correspond à vos filtres. Soyez le premier à publier !',
    shareStoryBtn: isDarija ? 'Share Story dyalk' : 'Partager un Exploit',
    motivationCardTitle: isDarija ? 'Aji n-t7addaw rassa ! 💪' : 'Relevez le défi de la discipline ! 💪',
    motivationCardDesc: isDarija ? 'Koulma d-khalti f tahadi, kat-rbe7 n9at XP o kat-tla3 f l-niveau d-Dahabi.' : 'Rejoignez nos challenges hebdomadaires pour gagner de l\'expérience (XP), débloquer des badges et muscler votre rigueur financière !',
    groupMotivationTitle: isDarija ? 'Sando9 l-Solidaire 🔒' : 'L\'épargne collective solidaire 🔒',
    groupMotivationDesc: isDarija ? 'Ibni sando9 m3a s7abek d l-Aïd, kraya, or l-safar dyalkoum.' : 'Créez une cagnotte collective avec vos proches pour financer l\'Aïd El Adha, un voyage ou un cadeau commun, en toute transparence.',
  };

  // Filter and Search logic for feed posts
  const filteredPosts = posts.filter(post => {
    const matchesCity = cityFilter === 'all' || post.authorCity === userCity;
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    const matchesSearch = searchQuery === '' || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorAlias.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24 font-sans" id="community-page">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Block with Moroccan vibe */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-1.5 mb-1">
              <Users size={12} className="animate-pulse" />
              <span>DARIJA & FRANÇAIS • LOCAL & SECURE</span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight uppercase">
              {t.title}
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              {t.subtitle}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            {/* Quick Share Story trigger (for any custom achievement) */}
            <button
              onClick={() => setSelectedStoryGoal({ name: 'Épargne Floussi', amount: 5000 })}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95"
            >
              <Share2 size={13} />
              <span>{t.shareStoryBtn}</span>
            </button>

            {/* Main Primary CTA based on active tab */}
            {activeTab === 'feed' ? (
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md shadow-emerald-100"
              >
                <Plus size={14} />
                <span>{t.newPost}</span>
              </button>
            ) : activeTab === 'groups' ? (
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-100"
              >
                <Plus size={14} />
                <span>{t.newGroup}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Navigation Tabs (Feed, Challenges, Groups) */}
        <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-2xl w-fit" id="community-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabFeed}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabChallenges}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('groups')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.tabGroups}
          </button>
        </div>

        {/* FEED TAB CONTENT */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            
            {/* Feed Main Column */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Complex Filters Bar */}
              <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-3xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  
                  {/* City toggler */}
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                      onClick={() => setCityFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        cityFilter === 'all' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t.allCities}
                    </button>
                    <button
                      onClick={() => setCityFilter('mine')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        cityFilter === 'mine' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {t.myCity}
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl py-1.5 pl-9 pr-3 text-[11px] font-semibold text-slate-700 focus:outline-hidden transition-all"
                    />
                  </div>

                </div>

                {/* Type filters */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      typeFilter === 'all' ? 'bg-slate-800 text-white border-transparent' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100'
                    }`}
                  >
                    {t.filterAll}
                  </button>
                  <button
                    onClick={() => setTypeFilter('achievement')}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      typeFilter === 'achievement' ? 'bg-emerald-600 text-white border-transparent shadow-xs' : 'bg-white hover:bg-slate-50 text-emerald-700 border-emerald-100'
                    }`}
                  >
                    {t.filterAchievements}
                  </button>
                  <button
                    onClick={() => setTypeFilter('tip')}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      typeFilter === 'tip' ? 'bg-blue-600 text-white border-transparent shadow-xs' : 'bg-white hover:bg-slate-50 text-blue-700 border-blue-100'
                    }`}
                  >
                    {t.filterTips}
                  </button>
                  <button
                    onClick={() => setTypeFilter('question')}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      typeFilter === 'question' ? 'bg-amber-600 text-white border-transparent shadow-xs' : 'bg-white hover:bg-slate-50 text-amber-700 border-amber-100'
                    }`}
                  >
                    {t.filterQuestions}
                  </button>
                </div>
              </div>

              {/* Posts Feed list */}
              <div className="space-y-4">
                {feedLoading ? (
                  <div className="text-center py-10 bg-white border border-slate-100 rounded-3xl">
                    <span className="text-slate-400 font-bold text-xs uppercase animate-pulse">Chargement du flux...</span>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl p-6">
                    <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-xs font-bold">{t.emptyFeed}</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      comments={comments[post.id] || []}
                      language={language}
                      onReact={addReaction}
                      onAddComment={addComment}
                    />
                  ))
                )}
              </div>

            </div>

            {/* Sidebar widgets */}
            <div className="space-y-4">
              
              {/* Profile card preview (Anonymized) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <span className="text-[8px] uppercase tracking-widest font-black text-emerald-400 block mb-1">PROFIL ANONYME FLOUSSI</span>
                <h3 className="font-black text-sm tracking-tight mb-1">@{userAlias}</h3>
                <p className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                  <MapPin size={11} />
                  <span>Citoyen de : {userCity}</span>
                </p>

                <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-black uppercase text-slate-300">
                  <span>Niveau Épargne :</span>
                  <span className="text-emerald-400 font-mono">Dahabi Lvl 3</span>
                </div>
              </div>

              {/* Financial Education micro-article widget */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-3xs space-y-3">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen size={14} className="text-emerald-600" />
                  <span>Culture Financière</span>
                </h4>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Conseil du jour</span>
                  <h5 className="font-black text-slate-700 text-xs leading-snug">
                    Comment minimiser les achats compulsifs dans les souks de quartier ?
                  </h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    Notez une liste stricte avant de sortir, retirez uniquement le montant en cash estimé, et laissez vos cartes bancaires à la maison pour créer une friction physique salutaire.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CHALLENGES TAB CONTENT */}
        {activeTab === 'challenges' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Gamification Explanation Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-slate-100 p-5 rounded-3xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
                <Flame size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                  {t.motivationCardTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-0.5">
                  {t.motivationCardDesc}
                </p>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge as any}
                  language={language}
                  onJoin={joinChallenge}
                  onLeave={leaveChallenge}
                />
              ))}
            </div>

          </div>
        )}

        {/* GROUPS TAB CONTENT */}
        {activeTab === 'groups' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Collective Savings Motivation Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-slate-100 p-5 rounded-3xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">
                  {t.groupMotivationTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold mt-0.5">
                  {t.groupMotivationDesc}
                </p>
              </div>
            </div>

            {/* Savings Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const groupContributions = getGroupContributions(group.id);
                return (
                  <SavingsGroupCard
                    key={group.id}
                    group={group}
                    contributions={groupContributions}
                    isAdmin={isCreator(group)}
                    language={language}
                    onContribute={contribute}
                  />
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* CREATE POST MODAL */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        language={language}
        onCreatePost={createPost}
      />

      {/* CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        language={language}
        onCreateGroup={createGroup}
      />

      {/* STORY SHARE PREVIEW MODAL */}
      <StoryShareModal
        isOpen={!!selectedStoryGoal}
        onClose={() => setSelectedStoryGoal(null)}
        goalName={selectedStoryGoal?.name || ''}
        targetAmount={selectedStoryGoal?.amount || 0}
        themeId="atlas"
        language={language}
      />

    </div>
  );
}
export default CommunityPage;
