import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

/**
 * Hook to manage onboarding step tracker, step state persistence across browser refreshes, 
 * and final completion or skip.
 */
export function useOnboardingStep() {
  const [step, setStep] = useState<number>(1);

  // Load step from localStorage on initial load
  useEffect(() => {
    const savedStep = localStorage.getItem('floussi_onboarding_step');
    if (savedStep) {
      const parsed = parseInt(savedStep, 10);
      if (parsed >= 1 && parsed <= 4) {
        setStep(parsed);
      }
    }
  }, []);

  const setOnboardingStep = useCallback((newStep: number) => {
    if (newStep >= 1 && newStep <= 4) {
      setStep(newStep);
      localStorage.setItem('floussi_onboarding_step', newStep.toString());
    }
  }, []);

  const nextStep = useCallback(() => {
    setOnboardingStep(step + 1);
  }, [step, setOnboardingStep]);

  const prevStep = useCallback(() => {
    setOnboardingStep(step - 1);
  }, [step, setOnboardingStep]);

  const resetOnboardingSteps = useCallback(() => {
    setStep(1);
    localStorage.removeItem('floussi_onboarding_step');
  }, []);

  return {
    step,
    setStep: setOnboardingStep,
    nextStep,
    prevStep,
    resetOnboardingSteps
  };
}

/**
 * Mutation hook to submit the final onboarding data and flag the profile as onboarded.
 */
export function useCompleteOnboarding() {
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (data: {
    fullName: string;
    phone: string;
    city: string;
    language: 'fr' | 'darija';
    incomeAmount: number;
    incomeSource: string;
    payDay: number;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      // Update profile with the onboarding fields
      await updateProfile({
        full_name: data.fullName,
        phone: data.phone,
        city: data.city,
        preferred_language: data.language,
        // Mark onboarding complete by filling fields
        updated_at: new Date().toISOString()
      });

      // Clear onboarding step cache
      localStorage.removeItem('floussi_onboarding_step');
      
      return { success: true };
    } catch (err: any) {
      const formattedError = new Error(err.message || "Erreur de finalisation d'onboarding");
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile]);

  const mutate = useCallback((variables: any, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync(variables)
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}

/**
 * Mutation hook to skip onboarding and flag the profile with default Moroccan entries.
 */
export function useSkipOnboarding() {
  const { updateProfile, profile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await updateProfile({
        full_name: profile?.full_name || 'Invité Floussi',
        phone: '+212600000000',
        city: 'Casablanca',
        preferred_language: 'fr',
        updated_at: new Date().toISOString()
      });
      localStorage.removeItem('floussi_onboarding_step');
      return { success: true };
    } catch (err: any) {
      const formattedError = new Error(err.message || "Erreur de skip d'onboarding");
      setError(formattedError);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  }, [updateProfile, profile]);

  const mutate = useCallback((_variables: void, options?: { onSuccess?: (data: any) => void; onError?: (err: Error) => void }) => {
    mutateAsync()
      .then((data) => {
        if (options?.onSuccess) options.onSuccess(data);
      })
      .catch((err) => {
        if (options?.onError) options.onError(err);
      });
  }, [mutateAsync]);

  return { mutate, mutateAsync, isLoading, error };
}
