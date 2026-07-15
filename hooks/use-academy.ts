import { useState, useEffect, useCallback } from 'react';
import { ACADEMY_MODULES, AcademyModule, AcademyLesson } from '../lib/academy-content';
import { 
  calculateModuleProgress, 
  calculateQuizScore, 
  generateCertificate, 
  isModuleUnlocked,
  CompletionCertificate 
} from '../lib/academy-progress';
import { unlockGlobalBadge, awardGlobalXp, getLevelForXp } from '../lib/gamification';

export interface AcademyHook {
  modules: AcademyModule[];
  completedLessons: string[];
  certificates: CompletionCertificate[];
  currentUserLevelName: string;
  currentUserXp: number;
  completeLesson: (
    lessonId: string, 
    quizAnswers: { [questionIndex: number]: number },
    userName?: string
  ) => { 
    score: number; 
    passed: boolean; 
    correctCount: number; 
    totalCount: number; 
    newlyCompleted: boolean; 
    unlockedBadgeId?: string;
    certificate?: CompletionCertificate;
  };
  moduleProgress: (moduleId: string) => number;
  isUnlocked: (module: AcademyModule) => boolean;
  getCompletedModuleIds: () => string[];
  refreshState: () => void;
}

export function useAcademy(userId: string = "mock-user-id-9999"): AcademyHook {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<CompletionCertificate[]>([]);
  const [currentUserXp, setCurrentUserXp] = useState<number>(140);
  const [currentUserLevelName, setCurrentUserLevelName] = useState<string>('🥉 Débutant');

  // Load state from localStorage
  const loadState = useCallback(() => {
    try {
      // Completed lessons
      const lessonsKey = `floussi_academy_lessons_${userId}`;
      const savedLessons = localStorage.getItem(lessonsKey);
      if (savedLessons) {
        setCompletedLessons(JSON.parse(savedLessons));
      } else {
        setCompletedLessons([]);
      }

      // Certificates
      const certsKey = `floussi_academy_certs_${userId}`;
      const savedCerts = localStorage.getItem(certsKey);
      if (savedCerts) {
        setCertificates(JSON.parse(savedCerts));
      } else {
        setCertificates([]);
      }

      // Gamification State (XP / Level Name)
      const gamificationKey = `floussi_gamification_${userId}`;
      const savedGamification = localStorage.getItem(gamificationKey);
      if (savedGamification) {
        const parsed = JSON.parse(savedGamification);
        setCurrentUserXp(parsed.xp || 0);
        const { levelName } = getLevelForXp(parsed.xp || 0);
        setCurrentUserLevelName(levelName);
      } else {
        setCurrentUserXp(140);
        setCurrentUserLevelName('🥈 Intermédiaire');
      }
    } catch (err) {
      console.error("Error loading academy progress state", err);
    }
  }, [userId]);

  useEffect(() => {
    loadState();

    // Listen for global gamification changes to sync instantly
    const handleXpGained = () => {
      loadState();
    };
    window.addEventListener('floussi_xp_gained', handleXpGained);
    window.addEventListener('floussi_badge_unlocked', handleXpGained);

    return () => {
      window.removeEventListener('floussi_xp_gained', handleXpGained);
      window.removeEventListener('floussi_badge_unlocked', handleXpGained);
    };
  }, [loadState]);

  // Retrieve list of completed module IDs
  const getCompletedModuleIds = useCallback((): string[] => {
    const lessonsList = localStorage.getItem(`floussi_academy_lessons_${userId}`);
    const completedList: string[] = lessonsList ? JSON.parse(lessonsList) : completedLessons;

    return ACADEMY_MODULES.filter(module => {
      const moduleLessonIds = module.lessons.map(l => l.id);
      return moduleLessonIds.every(id => completedList.includes(id));
    }).map(module => module.id);
  }, [completedLessons, userId]);

  // Check if a module is unlocked
  const isUnlocked = useCallback((module: AcademyModule): boolean => {
    const completedIds = getCompletedModuleIds();
    return isModuleUnlocked(module, completedIds);
  }, [getCompletedModuleIds]);

  // Calculate specific module progress
  const moduleProgress = useCallback((moduleId: string): number => {
    return calculateModuleProgress(moduleId, completedLessons);
  }, [completedLessons]);

  // Complete a lesson with quiz answers
  const completeLesson = useCallback((
    lessonId: string, 
    quizAnswers: { [questionIndex: number]: number },
    userName: string = "Étudiant Floussi"
  ) => {
    // Find the lesson and its parent module
    let foundLesson: AcademyLesson | undefined;
    let foundModule: AcademyModule | undefined;

    for (const mod of ACADEMY_MODULES) {
      const les = mod.lessons.find(l => l.id === lessonId);
      if (les) {
        foundLesson = les;
        foundModule = mod;
        break;
      }
    }

    if (!foundLesson || !foundModule) {
      throw new Error(`Lesson with id "${lessonId}" not found.`);
    }

    // Evaluate quiz
    const scoreResult = calculateQuizScore(quizAnswers, foundLesson.quiz);

    if (!scoreResult.passed) {
      return {
        score: scoreResult.score,
        passed: false,
        correctCount: scoreResult.correctCount,
        totalCount: scoreResult.totalCount,
        newlyCompleted: false
      };
    }

    // Passed! Let's check if it was already completed
    const isAlreadyCompleted = completedLessons.includes(lessonId);
    let updatedLessons = [...completedLessons];
    let newlyCompleted = false;

    if (!isAlreadyCompleted) {
      updatedLessons = [...completedLessons, lessonId];
      localStorage.setItem(`floussi_academy_lessons_${userId}`, JSON.stringify(updatedLessons));
      setCompletedLessons(updatedLessons);
      newlyCompleted = true;

      // Award 30 XP for passing lesson quiz!
      awardGlobalXp(userId, 30);
    }

    // Now, let's check if this completion triggers module completion
    const moduleLessonIds = foundModule.lessons.map(l => l.id);
    const isModuleFinished = moduleLessonIds.every(id => updatedLessons.includes(id));
    
    let unlockedBadgeId: string | undefined;
    let certificate: CompletionCertificate | undefined;

    if (isModuleFinished) {
      // Map module IDs to corresponding badges in ALL_BADGES
      const badgeMap: { [key: string]: string } = {
        'budget_basics': 'academy_budget_basics',
        'savings_mastery': 'academy_savings',
        'credit_maroc': 'academy_credit',
        'investing_maroc': 'academy_investing',
        'retirement_prep': 'academy_retirement',
        'tax_maroc': 'academy_tax'
      };

      const targetBadgeId = badgeMap[foundModule.id];
      if (targetBadgeId) {
        const unlockResult = unlockGlobalBadge(userId, targetBadgeId);
        if (unlockResult.unlocked) {
          unlockedBadgeId = targetBadgeId;
        }
      }

      // Check if certificate already exists
      const savedCertsKey = `floussi_academy_certs_${userId}`;
      const savedCerts = localStorage.getItem(savedCertsKey);
      const currentCerts: CompletionCertificate[] = savedCerts ? JSON.parse(savedCerts) : certificates;
      const certificateExists = currentCerts.some(c => c.moduleId === foundModule!.id);

      if (!certificateExists) {
        // Generate new certificate
        const newCert = generateCertificate(userId, foundModule.id, userName);
        const updatedCerts = [...currentCerts, newCert];
        localStorage.setItem(savedCertsKey, JSON.stringify(updatedCerts));
        setCertificates(updatedCerts);
        certificate = newCert;

        // Check if ALL 6 modules are completed
        const completedModuleIds = ACADEMY_MODULES.filter(m => {
          const mIds = m.lessons.map(l => l.id);
          return mIds.every(id => updatedLessons.includes(id));
        }).map(m => m.id);

        if (completedModuleIds.length === ACADEMY_MODULES.length) {
          // Unlock Master Badge!
          unlockGlobalBadge(userId, 'academy_master');
        }
      }
    }

    return {
      score: scoreResult.score,
      passed: true,
      correctCount: scoreResult.correctCount,
      totalCount: scoreResult.totalCount,
      newlyCompleted,
      unlockedBadgeId,
      certificate
    };
  }, [completedLessons, certificates, userId]);

  return {
    modules: ACADEMY_MODULES,
    completedLessons,
    certificates,
    currentUserLevelName,
    currentUserXp,
    completeLesson,
    moduleProgress,
    isUnlocked,
    getCompletedModuleIds,
    refreshState: loadState
  };
}
