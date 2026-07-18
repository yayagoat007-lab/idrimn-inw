import React, { useState, useEffect } from 'react';
import { formatDualCurrency, getMREPreference } from '../../lib/currency-exchange';

interface DualCurrencyAmountProps {
  amountMAD: number;
  className?: string;
  currencyClassName?: string;
}

export function DualCurrencyAmount({ amountMAD, className = '', currencyClassName = '' }: DualCurrencyAmountProps) {
  const [pref, setPref] = useState({ enabled: false, currency: 'EUR' });

  useEffect(() => {
    setPref(getMREPreference());
    const interval = setInterval(() => {
      const p = getMREPreference();
      setPref(p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (!pref.enabled) {
    const formatterMAD = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', currencyDisplay: 'code' });
    const formattedMAD = formatterMAD.format(amountMAD).replace('MAD', 'DH').trim();
    return <span className={className}>{formattedMAD}</span>;
  }

  const text = formatDualCurrency(amountMAD, pref.currency);
  const match = text.match(/(.*)\s\((≈\s.*)\)/);
  if (match) {
    return (
      <span className={`${className} inline-flex items-baseline gap-1`}>
        <span>{match[1]}</span>
        <span className={`text-[0.8em] font-medium text-slate-400 ${currencyClassName}`}>
          ({match[2]})
        </span>
      </span>
    );
  }

  return <span className={className}>{text}</span>;
}

export default DualCurrencyAmount;
