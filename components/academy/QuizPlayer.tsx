import React, { useState } from 'react';
import { QuizQuestion } from '../../lib/academy-content';
import { Check, X, ArrowRight, HelpCircle, RotateCcw, Award, Star } from 'lucide-react';
import { useTranslation } from '../../hooks/use-translation';

interface QuizPlayerProps {
  quiz: QuizQuestion[];
  onQuizComplete: (answers: { [questionIndex: number]: number }) => {
    score: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    newlyCompleted: boolean;
    unlockedBadgeId?: string;
  };
  onBackToLesson: () => void;
  language?: 'fr' | 'darija';
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  quiz,
  onQuizComplete,
  onBackToLesson,
  language: propLanguage
}) => {
  const { lang } = useTranslation();
  const language = propLanguage || lang;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [questionIndex: number]: number }>({});
  const [hasValidated, setHasValidated] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [resultData, setResultData] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    newlyCompleted: boolean;
    unlockedBadgeId?: string;
  } | null>(null);

  const currentQuestion = quiz[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.length - 1;

  const handleSelectOption = (index: number) => {
    if (hasValidated) return;
    setSelectedOptionIndex(index);
  };

  const handleValidate = () => {
    if (selectedOptionIndex === null || hasValidated) return;
    setHasValidated(true);
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOptionIndex }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Complete quiz
      const finalAnswers = { ...answers, [currentQuestionIndex]: selectedOptionIndex! };
      const outcome = onQuizComplete(finalAnswers);
      setResultData(outcome);
      setShowResultScreen(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setHasValidated(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setAnswers({});
    setHasValidated(false);
    setShowResultScreen(false);
    setResultData(null);
  };

  if (showResultScreen && resultData) {
    const { score, passed, correctCount, totalCount, newlyCompleted, unlockedBadgeId } = resultData;

    return (
      <div id="quiz-result-screen" className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center transition-all duration-300">
        <div className="mb-6 flex justify-center">
          <div className={`p-5 rounded-full ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500 animate-bounce'}`}>
            {passed ? (
              <Award className="w-16 h-16 text-emerald-500" />
            ) : (
              <RotateCcw className="w-16 h-16 text-rose-400" />
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-800">
          {passed 
            ? (language === 'darija' ? 'Mabrouk ! Nja7ti' : 'Félicitations !') 
            : (language === 'darija' ? 'Khass t-3awed t-9ra' : 'Essaye encore !')}
        </h3>
        
        <p className="text-slate-500 text-sm mt-2">
          {passed 
            ? (language === 'darija' ? 'Fotti l-imtihan b-najah' : 'Tu as validé cette leçon avec brio.') 
            : (language === 'darija' ? 'Mazal majebti l-mo3addal dyal 70%' : "Tu n'as pas obtenu le score minimum de passage (70%).")}
        </p>

        {/* Score indicator */}
        <div className="my-8 py-6 px-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block w-full">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {language === 'darija' ? 'Noqta' : 'Score obtenu'}
          </div>
          <div className={`text-4xl font-black ${passed ? 'text-emerald-600' : 'text-rose-500'}`}>
            {score}%
          </div>
          <div className="text-sm font-bold text-slate-600 mt-2">
            {correctCount} / {totalCount} {language === 'darija' ? 'Ajwiba s7i7a' : 'réponses correctes'}
          </div>
        </div>

        {/* Rewards / Badges info */}
        {passed && newlyCompleted && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left">
            <h4 className="text-sm font-black text-emerald-800 flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
              {language === 'darija' ? 'Rab7ti l-XP' : 'Récompense débloquée'}
            </h4>
            <p className="text-xs text-emerald-700">
              🎉 <strong>+30 XP</strong> {language === 'darija' ? 'tzadet l l-kount dyalek !' : 'ajoutés à ton compte Floussi !'}
            </p>
            {unlockedBadgeId && (
              <p className="text-xs text-amber-700 font-bold mt-1.5 flex items-center gap-1">
                <span>🏅</span> {language === 'darija' ? 'Badaqa jdida t7allat !' : 'Un nouveau badge a été débloqué !'}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {passed ? (
            <button
              id="quiz-success-done-btn"
              onClick={onBackToLesson}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm tracking-wide transition-all shadow-md shadow-emerald-600/15"
            >
              {language === 'darija' ? 'Kemmel l-moussa' : 'Continuer mon apprentissage'}
            </button>
          ) : (
            <>
              <button
                id="quiz-retry-btn"
                onClick={handleRestart}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-850 hover:bg-slate-900 active:scale-95 text-white font-black text-sm tracking-wide transition-all"
              >
                {language === 'darija' ? 'Na3wdou t-tesset' : 'Recommencer le quiz'}
              </button>
              <button
                id="quiz-fail-back-btn"
                onClick={onBackToLesson}
                className="w-full py-3 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all border border-slate-150"
              >
                {language === 'darija' ? 'Rje3 l l-dars' : 'Relire la leçon'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id={`quiz-player-${currentQuestionIndex}`} className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-lg p-6 md:p-8 transition-all duration-300">
      {/* Progress Bar */}
      <div className="flex items-center justify-between text-xs font-black text-slate-400 mb-3">
        <span className="flex items-center gap-1 text-emerald-600">
          <HelpCircle className="w-4 h-4 text-emerald-500" />
          QUIZ
        </span>
        <span>
          {language === 'darija' 
            ? `Sou2al ${currentQuestionIndex + 1} men ${quiz.length}` 
            : `Question ${currentQuestionIndex + 1} sur ${quiz.length}`}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
        <div 
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-snug mb-6">
        {currentQuestion.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index;
          const isCorrect = currentQuestion.correctOptionIndex === index;
          
          let optionStyles = 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-200';
          let indicatorMarkup = null;

          if (isSelected) {
            optionStyles = 'border-emerald-600 bg-emerald-50/20 text-emerald-900 ring-2 ring-emerald-600/10';
          }

          if (hasValidated) {
            if (isCorrect) {
              optionStyles = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 font-bold';
              indicatorMarkup = <Check className="w-5 h-5 text-emerald-600" />;
            } else if (isSelected) {
              optionStyles = 'border-rose-400 bg-rose-500/10 text-rose-900';
              indicatorMarkup = <X className="w-5 h-5 text-rose-600" />;
            } else {
              optionStyles = 'border-slate-100 bg-slate-50/30 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              id={`quiz-option-${index}`}
              key={index}
              onClick={() => handleSelectOption(index)}
              disabled={hasValidated}
              className={`w-full flex items-center justify-between text-left p-4 rounded-2xl border text-sm md:text-base font-semibold transition-all duration-150 ${optionStyles}`}
            >
              <span>{option}</span>
              {indicatorMarkup}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {hasValidated && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50/40 border border-emerald-150 text-slate-700 text-sm leading-relaxed animate-fade-in">
          <p className="font-extrabold text-emerald-800 mb-1">
            💡 {language === 'darija' ? 'Tafsir d-Dars' : 'Explication pédagogique :'}
          </p>
          {currentQuestion.explanation}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-5">
        <button
          id="quiz-back-btn"
          onClick={onBackToLesson}
          disabled={hasValidated}
          className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-sm font-bold transition-all"
        >
          {language === 'darija' ? 'Rje3 l-dars' : 'Retour à la leçon'}
        </button>

        {!hasValidated ? (
          <button
            id="quiz-validate-btn"
            onClick={handleValidate}
            disabled={selectedOptionIndex === null}
            className="py-3 px-6 rounded-2xl bg-slate-850 hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm transition-all"
          >
            {language === 'darija' ? 'Araqeb el jawab' : 'Valider la réponse'}
          </button>
        ) : (
          <button
            id="quiz-next-btn"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
          >
            {isLastQuestion 
              ? (language === 'darija' ? 'Chouf r-resultat' : 'Terminer le quiz') 
              : (language === 'darija' ? 'Sou2al j-jay' : 'Question suivante')}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
