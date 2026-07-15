/**
 * Inactivity Detector for Floussi
 * Helps track how long the user has been away and determines if they should receive a winback message.
 */

export type InactivityTier = 'active' | 'day_3' | 'day_7' | 'day_30' | 'day_90_plus';

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Record the current timestamp as the last active timestamp for the user
 */
export function recordLastActiveTimestamp(userId: string): void {
  if (!userId) return;
  try {
    if (typeof window !== 'undefined') {
      // If we don't have a session start timestamp recorded yet, record the previous localStorage value
      if (!sessionStorage.getItem(`floussi_session_active_${userId}`)) {
        const previousActive = localStorage.getItem(`floussi_last_active_${userId}`);
        if (previousActive) {
          sessionStorage.setItem(`floussi_session_start_last_active_${userId}`, previousActive);
        }
        sessionStorage.setItem(`floussi_session_active_${userId}`, 'true');
      }
    }
    localStorage.setItem(`floussi_last_active_${userId}`, Date.now().toString());
  } catch (e) {
    console.error("Failed to save last active timestamp", e);
  }
}

/**
 * Get the inactivity tier based on the saved last active timestamp
 */
export function getInactivityTier(userId: string): InactivityTier {
  if (!userId) return 'active';
  
  try {
    let lastActiveStr = null;
    if (typeof window !== 'undefined') {
      lastActiveStr = sessionStorage.getItem(`floussi_session_start_last_active_${userId}`);
    }
    if (!lastActiveStr) {
      lastActiveStr = localStorage.getItem(`floussi_last_active_${userId}`);
    }
    
    if (!lastActiveStr) {
      // First time or cleared storage, consider active to avoid immediate popup on new users
      return 'active';
    }

    const lastActive = parseInt(lastActiveStr, 10);
    if (isNaN(lastActive)) return 'active';

    const now = Date.now();
    const diffMs = now - lastActive;
    const diffDays = diffMs / MS_IN_DAY;

    if (diffDays >= 90) {
      return 'day_90_plus';
    } else if (diffDays >= 30) {
      return 'day_30';
    } else if (diffDays >= 7) {
      return 'day_7';
    } else if (diffDays >= 3) {
      return 'day_3';
    } else {
      return 'active';
    }
  } catch (e) {
    console.error("Error reading last active timestamp", e);
    return 'active';
  }
}

/**
 * Determine if a winback message should be triggered.
 * Avoid spamming if they have already seen the winback message for this inactivity tier.
 */
export function shouldTriggerWinBack(userId: string, lastWinBackShown: string | null): boolean {
  const currentTier = getInactivityTier(userId);
  
  // Active users don't get winback messages
  if (currentTier === 'active') {
    return false;
  }

  // If we already showed a winback modal for this specific tier, do not show it again
  if (lastWinBackShown === currentTier) {
    return false;
  }

  return true;
}
