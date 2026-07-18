export interface TourStep {
  targetSelector: string; // CSS selector or data-tour-id selector e.g. '[data-tour-id="solde"]'
  title: {
    fr: string;
    darija: string;
  };
  description: {
    fr: string;
    darija: string;
  };
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourDefinition {
  id: string;
  steps: TourStep[];
}

export function hasCompletedTour(userId: string, tourId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`floussi_tour_completed_${tourId}_${userId}`) === 'true';
}

export function hasSkippedTour(userId: string, tourId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`floussi_tour_skipped_${tourId}_${userId}`) === 'true';
}

export function markTourCompleted(userId: string, tourId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_tour_completed_${tourId}_${userId}`, 'true');
}

export function markTourSkipped(userId: string, tourId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`floussi_tour_skipped_${tourId}_${userId}`, 'true');
}

export function resetTourStatus(userId: string, tourId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`floussi_tour_completed_${tourId}_${userId}`);
  localStorage.removeItem(`floussi_tour_skipped_${tourId}_${userId}`);
}
