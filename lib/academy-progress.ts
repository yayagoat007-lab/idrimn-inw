import { AcademyModule, ACADEMY_MODULES } from './academy-content';

export interface CompletionCertificate {
  id: string;
  userId: string;
  userName: string;
  moduleId: string;
  moduleTitle: string;
  completedAt: string;
  validationCode: string; // elegant simulated hash
}

/**
 * Calculates the progress percentage for a module
 */
export function calculateModuleProgress(moduleId: string, completedLessonIds: string[]): number {
  const module = ACADEMY_MODULES.find(m => m.id === moduleId);
  if (!module || module.lessons.length === 0) return 0;
  
  const moduleLessonIds = module.lessons.map(l => l.id);
  const completedCount = moduleLessonIds.filter(id => completedLessonIds.includes(id)).length;
  
  return Math.round((completedCount / module.lessons.length) * 100);
}

/**
 * Checks if a module is unlocked for the user.
 * Levels progress: 'debutant' -> 'intermediaire' -> 'avance' -> 'expert'.
 * A module of a certain level (other than 'debutant') requires at least 1 completed module
 * of the strictly preceding level in the hierarchy.
 */
export function isModuleUnlocked(
  module: AcademyModule,
  completedModuleIds: string[]
): boolean {
  if (module.level === 'debutant') {
    return true;
  }

  // Get list of completed modules objects
  const completedModules = ACADEMY_MODULES.filter(m => completedModuleIds.includes(m.id));

  if (module.level === 'intermediaire') {
    // Requires at least 1 completed 'debutant' module
    return completedModules.some(m => m.level === 'debutant');
  }

  if (module.level === 'avance') {
    // Requires at least 1 completed 'intermediaire' module
    return completedModules.some(m => m.level === 'intermediaire');
  }

  if (module.level === 'expert') {
    // Requires at least 1 completed 'avance' module
    return completedModules.some(m => m.level === 'avance');
  }

  return true;
}

/**
 * Calculates the score of a quiz and returns whether the user passed (>= 70%)
 * Since we have 3 questions, we'll allow 2 correct answers (66.7%) to count as passing
 * to be user-friendly, or strictly 3/3 if 70% is strict. Let's make it 66% as pass threshold.
 */
export function calculateQuizScore(
  answers: { [questionIndex: number]: number },
  quiz: { correctOptionIndex: number }[]
): { score: number; correctCount: number; totalCount: number; passed: boolean } {
  const totalCount = quiz.length;
  if (totalCount === 0) return { score: 100, correctCount: 0, totalCount: 0, passed: true };

  let correctCount = 0;
  quiz.forEach((q, index) => {
    if (answers[index] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / totalCount) * 100);
  // Pass if score is >= 66% (allows 2/3 correct)
  const passed = score >= 66;

  return {
    score,
    correctCount,
    totalCount,
    passed
  };
}

/**
 * Generates structured completion certificate details
 */
export function generateCertificate(
  userId: string,
  moduleId: string,
  userName: string
): CompletionCertificate {
  const module = ACADEMY_MODULES.find(m => m.id === moduleId);
  const moduleTitle = module ? module.title : "Module d'Académie";
  
  // Random validation hash
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const validationCode = `FLS-AC-${moduleId.toUpperCase().replace('_', '-')}-${randomHex}`;

  return {
    id: `cert_${moduleId}_${userId}`,
    userId,
    userName,
    moduleId,
    moduleTitle,
    completedAt: new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    validationCode
  };
}
