import { useState, useEffect, useCallback, useMemo } from 'react';
import { Challenge, ChallengeParticipation } from '../types';
import { SEED_CHALLENGES } from '../lib/community-seed-data';
import { useTransactions } from './use-transactions';
import { useGoals } from './use-goals';
import { useGamification } from './use-gamification';
import { calculateChallengeProgress } from '../lib/challenges';

export function useChallenges(userId: string = "mock-user-id-9999") {
  const { transactions } = useTransactions(userId);
  const { contributions } = useGoals(userId);
  const { addXp, unlockBadge } = useGamification(userId);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipation[]>([]);

  // 1. Initialise challenges and participations
  useEffect(() => {
    const localChallenges = localStorage.getItem('floussi_challenges');
    const localParticipations = localStorage.getItem('floussi_challenge_participations');

    let initialChalls = SEED_CHALLENGES;
    if (localChallenges) {
      try {
        initialChalls = JSON.parse(localChallenges);
      } catch (e) {
        console.error('Error parsing challenges', e);
      }
    } else {
      localStorage.setItem('floussi_challenges', JSON.stringify(SEED_CHALLENGES));
    }

    let initialParts: ChallengeParticipation[] = [];
    if (localParticipations) {
      try {
        initialParts = JSON.parse(localParticipations);
      } catch (e) {
        console.error('Error parsing challenge participations', e);
      }
    } else {
      // Seed an initial joined participation for demo purposes
      initialParts = [
        {
          userId,
          challengeId: 'chall-1',
          currentValue: 0,
          joinedAt: new Date().toISOString(),
          completed: false
        }
      ];
      localStorage.setItem('floussi_challenge_participations', JSON.stringify(initialParts));
    }

    setChallenges(initialChalls);
    setParticipations(initialParts);
  }, [userId]);

  // Save participations helper
  const saveParticipations = useCallback((updated: ChallengeParticipation[]) => {
    setParticipations(updated);
    localStorage.setItem('floussi_challenge_participations', JSON.stringify(updated));
  }, []);

  // 2. Join a challenge
  const joinChallenge = useCallback((challengeId: string) => {
    const alreadyJoined = participations.some(p => p.challengeId === challengeId && p.userId === userId);
    if (alreadyJoined) return;

    const newParticipation: ChallengeParticipation & { xpAwarded?: boolean } = {
      userId,
      challengeId,
      currentValue: 0,
      joinedAt: new Date().toISOString(),
      completed: false,
      xpAwarded: false
    };

    const updated = [...participations, newParticipation];
    saveParticipations(updated);

    // Minor XP for joining challenges to incentivize user activity
    addXp(15, "Rejoint un défi communautaire ! 🚀");
  }, [participations, userId, saveParticipations, addXp]);

  // 3. Leave a challenge
  const leaveChallenge = useCallback((challengeId: string) => {
    const updated = participations.filter(p => !(p.challengeId === challengeId && p.userId === userId));
    saveParticipations(updated);
  }, [participations, userId, saveParticipations]);

  // 4. Enrich challenges with dynamic live progress and completed states
  const enrichedChallenges = useMemo(() => {
    return challenges.map(challenge => {
      const participation = participations.find(p => p.challengeId === challenge.id && p.userId === userId) as any;
      const joined = !!participation;

      // Calculate the actual dynamic live progress value based on current real data
      const liveProgressValue = calculateChallengeProgress(challenge, transactions, contributions);
      const target = challenge.targetValue;
      const progressPercent = Math.min(100, Math.round((liveProgressValue / target) * 100));
      const completed = progressPercent >= 100;

      // Check if we need to award XP (if completed and not awarded yet)
      if (joined && completed && !participation.xpAwarded) {
        // Trigger microtask to update participation state and award XP
        setTimeout(() => {
          const updatedParts = participations.map(p => {
            if (p.challengeId === challenge.id && p.userId === userId) {
              return { ...p, completed: true, xpAwarded: true };
            }
            return p;
          });
          saveParticipations(updatedParts);

          // Award the full XP reward of the challenge!
          const reward = challenge.xpReward || 100;
          addXp(reward, `Défi relevé : ${challenge.title} ! 🎉`);
          
          // Unlock special challenge badges
          unlockBadge('challenge_solved');
          if (challenge.type === 'savings') {
            unlockBadge('savings_champ');
          } else if (challenge.type === 'ocr_scan') {
            unlockBadge('ocr_master');
          }
        }, 100);
      }

      return {
        ...challenge,
        joined,
        currentValue: liveProgressValue,
        progressPercent,
        completed
      };
    });
  }, [challenges, participations, transactions, contributions, userId, addXp, unlockBadge, saveParticipations]);

  return {
    challenges: enrichedChallenges,
    joinChallenge,
    leaveChallenge
  };
}
export default useChallenges;
