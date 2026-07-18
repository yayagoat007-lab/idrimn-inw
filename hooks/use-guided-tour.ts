import { useState, useEffect, useCallback } from 'react';
import { 
  TourDefinition, 
  TourStep, 
  hasCompletedTour, 
  hasSkippedTour, 
  markTourCompleted, 
  markTourSkipped,
  resetTourStatus
} from '../lib/guided-tour-engine';

export function useGuidedTour(userId: string, tour: TourDefinition) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const completed = hasCompletedTour(userId, tour.id);
  const skipped = hasSkippedTour(userId, tour.id);
  
  // Do not auto-start if the First Goal Quick Win overlay is still pending
  const isQuickWinPending = typeof window !== 'undefined' && localStorage.getItem('floussi_first_goal_quickwin_completed') !== 'true';
  const shouldAutoStart = !completed && !skipped && !isQuickWinPending;

  useEffect(() => {
    // Only auto-start on client side after component mounts and if condition is met
    if (shouldAutoStart && typeof window !== 'undefined') {
      // Small timeout to let elements render completely
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStepIndex(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStart, tour.id]);

  const currentStep = tour.steps[currentStepIndex] || null;

  const nextStep = useCallback(() => {
    if (currentStepIndex < tour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsActive(false);
      markTourCompleted(userId, tour.id);
    }
  }, [currentStepIndex, tour.steps.length, userId, tour.id]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    markTourSkipped(userId, tour.id);
  }, [userId, tour.id]);

  const completeTour = useCallback(() => {
    setIsActive(false);
    markTourCompleted(userId, tour.id);
  }, [userId, tour.id]);

  const startTour = useCallback(() => {
    resetTourStatus(userId, tour.id);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, [userId, tour.id]);

  return {
    isActive,
    setIsActive,
    currentStepIndex,
    currentStep,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    startTour,
    shouldAutoStart,
    totalSteps: tour.steps.length
  };
}
