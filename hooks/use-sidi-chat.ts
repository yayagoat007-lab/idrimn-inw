import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useTransactions } from './use-transactions';
import { useBuckets } from './use-buckets';
import { useGoals } from './use-goals';
import { useTontines } from './use-tontines';
import { useMoroccanEvents } from './use-moroccan-events';
import { useAccounts } from './use-accounts';
import { useWallet } from './use-wallet';
import { useP2PTransfer } from './use-p2p-transfer';
import { useBillPayment } from './use-bill-payment';
import { useMobileRecharge } from './use-mobile-recharge';
import { useMicroSavings } from './use-micro-savings';
import { useRemittances } from './use-remittances';
import { useRemoteFamilyOverview } from './use-remote-family-overview';
import { useChallenges } from './use-challenges';
import { useSavingsGroups } from './use-savings-groups';
import { useReferral } from './use-referral';
import { useAcademy } from './use-academy';
import { useCommunityFeed } from './use-community-feed';
import { useGamification } from './use-gamification';
import { useFloussiScore } from './use-floussi-score';
import { useWeeklyCoaching } from './use-weekly-coaching';
import { useMonthlyReview } from './use-monthly-review';
import { useOptimizationChallenges } from './use-optimization-challenges';
import { getNextTierRequirement } from '../lib/floussi-score';
import { PERSONA_TEMPLATES } from '../lib/persona-templates';
import { getMREPreference } from '../lib/currency-exchange';
import { normalizeDarija } from '../lib/darija-dictionary';
import { detectIntent } from '../lib/sidi-intents';
import { getPersonalityResponse } from '../lib/sidi-personality';
import { getCategoryById } from '../lib/categories';
import { generateId } from '../lib/utils';
import { useNotificationCenter } from './use-notification-center';
import { buildSearchIndex, searchItems } from '../lib/global-search';
import { OfflineDB } from '../lib/offline-db';

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
  const { profile, updateProfile } = useAuth();
  const userId = profile?.id || "mock-user-id-9999";

  const { createTransaction, transactions, updateTransaction } = useTransactions(userId);
  const { buckets } = useBuckets(userId);
  const { goals, contributeToGoal } = useGoals(userId);
  const { tontines } = useTontines(userId);
  const { events, createEvent } = useMoroccanEvents(userId);
  const { totalBalance } = useAccounts(userId);

  const { balance: walletBalance } = useWallet(userId);
  const { sendTransfer } = useP2PTransfer(userId);
  const { payBill } = useBillPayment(userId);
  const { rechargeMobile } = useMobileRecharge(userId);
  const { settings: microSavingsSettings } = useMicroSavings(userId);
  const { getRemittanceStats } = useRemittances(userId);
  const { stats: remoteFamilyStats } = useRemoteFamilyOverview(userId);

  const { challenges: enrichedChallenges } = useChallenges(userId);
  const { groups: savingsGroups } = useSavingsGroups(userId);
  const { referralCode, referrals } = useReferral(userId, profile?.full_name || 'Karim');
  const { modules: academyModules, completedLessons, certificates } = useAcademy(userId);
  const { createPost } = useCommunityFeed();
  const { badges, state: gamificationState } = useGamification(userId);
  const { score: floussiScoreObj } = useFloussiScore(userId);
  const { currentReport: weeklyReport } = useWeeklyCoaching(userId);
  const { currentMonthReview: monthlyReview } = useMonthlyReview(userId);
  const { availableSuggestions: optimizationSuggestions, acceptChallenge } = useOptimizationChallenges(userId);
  const { notifications, unreadCount, updatePreferences } = useNotificationCenter(userId);

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
      window.dispatchEvent(new Event('floussi_sidi_history_updated'));
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

    let isIntercepted = false;
    if (text.startsWith("Je souhaite partager : ") || text.startsWith("Bghit n-partager: ")) {
      isIntercepted = true;
      const extracted = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"')) || text.split(': ')[1] || "";
      customTextResponse = profile?.preferred_language === 'darija'
        ? `Wach bghiti t-publier had l-khbar f l-community dyalna ? Ghadi y-choufoh ga3 l-mouwatiniin.\n\n*\"${extracted}\"*`
        : `Souhaites-tu publier ce message sur le flux de la communauté ? Tous les autres utilisateurs pourront le voir.\n\n*\"${extracted}\"*`;
      quickButtons = [
        {
          label: profile?.preferred_language === 'darija' ? "Ah, n-publih 📢" : "Oui, publier 📢",
          payload: { action: "publish_confirmed", content: extracted }
        },
        {
          label: profile?.preferred_language === 'darija' ? "La, blach ❌" : "Non, annuler ❌",
          payload: { action: "dismiss_share" }
        }
      ];
      responseIntentId = 'share_achievement';
    } else if (text.startsWith("Oui, publie sur la communauté : ") || text.startsWith("Affichih f l-community: ")) {
      isIntercepted = true;
      const extracted = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"')) || text.split(': ')[1] || "";
      try {
        createPost(extracted, 'achievement');
      } catch (err) {
        console.error("Error creating post from sidi", err);
      }
      customTextResponse = profile?.preferred_language === 'darija'
        ? `Safi ! T-publia l-post dyalk f l-community b n-nja7. Allah yzid f l-baraka ! 🎉`
        : `C'est en ligne ! Ta réussite a été publiée avec succès sur le fil de la communauté. Félicitations ! 🎉`;
      responseIntentId = 'share_achievement';
    } else if (text.startsWith("Non, ne partage pas.") || text.startsWith("La, blach d l-partage")) {
      isIntercepted = true;
      customTextResponse = profile?.preferred_language === 'darija'
        ? `Wakha sidi, ghadi n-khalioha f s-siria. Hada hwa d-dmaq dyalna. 😉`
        : `Pas de souci, cela reste privé entre nous. C'est plus sage ainsi ! 😉`;
      responseIntentId = 'share_achievement';
    } else if (text.startsWith("Je souhaite commencer la leçon !") || text.startsWith("Bghit nbda d-dars !")) {
      isIntercepted = true;
      customTextResponse = profile?.preferred_language === 'darija'
        ? `D-dars bda ! Khdamna had l-module f l-Academie. T9dar t-kemlo f l-onglet Académie ! 📚`
        : `C'est parti ! Nous avons ouvert la leçon correspondante. Retrouve-la maintenant dans l'onglet Académie ! 📚`;
      responseIntentId = 'suggest_academy_lesson';
    } else if (text.startsWith("J'ai copié mon code de parrainage !") || text.startsWith("Koupit l-code parrainage dyali !")) {
      isIntercepted = true;
      customTextResponse = profile?.preferred_language === 'darija'
        ? `Safi mzyan ! Partager-h m3a shabak o l-3aila dyalak bach y-stafdo hta houma, o rbhou bjouj bi koum chouia dyal Premium ! 🎁`
        : `Parfait ! Partage-le vite avec tes proches pour leur faire découvrir Floussi et gagner ensemble des jours de plan Elite Premium ! 🎁`;
      responseIntentId = 'check_referral_status';
    } else if (text.startsWith("Je souhaite démarrer le bilan mensuel !") || text.startsWith("Bghit n-bda l-bilan mensuel !")) {
      isIntercepted = true;
      customTextResponse = profile?.preferred_language === 'darija'
        ? `Safi ! Hani ditek l l-coaching bach nbda l-bilan mensuel dyalna. Aji n-choufo sandoq sandoq ! 📈`
        : `C'est parti ! Je vous ai redirigé vers l'espace de coaching pour démarrer notre revue mensuelle guidée. 📈`;
      responseIntentId = 'start_monthly_review';
    } else if (text.startsWith("Je souhaite accepter le défi : ") || text.startsWith("Bghit n-qbel t-tahadi: ")) {
      isIntercepted = true;
      const extractedId = text.substring(text.indexOf('"') + 1, text.lastIndexOf('"')) || text.split(': ')[1] || "";
      const foundSuggestion = optimizationSuggestions?.find((s: any) => s.id === extractedId);
      if (foundSuggestion) {
        try {
          acceptChallenge(foundSuggestion);
          customTextResponse = profile?.preferred_language === 'darija'
            ? `Safi ! T-qbel t-tahadi "${foundSuggestion.title}" b n-nja7. T9dar t-tab3o f l-onglet Coach IA ! 🏆`
            : `Félicitations ! Tu as accepté le défi "${foundSuggestion.title}". Tu peux suivre sa progression dans l'onglet Coach IA ! 🏆`;
        } catch (err) {
          console.error("Error accepting optimization challenge from sidi", err);
          customTextResponse = profile?.preferred_language === 'darija'
            ? `Oups, mouchkil f l-mouassat dyal t-tahadi.`
            : `Oups, impossible d'accepter ce défi pour l'instant.`;
        }
      } else {
        customTextResponse = profile?.preferred_language === 'darija'
          ? `Safi ! T-qbel t-tahadi b n-nja7. T9dar t-tab3o f l-onglet Coach IA ! 🏆`
          : `Félicitations ! Tu as accepté le défi. Tu peux suivre sa progression dans l'onglet Coach IA ! 🏆`;
      }
      responseIntentId = 'suggest_optimization_challenge';
    } else if (text.includes("confirme le transfert") || text.includes("confirm l-transfert")) {
      isIntercepted = true;
      const firstQuoteIdx = text.indexOf('"');
      const lastQuoteIdx = text.lastIndexOf('"');
      let extractedRecipient = "";
      let extractedAmount = 0;
      if (firstQuoteIdx !== -1 && lastQuoteIdx !== -1 && firstQuoteIdx !== lastQuoteIdx) {
        const quotes = text.match(/"([^"]+)"/g);
        if (quotes && quotes.length >= 2) {
          const firstVal = quotes[0].replace(/"/g, '');
          const secondVal = quotes[1].replace(/"/g, '');
          if (!isNaN(Number(firstVal))) {
            extractedAmount = Number(firstVal);
            extractedRecipient = secondVal;
          } else {
            extractedRecipient = firstVal;
            extractedAmount = Number(secondVal);
          }
        }
      }
      const recipient = extractedRecipient || slots.recipient;
      const amount = extractedAmount || slots.amount;

      if (recipient && amount) {
        try {
          await sendTransfer(recipient, amount, "via Sidi Floussi");
          context.recipientName = recipient;
          customTextResponse = profile?.preferred_language === 'darija'
            ? `Safi ! Tsift ${amount} DH l ${recipient} b n-nja7 dyal s-sandoq. Allah y-barak lik ! 💸`
            : `C'est fait ! Un transfert de ${amount} DH a été envoyé à ${recipient} avec succès. 💸`;
        } catch (err: any) {
          customTextResponse = profile?.preferred_language === 'darija'
            ? `⚠️ Ma9dertch ntsifet l'flous: ${err.message || err}`
            : `⚠️ Impossible d'effectuer le transfert : ${err.message || err}`;
        }
      } else {
        customTextResponse = profile?.preferred_language === 'darija'
          ? "Oups, ma l9itch ma3loumat d l-transfert. 3awd t-golha lya b s-saraha."
          : "Oups, je n'ai pas pu récupérer les détails du transfert. Peux-tu reformuler ?";
      }
      responseIntentId = 'send_p2p_transfer';
    }

    if (!isIntercepted) {
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
    } else if (intentId === 'check_wallet_balance') {
      context.walletBalance = walletBalance?.balance || 0;
    } else if (intentId === 'send_p2p_transfer') {
      if (slots.amount && slots.recipient) {
        customTextResponse = profile?.preferred_language === 'darija'
          ? `Wach nta m-tafeq t-sift **${slots.amount} DH** l **${slots.recipient}** men l-wallet dyalk ? 🤔`
          : `Es-tu sûr de vouloir envoyer **${slots.amount} DH** à **${slots.recipient}** depuis ton Wallet ? 🤔`;
        quickButtons = [
          {
            label: profile?.preferred_language === 'darija' ? "Ah, n-sifto 💸" : "Oui, confirmer 💸",
            payload: { action: "confirm_transfer", recipient: slots.recipient, amount: slots.amount }
          },
          {
            label: profile?.preferred_language === 'darija' ? "La, blach ❌" : "Non, annuler ❌",
            payload: { action: "dismiss" }
          }
        ];
      } else {
        if (!slots.amount && !slots.recipient) {
          customTextResponse = profile?.preferred_language === 'darija'
            ? "L-man bghiti tsifet o chhal dyal l-flous ?"
            : "À qui souhaites-tu envoyer de l'argent et quel est le montant ?";
        } else if (!slots.amount) {
          customTextResponse = profile?.preferred_language === 'darija'
            ? `Chhal bghiti tsifet l **${slots.recipient}** ? Kteb ghir l-montant.`
            : `Quel montant souhaites-tu envoyer à **${slots.recipient}** ?`;
        } else {
          customTextResponse = profile?.preferred_language === 'darija'
            ? `L-man bghiti tsifet had **${slots.amount} DH** ? Kteb l-ism dyal l-moustafid oula l-téléphone dyalo.`
            : `À qui souhaites-tu envoyer ces **${slots.amount} DH** ? Précise le nom ou le numéro de téléphone.`;
        }
      }
    } else if (intentId === 'pay_bill_via_sidi' || intentId === 'recharge_via_sidi') {
      // Show embedded form inside message bubble
    } else if (intentId === 'check_roundup_savings') {
      context.roundupSavings = microSavingsSettings?.totalSaved || 0;
    } else if (intentId === 'check_remittance_history') {
      const isMreEnabled = getMREPreference().enabled;
      if (!isMreEnabled) {
        customTextResponse = profile?.preferred_language === 'darija'
          ? "Had l-khidma khassa b 'mghriba dyal l-3alam' (MRE). Khass t-f3al Mode MRE f l-I3dadat (Paramètres) l-awwal."
          : "Cette fonctionnalité est réservée aux Marocains Résidant à l'Étranger (MRE). Veuillez d'abord activer le Mode MRE dans les Paramètres.";
      } else {
        const stats = getRemittanceStats();
        context.remittanceTotal = stats.totalSent;
      }
    } else if (intentId === 'check_family_budget_remote') {
      const isMreEnabled = getMREPreference().enabled;
      if (!isMreEnabled) {
        customTextResponse = profile?.preferred_language === 'darija'
          ? "Had l-khidma khassa b 'mghriba dyal l-3alam' (MRE). Khass t-f3al Mode MRE f l-I3dadat (Paramètres) l-awwal."
          : "Cette fonctionnalité est réservée aux Marocains Résidant à l'Étranger (MRE). Veuillez d'abord activer le Mode MRE dans les Paramètres.";
      } else {
        context.remoteBudgetLimit = remoteFamilyStats?.totalBalance || 0;
        context.remoteBudgetSpent = remoteFamilyStats?.totalSpentThisMonth || 0;
      }
    } else if (intentId === 'check_active_challenges') {
      const activeChallenges = enrichedChallenges.filter((ch: any) => ch.joined && !ch.completed);
      context.activeChallengesCount = activeChallenges.length || enrichedChallenges.filter((ch: any) => ch.joined).length || 0;
    } else if (intentId === 'suggest_academy_lesson') {
      const personaId = profile?.persona_type || 'debutant';
      const template = PERSONA_TEMPLATES[personaId];
      const recModuleId = template?.recommendedAcademyModuleId || 'budget_basics';
      let recommendedModule = academyModules.find(m => m.id === recModuleId);
      if (!recommendedModule || recommendedModule.lessons.every(l => completedLessons.includes(l.id))) {
        const incompleteModule = academyModules.find(m => m.lessons.some(l => !completedLessons.includes(l.id)));
        if (incompleteModule) {
          recommendedModule = incompleteModule;
        }
      }
      const lessonToSuggest = recommendedModule?.lessons.find(l => !completedLessons.includes(l.id)) || recommendedModule?.lessons[0];
      context.recommendedLessonTitle = lessonToSuggest ? lessonToSuggest.title : "Gestion du budget";
      if (lessonToSuggest) {
        quickButtons = [
          {
            label: profile?.preferred_language === 'darija' ? "Bda d-dars 📖" : "Débuter la leçon 📖",
            payload: { action: "start_lesson", lessonId: lessonToSuggest.id, moduleId: recommendedModule?.id }
          }
        ];
      }
    } else if (intentId === 'check_academy_progress') {
      context.completedLessonsCount = completedLessons.length;
      context.certificatesCount = certificates.length;
    } else if (intentId === 'check_referral_status') {
      context.referralCode = referralCode || 'FLOUSSI-PRO';
      context.invitedFriendsCount = referrals.length;
      quickButtons = [
        {
          label: profile?.preferred_language === 'darija' ? "Koupi l-Koud 📋" : "Copier le Code 📋",
          payload: { action: "copy_referral_code", code: referralCode }
        }
      ];
    } else if (intentId === 'check_savings_group') {
      const userGroups = savingsGroups.filter(g => g.memberIds.includes(userId));
      context.savingsGroupCount = userGroups.length;
      context.savingsGroupBalance = userGroups.reduce((acc, g) => acc + g.currentAmount, 0);
    } else if (intentId === 'share_achievement') {
      const completedG = goals.filter(g => g.current_amount >= g.target_amount);
      const unlockedB = badges.filter(b => b.unlockedAt === 'Débloqué');
      const fScore = floussiScoreObj?.totalScore || 350;

      quickButtons = [];
      if (completedG.length > 0) {
        const lastGoal = completedG[completedG.length - 1];
        const textToShare = profile?.preferred_language === 'darija'
          ? `L-Hamdoulilah ! Wsselt l l-hadaf dyali "${lastGoal.name}" d ${lastGoal.target_amount} DH f Floussi ! 🎯🇲🇦`
          : `Objectif atteint ! J'ai complété mon projet d'épargne "${lastGoal.name}" de ${lastGoal.target_amount} DH sur Floussi ! 🎯🇲🇦`;
        quickButtons.push({
          label: profile?.preferred_language === 'darija' ? `Hadaf: ${lastGoal.name} 🎯` : `Objectif : ${lastGoal.name} 🎯`,
          payload: { action: "propose_share", text: textToShare }
        });
      }
      if (unlockedB.length > 0) {
        const lastBadge = unlockedB[unlockedB.length - 1];
        const textToShare = profile?.preferred_language === 'darija'
          ? `Hani rbeht l-badge "${lastBadge.title}" ${lastBadge.emoji} f Floussi ! 🏆🇲🇦`
          : `Badge débloqué ! Je viens de remporter le badge "${lastBadge.title}" ${lastBadge.emoji} sur l'application Floussi ! 🏆🇲🇦`;
        quickButtons.push({
          label: profile?.preferred_language === 'darija' ? `Badge: ${lastBadge.title} 🏆` : `Badge : ${lastBadge.title} 🏆`,
          payload: { action: "propose_share", text: textToShare }
        });
      }
      const scoreText = profile?.preferred_language === 'darija'
        ? `Score Floussi dyali wssel l ${fScore} pts ! 📈🇲🇦`
        : `Mon Score Floussi d'intelligence financière s'élève à ${fScore} points ! 📈🇲🇦`;
      quickButtons.push({
        label: `Score Floussi: ${fScore} pts 📈`,
        payload: { action: "propose_share", text: scoreText }
      });
    } else if (intentId === 'check_floussi_score') {
      const fScore = floussiScoreObj?.totalScore || 350;
      const fTier = floussiScoreObj?.tier || 'Débutant';
      context.floussiScore = fScore;
      context.floussiTier = fTier;
    } else if (intentId === 'explain_score_breakdown') {
      const fScore = floussiScoreObj?.totalScore || 350;
      const fComponents = floussiScoreObj?.components || { financialHealth: 50, gamificationProgress: 40, consistency: 50, engagement: 40 };
      const req = getNextTierRequirement(fScore, fComponents, profile?.preferred_language === 'darija' ? 'darija' : 'fr');
      context.pointsToNextTier = req.pointsNeeded;
      context.scoreTip = req.tip;
    } else if (intentId === 'check_weekly_report') {
      const tier = profile?.subscription_tier || 'free';
      const isEligible = tier === 'analyse' || tier === 'elite';
      if (!isEligible) {
        responseIntentId = 'premium_upgrade_required';
      } else {
        context.weeklyReportSummary = weeklyReport?.summary || (profile?.preferred_language === 'darija'
          ? "Safi, l-osimana dyalk kant mzyana m3a l-masarif, l-baraka f s-sandoq !"
          : "Félicitations pour votre gestion rigoureuse de vos enveloppes cette semaine !");
      }
    } else if (intentId === 'start_monthly_review') {
      const tier = profile?.subscription_tier || 'free';
      const isEligible = tier === 'analyse' || tier === 'elite';
      if (!isEligible) {
        responseIntentId = 'premium_upgrade_required';
      } else {
        context.monthlyReviewMonth = monthlyReview?.month || "ce mois-ci";
        quickButtons = [
          {
            label: profile?.preferred_language === 'darija' ? "Bda l-Bilan dyal Chhar 📊" : "Lancer le Bilan Mensuel 📊",
            payload: { action: "open_monthly_review" }
          }
        ];
      }
    } else if (intentId === 'suggest_optimization_challenge') {
      const tier = profile?.subscription_tier || 'free';
      const isEligible = tier === 'analyse' || tier === 'elite';
      if (!isEligible) {
        responseIntentId = 'premium_upgrade_required';
      } else {
        const suggestion = optimizationSuggestions && optimizationSuggestions.length > 0 ? optimizationSuggestions[0] : null;
        context.optimizationChallengeTitle = suggestion ? suggestion.title : (profile?.preferred_language === 'darija' ? "Zéro café en dehors du foyer" : "Réduction du sandoq Loisirs de 10%");
        if (suggestion) {
          quickButtons = [
            {
              label: profile?.preferred_language === 'darija' ? "N-9bel t-tahadi 🏆" : "Accepter le Défi 🏆",
              payload: { action: "accept_optimization_challenge", suggestionId: suggestion.id }
            }
          ];
        }
      }
    } else if (intentId === 'check_unread_notifications') {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      context.unreadNotificationsCount = unreadNotifs.length;
      
      if (unreadNotifs.length > 0) {
        const counts: Record<string, number> = {};
        unreadNotifs.forEach(n => {
          counts[n.category || 'system'] = (counts[n.category || 'system'] || 0) + 1;
        });

        const categorySummaryPartsFr: string[] = [];
        const categorySummaryPartsDarija: string[] = [];

        if (counts['urgent_financial']) {
          categorySummaryPartsFr.push(`${counts['urgent_financial']} alerte(s) financière(s) ou tontine`);
          categorySummaryPartsDarija.push(`${counts['urgent_financial']} tanbih(at) dyal l-masrouf`);
        }
        if (counts['sidi']) {
          categorySummaryPartsFr.push(`${counts['sidi']} conseil(s) de Sidi`);
          categorySummaryPartsDarija.push(`${counts['sidi']} nasiha/nasaih dyal Sidi`);
        }
        if (counts['gamification']) {
          categorySummaryPartsFr.push(`${counts['gamification']} badge(s) débloqué(s)`);
          categorySummaryPartsDarija.push(`${counts['gamification']} badge(s) rbehtih(oum)`);
        }
        if (counts['social']) {
          categorySummaryPartsFr.push(`${counts['social']} alerte(s) de la communauté`);
          categorySummaryPartsDarija.push(`${counts['social']} notification(s) d l-community`);
        }
        if (counts['system']) {
          categorySummaryPartsFr.push(`${counts['system']} message(s) système`);
          categorySummaryPartsDarija.push(`${counts['system']} tanbih(at) d l-application`);
        }

        context.notificationSummary = profile?.preferred_language === 'darija'
          ? `3andek ${categorySummaryPartsDarija.join(' o ')} — bghiti n-fssal lik f l-khbar?`
          : `Tu as ${categorySummaryPartsFr.join(' et ')} — veux-tu que je détaille lesquelles ?`;
          
        quickButtons = [
          {
            label: profile?.preferred_language === 'darija' ? "Tchouf l-tanbihat 🔔" : "Voir les alertes 🔔",
            payload: { action: "navigate", url: "/settings" }
          }
        ];
      } else {
        context.notificationSummary = profile?.preferred_language === 'darija'
          ? "Ma 3andek hta tanbih jdid, koulchi fl-aman o l-baraka f s-sandoq ! ✨"
          : "Aucune nouvelle notification pour le moment. Tout est parfaitement sous contrôle ! ✨";
      }
    } else if (intentId === 'search_via_sidi') {
      const query = slots.search_query || '';
      context.searchQuery = query;

      const index = await buildSearchIndex(userId);
      const results = searchItems(query, index);
      const topResults = results.slice(0, 4);

      context.searchResultsCount = results.length;

      if (results.length > 0) {
        const resultsList = topResults.map(item => {
          const typeLabel = item.type === 'transaction' ? '🧾 Transaction' :
                            item.type === 'bucket' ? '📂 Enveloppe' :
                            item.type === 'goal' ? '🎯 Objectif' :
                            item.type === 'tontine' ? '👥 Tontine' :
                            item.type === 'networth' ? '💼 Patrimoine' :
                            item.type === 'community_post' ? '💬 Forum' :
                            item.type === 'academy_lesson' ? '📚 Académie' : '⚙️ Action';
          return `- **${item.title}** (${typeLabel}) : *${item.subtitle}*`;
        }).join('\n');

        context.searchResultsSummary = `\n\n${resultsList}`;

        quickButtons = topResults.map(item => {
          let targetUrl = `/${item.navigationTarget}`;
          if (item.navigationTarget === 'wallet') targetUrl = '/net-worth';
          if (item.navigationTarget.startsWith('action:')) {
            targetUrl = item.navigationTarget.replace('action:', '/');
          }
          return {
            label: `${item.title.slice(0, 15)}${item.title.length > 15 ? '...' : ''} ➔`,
            payload: { action: "navigate", url: targetUrl }
          };
        });
      } else {
        context.searchResultsSummary = profile?.preferred_language === 'darija'
          ? "Walou, ma l9it hta chi n-natija d l-ba7t."
          : "Je n'ai trouvé aucune correspondance pour ce terme.";
      }
    } else if (intentId === 'update_preference_via_sidi') {
      const lowerText = text.toLowerCase();
      const isSensitive = lowerText.includes("supprime") || lowerText.includes("delete") || lowerText.includes("mot de passe") || lowerText.includes("password") || lowerText.includes("desactive mon compte") || lowerText.includes("désactiver mon compte");

      if (isSensitive) {
        context.preferenceStatus = profile?.preferred_language === 'darija'
          ? "had l-bedilat sensitive (khalas, koud d-khoul...) khassak t-dirhoum f l-Paramètres dyalk direct"
          : "les modifications sensibles (mot de passe, abonnement, suppression...) doivent être effectuées directement dans vos Paramètres pour votre sécurité";
        
        quickButtons = [
          {
            label: profile?.preferred_language === 'darija' ? "Mchi l l-Paramètres ⚙️" : "Aller aux Paramètres ⚙️",
            payload: { action: "navigate", url: "/settings" }
          }
        ];
      } else {
        const key = slots.preference_key;
        const val = slots.preference_value;

        if (key === 'language' && (val === 'fr' || val === 'darija')) {
          try {
            updateProfile({ preferred_language: val });
          } catch (e) {
            console.error("Error updating language via sidi", e);
          }
          context.preferenceStatus = val === 'fr' ? "Langue changée en Français 🇫🇷" : "L-lougha t-bedlet l d-Darija 🇲🇦";
        } else if (key === 'theme' && (val === 'dark' || val === 'light')) {
          localStorage.setItem('theme_auto_night', val === 'dark' ? 'true' : 'false');
          OfflineDB.set('active_theme_id', val === 'dark' ? 'dark' : 'default');
          context.preferenceStatus = val === 'dark'
            ? (profile?.preferred_language === 'darija' ? "T-mote dyal l-nuit t-fa3al 🌙" : "Thème nuit automatique activé 🌙")
            : (profile?.preferred_language === 'darija' ? "Thème light t-fa3al ☀️" : "Thème clair activé ☀️");
          window.dispatchEvent(new Event('storage'));
        } else if (key === 'quiet_hours' && (val === 'enabled' || val === 'disabled')) {
          updatePreferences({ quietHoursEnabled: val === 'enabled' });
          context.preferenceStatus = val === 'enabled'
            ? (profile?.preferred_language === 'darija' ? "t-tanbihat dyal l-nuit t-sakto (Quiet Hours fa3al) 🔕" : "notifications de nuit désactivées (heures silencieuses activées) 🔕")
            : (profile?.preferred_language === 'darija' ? "t-tanbihat dyal l-nuit t-khadmo (Quiet Hours mtafe) 🔔" : "notifications de nuit activées (heures silencieuses désactivées) 🔔");
        } else {
          context.preferenceStatus = profile?.preferred_language === 'darija'
            ? "ma fhamtch chnou l-preference li bghiti t-bedel. T9dar t-gouliya 'change ma langue en darija' oula 'active le mode nuit' !"
            : "je n'ai pas compris quelle préférence vous souhaitez modifier. Vous pouvez me dire par exemple 'change ma langue en français' ou 'active le mode nuit' !";
        }
      }
    }
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
  }, [messages, profile?.full_name, profile?.preferred_language, profile?.persona_type, profile?.subscription_tier, createTransaction, buckets, goals, tontines, events, saveHistory, transactions, walletBalance?.balance, sendTransfer, microSavingsSettings?.totalSaved, getRemittanceStats, remoteFamilyStats, enrichedChallenges, savingsGroups, referralCode, referrals, academyModules, completedLessons, certificates, createPost, badges, floussiScoreObj, weeklyReport, monthlyReview, optimizationSuggestions, acceptChallenge, notifications, updatePreferences, updateProfile, userId]);

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
