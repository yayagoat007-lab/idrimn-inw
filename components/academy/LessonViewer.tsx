import React from 'react';
import { AcademyLesson } from '../../lib/academy-content';
import { BookOpen, Clock, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LessonViewerProps {
  lesson: AcademyLesson;
  moduleTitle: string;
  onBack: () => void;
  onStartQuiz: () => void;
  isCompleted: boolean;
  language: 'fr' | 'darija';
  currentIndex: number;
  totalLessons: number;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  moduleTitle,
  onBack,
  onStartQuiz,
  isCompleted,
  language,
  currentIndex,
  totalLessons
}) => {
  return (
    <div id={`lesson-viewer-${lesson.id}`} className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-emerald-550 to-teal-600 px-6 py-8 md:p-8 text-white relative">
        <button 
          id="lesson-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {language === 'darija' ? 'Rje3' : 'Retour'}
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">
          <span>{moduleTitle}</span>
          <span>•</span>
          <span>
            {language === 'darija' ? `Dars ${currentIndex + 1} f ${totalLessons}` : `Leçon ${currentIndex + 1} sur ${totalLessons}`}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
          {lesson.title}
        </h2>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-semibold text-emerald-50">
          <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-full text-xs">
            <Clock className="w-4 h-4 text-emerald-200" />
            {lesson.estimatedMinutes} {language === 'darija' ? 'Daqiqa' : 'min de lecture'}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1.5 bg-emerald-500/30 border border-emerald-400/20 px-2.5 py-1 rounded-full text-xs text-emerald-250 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-pulse" />
              {language === 'darija' ? 'Fayt l-kamal' : 'Déjà validée (+30 XP)'}
            </span>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="p-6 md:p-8">
        <div className="prose prose-slate max-w-none space-y-6">
          {lesson.contentParagraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="text-slate-600 text-base md:text-lg leading-relaxed font-sans first-letter:float-left first-letter:text-3xl first-letter:font-black first-letter:text-emerald-600 first-letter:mr-1 first-letter:mt-0.5 first-letter:font-sans"
            >
              {index === 0 ? paragraph : paragraph}
            </p>
          ))}
        </div>

        {/* Action Bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-500 text-center sm:text-left">
            💡 {language === 'darija' 
              ? 'Sala d-dars ? Douz l-quiz bach t-jeri l-XP!' 
              : 'Prêt à tester tes connaissances et gagner de l\'XP ?'}
          </div>

          <button
            id="start-lesson-quiz-btn"
            onClick={onStartQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-600/10 transition-all duration-150"
          >
            {language === 'darija' ? 'Dwez l-Quiz' : 'Passer au quiz'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
