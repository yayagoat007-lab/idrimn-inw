import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useTransactions } from './use-transactions';
import { useBuckets } from './use-buckets';
import { useGoals } from './use-goals';
import { useTontines } from './use-tontines';
import { useMoroccanEvents } from './use-moroccan-events';
import { useAccounts } from './use-accounts';
import { normalizeDarija } from '../lib/darija-dictionary';
import { detectIntent } from '../lib/sidi-intents';
import { getPersonalityResponse } from '../lib/sidi-personality';
import { getCategoryById } from '../lib/categories';
import { generateId } from '../lib/utils';

export interface SidiMessage {
  id: string;
  sender: 'user' | 'sidi';
  text: string;
  timestamp: string;
  intentId?: string;
  actionPayload?: Record<string, any>;
  quickButtons?: { label: string; payload: Record<string, any> }[];
}

export function useSidiChat() {
  const { profile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";

  const { createTransaction, transactions, updateTransaction } = useTransactions(userId);
  const { buckets } = useBuckets(userId);
  const { goals, contributeToGoal } = useGoals(userId);
  const { tontines } = useTontines(userId);
  const { events, createEvent } = useMoroccanEvents(userId);
  const { totalBalance } = useAccounts(userId);

  const [messages, setMessages] = useState<SidiMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const historyKey = `floussi_sidi_history_${userId}`;

  // Load chat history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        setMessages(JSON.parse(raw));
      } else {
        // Welcoming message
        const welcomeText = getPersonalityResponse('greeting', {
          fullName: profile?.full_name || undefined,
          lang: profile?.preferred_language
        });
        const welcomeMsg: SidiMessage = {
          id: `welcome-${Date.now()}`,
          sender: 'sidi',
          text: welcomeText,
          timestamp: new Date().toISOString(),
          intentId: 'greeting'
        };
        setMessages([welcomeMsg]);
        localStorage.setItem(historyKey, JSON.stringify([welcomeMsg]));
      }
    } catch (_) {}
  }, [userId, profile?.full_name, profile?.preferred_language]);

  // Save chat history
  const saveHistory = useCallback((nextMsgs: SidiMessage[]) => {
    setMessages(nextMsgs);
    try {
      localStorage.setItem(historyKey, JSON.stringify(nextMsgs));
    } catch (_) {}
  }, [historyKey]);

  // Clears chat history
  const clearHistory = useCallback(() => {
    const welcomeText = getPersonalityResponse('greeting', {
      fullName: profile?.full_name || undefined,
      lang: profile?.preferred_language
    });
    const welcomeMsg: SidiMessage = {
      id: `welcome-${Date.now()}`,
      sender: 'sidi',
      text: welcomeText,
      timestamp: new Date().toISOString(),
      intentId: 'greeting'
    };
    saveHistory([welcomeMsg]);
  }, [profile?.full_name, profile?.preferred_language, saveHistory]);

  // Send a message
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: SidiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    const nextMessages = [...messages, userMsg];
    saveHistory(nextMessages);
    setIsTyping(true);

    // Track sidi_friend badge: 10 or more user messages
    const userMsgCount = nextMessages.filter(m => m.sender === 'user').length;
    if (userMsgCount >= 10) {
      import('../lib/gamification').then(({ unlockGlobalBadge }) => {
        unlockGlobalBadge(userId, 'sidi_friend');
      }).catch(err => console.error(err));
    }

    // AI typing delay
    const typingDelay = 400 + Math.random() * 400; // 400ms to 800ms
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    // 1. Normalize user message using the dictionary
    const normalized = normalizeDarija(text);

    // 2. Classify intent and parse slots
    const detection = detectIntent(normalized, text);
    const intentId = detection.intent.id;
    const slots = detection.slots;

    // 3. Prepare response context
    const context: Record<string, any> = {
      fullName: profile?.full_name || undefined,
      lang: profile?.preferred_language || 'fr',
      amount: slots.amount,
      merchant: slots.merchant
    };

    context.totalBalance = totalBalance;

    // Calculate unallocated
    let allocated = buckets.reduce((sum, b) => sum + b.allocated_amount, 0);
    context.unallocated = Math.max(0, totalBalance - allocated);

    // Action execution based on recognized intent
    let customTextResponse = "";
    let quickButtons: SidiMessage['quickButtons'] = undefined;
    let responseIntentId = intentId;

    if (intentId === 'add_expense' && slots.amount) {
      const isUncertain = !slots.category;
      const category = slots.category || 'non_categorise';
      const bucket = buckets.find(b => b.category === category);
      const bucketId = bucket ? bucket.id : null;

      // Executing real action
      const createdTx = await createTransaction({
        account_id: "acc-cash", // default cash
        bucket_id: bucketId,
        type: "expense",
        amount: slots.amount,
        description: text.length > 50 ? text.slice(0, 47) + "..." : text,
        merchant: slots.merchant || "Moul Hanout",
        category: category,
        tags: ["sidi-chat", "cash"],
        receipt_url: null,
        is_recurring: false,
        recurring_frequency: null,
        transaction_date: new Date().toISOString().split('T')[0]
      });

      // Enrich context
      if (category === 'non_categorise') {
        context.categoryName = profile?.preferred_language === 'darija' ? "غير مصنف" : "Non catégorisé";
      } else {
        context.categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      }

      if (bucket) {
        context.bucketName = bucket.name;
        context.bucketAllocated = bucket.allocated_amount;
        context.bucketSpent = (bucket.spent_amount || 0) + slots.amount;
      }

      if (isUncertain) {
        // Compute 3-4 most frequent categories
        const categoryCounts: Record<string, number> = {};
        transactions
          .filter(t => t.type === 'expense' && t.category && t.category !== 'non_categorise')
          .forEach(t => {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
          });

        const sortedCategories = Object.keys(categoryCounts)
          .sort((a, b) => categoryCounts[b] - categoryCounts[a]);

        const defaultFallbacks = ['alimentation', 'transport', 'telecom', 'loisirs'];
        const topCategories = [...sortedCategories];
        for (const fallback of defaultFallbacks) {
          if (!topCategories.includes(fallback)) {
            topCategories.push(fallback);
          }
        }
        const finalSuggestions = topCategories.slice(0, 4);

        // Generate quick buttons
        quickButtons = finalSuggestions.map(catId => {
          const catObj = getCategoryById(catId);
          const label = catObj 
            ? (profile?.preferred_language === 'darija' ? catObj.name_darija : catObj.name_fr)
            : catId;
          return {
            label,
            payload: {
              action: "correct_category",
              transactionId: createdTx.id,
              category: catId
            }
          };
        });

        responseIntentId = 'add_expense_uncertain';
      }
    } else if (intentId === 'add_income' && slots.amount) {
      await createTransaction({
        account_id: "acc-checking", // default bank
        bucket_id: null,
        type: "income",
        amount: slots.amount,
        description: text.length > 50 ? text.slice(0, 47) + "..." : text,
        merchant: slots.merchant || "Société",
        category: "revenus",
        tags: ["sidi-chat", "virement"],
        receipt_url: null,
        is_recurring: false,
        recurring_frequency: null,
        transaction_date: new Date().toISOString().split('T')[0]
      });
      context.categoryName = "Revenu";
    } else if (intentId === 'check_bucket_status') {
      const category = slots.category || 'alimentation';
      const bucket = buckets.find(b => b.category === category) || buckets[0];
      if (bucket) {
        context.bucketName = bucket.name;
        context.bucketAllocated = bucket.allocated_amount;
        context.bucketSpent = bucket.spent_amount;
      }
    } else if (intentId === 'check_goal_progress') {
      const targetGoal = goals.find(g => g.name.toLowerCase().includes((slots.target_name || "").toLowerCase())) || goals[0];
      if (targetGoal) {
        context.goalName = targetGoal.name;
        context.goalTarget = targetGoal.target_amount;
        context.goalCurrent = targetGoal.current_amount;
      }
    } else if (intentId === 'check_tontine_reminder') {
      const targetTontine = tontines[0];
      if (targetTontine) {
        context.tontineName = targetTontine.name;
        context.tontineAmount = targetTontine.contribution_amount;
        context.tontineDueDate = targetTontine.start_date;
      }
    } else if (intentId === 'check_event_countdown') {
      const targetEvent = events[0];
      if (targetEvent) {
        context.eventName = targetEvent.name;
        const targetDate = new Date(targetEvent.start_date);
        const diffTime = targetDate.getTime() - Date.now();
        context.eventCountdownDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        // Prompt profile activation proposal
        quickButtons = [
          { label: "Oui, activer !", payload: { action: "activate_seasonal_profile", event_id: targetEvent.id } },
          { label: "Non, merci", payload: { action: "dismiss" } }
        ];
      }
    } else if (intentId === 'how_to_save') {
      quickButtons = [
        { label: "Économiser sur l'Ahwa ☕", payload: { action: "tip_save_coffee" } },
        { label: "Éviter le crédit 🚫", payload: { action: "tip_avoid_loans" } }
      ];
    } else if (intentId === 'zakat_calculator') {
      const goldGoal = goals.find(g => g.name.toLowerCase().includes("or") || g.name.toLowerCase().includes("dhab"));
      const balanceToUse = goldGoal ? goldGoal.current_amount : totalBalance;
      const zakatValue = Math.round(balanceToUse * 0.025);
      customTextResponse = `Zakat al-Maal 🕋 : Ton épargne est estimée à **${balanceToUse} DH**. Si elle stagne depuis 1 an et dépasse le Nissab, le montant de ta Zakat à verser (2,5%) est de **${zakatValue} DH**. Allah ytaqabbal !`;
    }

    // 4. Generate final text response
    const botText = customTextResponse || getPersonalityResponse(responseIntentId, context);

    const sidiMsg: SidiMessage = {
      id: `sidi-${Date.now()}`,
      sender: 'sidi',
      text: botText,
      timestamp: new Date().toISOString(),
      intentId: responseIntentId,
      quickButtons
    };

    saveHistory([...nextMessages, sidiMsg]);
    setIsTyping(false);
  }, [messages, profile?.full_name, profile?.preferred_language, createTransaction, buckets, goals, tontines, events, saveHistory, transactions]);

  // Handle correcting transaction category
  const handleCorrection = useCallback(async (transactionId: string, categoryId: string) => {
    const bucket = buckets.find(b => b.category === categoryId);
    const bucketId = bucket ? bucket.id : null;

    await updateTransaction(transactionId, {
      category: categoryId,
      bucket_id: bucketId
    });

    const catObj = getCategoryById(categoryId);
    const catLabel = catObj 
      ? (profile?.preferred_language === 'darija' ? catObj.name_darija : catObj.name_fr)
      : categoryId;

    const userMsg: SidiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `${profile?.preferred_language === 'darija' ? 'تصنيف' : 'Catégorie'} : ${catLabel}`,
      timestamp: new Date().toISOString()
    };

    const botText = profile?.preferred_language === 'darija'
      ? `صافي، بدلت التصنيف لـ **${catLabel}** ! الحسابات تلمّات دابا. ✨`
      : `Safi, j'ai corrigé la catégorie en **${catLabel}** ! Tes enveloppes sont à jour maintenant. ✨`;

    const sidiMsg: SidiMessage = {
      id: `sidi-${Date.now()}`,
      sender: 'sidi',
      text: botText,
      timestamp: new Date().toISOString(),
      intentId: 'correct_category'
    };

    saveHistory([...messages, userMsg, sidiMsg]);
  }, [messages, buckets, updateTransaction, saveHistory, profile?.preferred_language]);

  return {
    messages,
    isTyping,
    sendMessage,
    clearHistory,
    handleCorrection
  };
}
