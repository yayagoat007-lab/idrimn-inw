import React, { useState, useEffect } from 'react';
import { useAcademy } from '../../../hooks/use-academy';
import { ModuleCard } from '../../../components/academy/ModuleCard';
import { LessonViewer } from '../../../components/academy/LessonViewer';
import { QuizPlayer } from '../../../components/academy/QuizPlayer';
import { CertificateModal } from '../../../components/academy/CertificateModal';
import { CompletionCertificate } from '../../../lib/academy-progress';
import { AcademyModule, AcademyLesson } from '../../../lib/academy-content';
import { useTranslation } from '../../../hooks/use-translation';
import { 
  GraduationCap, 
  Award, 
  Sparkles, 
  BookOpen, 
  Brain, 
  ChevronRight, 
  User, 
  X, 
  Trophy, 
  Compass, 
  CheckCircle2, 
  Lock,
  ArrowLeft
} from 'lucide-react';

interface AcademyPageProps {
  language?: 'fr' | 'darija';
}

export default function AcademyPage({ language: propLanguage }: AcademyPageProps) {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const userId = "mock-user-id-9999";
  const {
    modules,
    completedLessons,
    certificates,
    currentUserLevelName,
    currentUserXp,
    completeLesson,
    moduleProgress,
    isUnlocked,
    getCompletedModuleIds
  } = useAcademy(userId);

  // Router-like view states
  const [selectedModule, setSelectedModule] = useState<AcademyModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [isInQuizMode, setIsInQuizMode] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  // Modal states
  const [viewingCertificate, setViewingCertificate] = useState<CompletionCertificate | null>(null);
  
  // Student name customization state
  const [studentName, setStudentName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Load personalized student name
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('floussi_student_name');
      if (savedName) {
        setStudentName(savedName);
      } else {
        setStudentName('Yayagoat007');
        localStorage.setItem('floussi_student_name', 'Yayagoat007');
      }
    } catch (_) {}
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      localStorage.setItem('floussi_student_name', studentName.trim());
      setIsEditingName(false);
    }
  };

  const handleSelectModule = (module: AcademyModule) => {
    setSelectedModule(module);
    setActiveLesson(null);
    setIsInQuizMode(false);
  };

  const handleSelectLesson = (lesson: AcademyLesson) => {
    setActiveLesson(lesson);
    setIsInQuizMode(false);
  };

  const handleStartQuiz = () => {
    setIsInQuizMode(true);
  };

  const handleBackToLessonsList = () => {
    setActiveLesson(null);
    setIsInQuizMode(false);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
    setActiveLesson(null);
    setIsInQuizMode(false);
  };

  const handleQuizComplete = (answers: { [questionIndex: number]: number }) => {
    if (!activeLesson) return { score: 0, passed: false, correctCount: 0, totalCount: 0, newlyCompleted: false };
    
    // Complete lesson with customized student name
    const result = completeLesson(activeLesson.id, answers, studentName);
    
    // If the quiz passed and unlocked a certificate, set it up to be displayed immediately
    if (result.passed && result.certificate) {
      setViewingCertificate(result.certificate);
    }

    return result;
  };

  const categories = [
    { id: 'all', label: language === 'darija' ? 'Koulchi' : 'Tous' },
    { id: 'budget', label: language === 'darija' ? 'Mizaniya' : 'Budget' },
    { id: 'epargne', label: language === 'darija' ? 'Iddikhar' : 'Épargne' },
    { id: 'credit', label: language === 'darija' ? 'Crédit' : 'Crédits' },
    { id: 'investissement', label: language === 'darija' ? 'Estethmar' : 'Placements' },
    { id: 'retraite', label: language === 'darija' ? 'Retraite' : 'Retraite' },
    { id: 'fiscalite', label: language === 'darija' ? 'Driba' : 'Fiscalité' }
  ];

  // Filtering modules
  const filteredModules = modules.filter(m => {
    if (activeCategoryFilter === 'all') return true;
    return m.category === activeCategoryFilter;
  });

  // Group modules by level
  const levels = [
    { id: 'debutant', title: language === 'darija' ? 'Niveau Moubtadi2' : 'Niveau Débutant', color: 'text-emerald-600' },
    { id: 'intermediaire', title: language === 'darija' ? 'Niveau Moutawassit' : 'Niveau Intermédiaire', color: 'text-blue-600' },
    { id: 'avance', title: language === 'darija' ? 'Niveau Moutaqaddim' : 'Niveau Avancé', color: 'text-amber-600' }
  ];

  // Rendering sub-views based on selections
  if (isInQuizMode && activeLesson && selectedModule) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <QuizPlayer
          quiz={activeLesson.quiz}
          language={language}
          onBackToLesson={() => setIsInQuizMode(false)}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  }

  if (activeLesson && selectedModule) {
    const lessonIndex = selectedModule.lessons.findIndex(l => l.id === activeLesson.id);
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <LessonViewer
          lesson={activeLesson}
          moduleTitle={selectedModule.title}
          currentIndex={lessonIndex}
          totalLessons={selectedModule.lessons.length}
          isCompleted={completedLessons.includes(activeLesson.id)}
          language={language}
          onBack={handleBackToLessonsList}
          onStartQuiz={handleStartQuiz}
        />
      </div>
    );
  }

  if (selectedModule) {
    const progress = moduleProgress(selectedModule.id);
    const hasCert = certificates.some(c => c.moduleId === selectedModule.id);
    const currentCertificate = certificates.find(c => c.moduleId === selectedModule.id);

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <button
              id="back-to-academy-dashboard"
              onClick={handleBackToDashboard}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'darija' ? 'Rje3 l l-Akadimiya' : 'Retour à l\'Académie'}
            </button>

            {hasCert && currentCertificate && (
              <button
                id="view-certificate-top"
                onClick={() => setViewingCertificate(currentCertificate)}
                className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-extrabold text-xs py-2 px-4 rounded-xl transition-all shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-600 animate-pulse" />
                {language === 'darija' ? 'Chouf ch-chahada dyal el-Kafa2a' : 'Voir mon certificat d\'excellence'}
              </button>
            )}
          </div>

          {/* Module Banner card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block mb-3">
                  {selectedModule.level.toUpperCase()}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
                  {selectedModule.title}
                </h2>
                <p className="text-emerald-700 font-bold font-mono text-sm mt-1">{selectedModule.titleDarija}</p>
                <p className="text-slate-500 mt-4 text-sm md:text-base leading-relaxed max-w-2xl">
                  {language === 'darija' ? selectedModule.descriptionDarija : selectedModule.descriptionFr}
                </p>
              </div>

              {/* Progress ring card */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center w-full md:w-44 text-center">
                <div className="text-xs font-black text-slate-400 mb-2 uppercase tracking-wider">
                  {language === 'darija' ? 'Taqaddoum' : 'Progression'}
                </div>
                <div className="relative flex items-center justify-center h-20 w-20">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500 transition-all duration-500"
                      strokeWidth="3.5"
                      strokeDasharray={`${progress}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="text-lg font-black text-slate-800">{progress}%</span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-2">
                  {selectedModule.lessons.filter(l => completedLessons.includes(l.id)).length} / {selectedModule.lessons.length} {language === 'darija' ? 'Dourouss' : 'validés'}
                </div>
              </div>
            </div>
          </div>

          {/* Lessons List Header */}
          <h3 className="text-lg font-black text-slate-800 mb-4 px-1">
            📚 {language === 'darija' ? 'Fehrest l-Dourouss' : 'Programme d\'études'}
          </h3>

          {/* Lessons Stack */}
          <div className="space-y-3.5">
            {selectedModule.lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.includes(lesson.id);
              return (
                <div
                  id={`lesson-item-${lesson.id}`}
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className="flex items-center gap-4 bg-white hover:bg-slate-50/50 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-150 cursor-pointer group"
                >
                  {/* Number bubble */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border flex-shrink-0 transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:bg-emerald-50/30 group-hover:border-emerald-100 group-hover:text-emerald-600'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" /> : idx + 1}
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-800 group-hover:text-emerald-800 text-sm md:text-base truncate transition-colors">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                      <span>⏱️ {lesson.estimatedMinutes} {language === 'darija' ? 'dqayeq d qraya' : 'min de lecture'}</span>
                      <span>•</span>
                      <span>{lesson.quiz.length} {language === 'darija' ? 'as2ila' : 'questions'}</span>
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black py-1 px-3 rounded-full border transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 border-slate-150 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
                    }`}>
                      {isCompleted 
                        ? (language === 'darija' ? 'Mo3tamad' : 'Validé') 
                        : (language === 'darija' ? 'Bda l-qraya' : 'Lire la leçon')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Count total completed academy modules
  const completedModuleCount = modules.filter(module => {
    const moduleLessonIds = module.lessons.map(l => l.id);
    return moduleLessonIds.every(id => completedLessons.includes(id));
  }).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Banner / Title Card */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-350 border border-emerald-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {language === 'darija' ? 'Mihfadati & Iddikhar' : 'Éducation & Excellence'}
            </span>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              {language === 'darija' ? 'Akadimiya Floussi l-Maliya' : 'Académie Financière Floussi'}
            </h1>
            
            <p className="text-slate-300 mt-3 text-sm md:text-base leading-relaxed max-w-2xl">
              {language === 'darija' 
                ? "T3allem kifach t-tsarraf f l-mizaniya, t-khbi floussek, o t-stethmer f l-Maroc m3a dourouss s7i7a dyal l-waqi3." 
                : "Augmente ton intelligence financière, domine ton budget, décrypte le crédit bancaire et propulse tes investissements au Maroc grâce à de véritables cours structurés et interactifs."}
            </p>
          </div>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Brain className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">
                {language === 'darija' ? 'Mostawa d-Gamification' : 'Niveau actuel'}
              </div>
              <div className="text-sm md:text-base font-black text-slate-800 truncate mt-0.5">
                {currentUserLevelName}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">
                {language === 'darija' ? 'Majmou3 d-XP' : 'Expérience totale'}
              </div>
              <div className="text-base md:text-lg font-black text-slate-800 mt-0.5">
                {currentUserXp} <span className="text-xs text-slate-400 font-bold">XP</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">
                {language === 'darija' ? 'Dourouss dyal kamal' : 'Leçons validées'}
              </div>
              <div className="text-base md:text-lg font-black text-slate-800 mt-0.5">
                {completedLessons.length} / 18
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider">
                {language === 'darija' ? 'Chahadat l-kamal' : 'Diplômes obtenus'}
              </div>
              <div className="text-base md:text-lg font-black text-slate-800 mt-0.5">
                {completedModuleCount} / 6
              </div>
            </div>
          </div>
        </div>

        {/* Name Customizer Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-slate-50 text-slate-500">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight">
                {language === 'darija' ? 'Smiya l maktouba f ch-Chahada' : 'Nom affiché sur tes certificats'}
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                {language === 'darija' 
                  ? 'Kteb smitek s7i7a bach t-khrej s-Smiya dyalek f ch-Chahada.' 
                  : 'Saisis ton véritable nom pour qu\'il apparaisse élégamment sur les diplômes téléchargeables.'}
              </p>
            </div>
          </div>

          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2 w-full md:w-auto">
              <input
                id="student-name-input"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                maxLength={30}
                placeholder="Ex: Amine Benziane"
                className="flex-1 md:w-64 py-2 px-3 border border-slate-250 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
              <button
                id="save-student-name-btn"
                type="submit"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all"
              >
                {language === 'darija' ? 'Sajjel' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-black text-slate-700 text-sm border-b-2 border-dotted border-slate-300 pb-0.5 px-1 bg-slate-50 rounded py-0.5">
                {studentName}
              </span>
              <button
                id="edit-student-name-btn"
                onClick={() => setIsEditingName(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-extrabold transition-colors hover:underline"
              >
                {language === 'darija' ? 'Beddel' : 'Modifier'}
              </button>
            </div>
          )}
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-slate-100">
          {categories.map(cat => (
            <button
              id={`category-filter-btn-${cat.id}`}
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap ${
                activeCategoryFilter === cat.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modules List Grid */}
        <div className="space-y-8">
          {levels.map(lvl => {
            // Get modules belonging to this level
            const levelModules = filteredModules.filter(m => m.level === lvl.id);
            if (levelModules.length === 0) return null;

            return (
              <div key={lvl.id}>
                <h3 className={`text-base font-black uppercase tracking-wider mb-4 flex items-center gap-2 ${lvl.color}`}>
                  <span>✦</span> {lvl.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {levelModules.map(module => {
                    const unlocked = isUnlocked(module);
                    const progress = moduleProgress(module.id);
                    const hasCert = certificates.some(c => c.moduleId === module.id);
                    const currentCert = certificates.find(c => c.moduleId === module.id);

                    return (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        progress={progress}
                        isUnlocked={unlocked}
                        hasCertificate={hasCert}
                        onViewCertificate={() => currentCert && setViewingCertificate(currentCert)}
                        onSelect={() => handleSelectModule(module)}
                        language={language}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <CertificateModal
          certificate={viewingCertificate}
          language={language}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}
