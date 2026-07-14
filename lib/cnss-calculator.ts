export type MedicalRegime = 'CNSS' | 'CNOPS';
export type ActType = 'generalist' | 'specialist' | 'hospital_public' | 'hospital_private' | 'pharma';

export interface MedicalAct {
  type: ActType;
  costPaid: number;
  daysCount?: number;
}

export interface RefRate {
  tnr: number; // Tarif National de Référence
  rateCnss: number; // Reimbursement rate (usually 70%)
  rateCnops: number; // Reimbursement rate (usually 80%)
}

export const TNR_TABLE: Record<ActType, RefRate> = {
  generalist: {
    tnr: 80, // TNR generalist consultation CNSS is 80, CNOPS is 150
    rateCnss: 0.70,
    rateCnops: 0.80
  },
  specialist: {
    tnr: 150, // TNR specialist consultation CNSS is 150, CNOPS is 250
    rateCnss: 0.70,
    rateCnops: 0.80
  },
  hospital_public: {
    tnr: 150, // per day
    rateCnss: 0.90,
    rateCnops: 0.90
  },
  hospital_private: {
    tnr: 600, // per day TNR private clinic
    rateCnss: 0.70,
    rateCnops: 0.80
  },
  pharma: {
    tnr: 1.0, // for pharma, the base is the cost of the drug (if reimbursable)
    rateCnss: 0.70,
    rateCnops: 0.80
  }
};

export interface RefundResult {
  totalPaid: number;
  refundAmount: number;
  patientShare: number;
  details: {
    type: ActType;
    costPaid: number;
    tnrApplied: number;
    reimbursementRate: number;
    refund: number;
    outOfPocket: number;
  }[];
}

export function calculateRefund(
  regime: MedicalRegime,
  acts: MedicalAct[]
): RefundResult {
  let totalPaid = 0;
  let refundAmount = 0;
  const details: RefundResult['details'] = [];

  acts.forEach(act => {
    const ref = TNR_TABLE[act.type];
    const rate = regime === 'CNSS' ? ref.rateCnss : ref.rateCnops;

    // Adjust TNR for consultations under CNOPS (CNOPS has higher reference rates)
    let tnrBase = ref.tnr;
    if (regime === 'CNOPS') {
      if (act.type === 'generalist') tnrBase = 150;
      if (act.type === 'specialist') tnrBase = 250;
    }

    let tnrApplied = tnrBase;
    let refundBase = tnrBase;

    if (act.type === 'hospital_public' || act.type === 'hospital_private') {
      const days = act.daysCount || 1;
      tnrApplied = tnrBase * days;
      refundBase = tnrApplied;
    } else if (act.type === 'pharma') {
      // Pharma uses the paid price as the reference base if listed
      tnrApplied = act.costPaid;
      refundBase = act.costPaid;
    }

    // Refund is based on the MINIMUM of actual paid cost or applied TNR base
    const baseToApply = Math.min(act.costPaid, refundBase);
    const itemRefund = Math.round(baseToApply * rate);
    const outOfPocket = act.costPaid - itemRefund;

    totalPaid += act.costPaid;
    refundAmount += itemRefund;

    details.push({
      type: act.type,
      costPaid: act.costPaid,
      tnrApplied,
      reimbursementRate: rate,
      refund: itemRefund,
      outOfPocket
    });
  });

  return {
    totalPaid,
    refundAmount,
    patientShare: totalPaid - refundAmount,
    details
  };
}
