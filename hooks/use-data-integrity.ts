import { useState, useCallback } from 'react';
import { runIntegrityCheck, IntegrityIssue } from '../lib/data-integrity-checker';
import { applyFix as applyFixLib } from '../lib/data-integrity-fixer';

export function useDataIntegrity(userId: string) {
  const [issues, setIssues] = useState<IntegrityIssue[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [fixedCount, setFixedCount] = useState<number>(0);

  const runCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const results = await runIntegrityCheck(userId);
      setIssues(results);
    } catch (error) {
      console.error('[useDataIntegrity] Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  const applyFix = useCallback(async (issueId: string, choice?: string): Promise<boolean> => {
    const targetIssue = issues.find(issue => issue.id === issueId);
    if (!targetIssue) return false;

    const result = await applyFixLib(targetIssue, choice);
    if (result.success) {
      setFixedCount(prev => prev + 1);
      // Re-run checking to refresh issues list after fixing
      const updatedResults = await runIntegrityCheck(userId);
      setIssues(updatedResults);
      return true;
    }
    return false;
  }, [issues, userId]);

  return {
    issues,
    isChecking,
    runCheck,
    applyFix,
    fixedCount
  };
}
