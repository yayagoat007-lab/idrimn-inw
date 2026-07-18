import { useState, useEffect, useRef } from 'react';
import { useTransactions } from './use-transactions';

export function useFirstTransactionMoment(userId: string = "mock-user-id-9999") {
  const { transactions } = useTransactions(userId);
  const [isFirstTransactionCelebration, setIsFirstTransactionCelebration] = useState(false);
  const prevLengthRef = useRef<number | null>(null);

  useEffect(() => {
    // If already celebrated, don't do anything
    const isCelebrated = localStorage.getItem('floussi_first_transaction_celebrated') === 'true';
    if (isCelebrated) {
      return;
    }

    if (prevLengthRef.current !== null) {
      // Detect transition from 0 transactions to 1 transaction
      if (prevLengthRef.current === 0 && transactions.length === 1) {
        setIsFirstTransactionCelebration(true);
      }
    }

    prevLengthRef.current = transactions.length;
  }, [transactions.length]);

  const dismissCelebration = () => {
    localStorage.setItem('floussi_first_transaction_celebrated', 'true');
    setIsFirstTransactionCelebration(false);
  };

  return {
    isFirstTransactionCelebration,
    dismissCelebration
  };
}
