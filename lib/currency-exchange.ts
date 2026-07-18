export interface CurrencyInfo {
  code: string;
  nameFr: string;
  nameDarija: string;
  symbol: string;
  defaultRateToMAD: number; // How many MAD for 1 unit of this currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  EUR: { code: 'EUR', nameFr: 'Euro', nameDarija: 'الأورو', symbol: '€', defaultRateToMAD: 11.0 },
  USD: { code: 'USD', nameFr: 'Dollar US', nameDarija: 'الدولار الأمريكي', symbol: '$', defaultRateToMAD: 10.1 },
  CAD: { code: 'CAD', nameFr: 'Dollar Canadien', nameDarija: 'الدولار الكندي', symbol: 'C$', defaultRateToMAD: 7.4 },
  GBP: { code: 'GBP', nameFr: 'Livre Sterling', nameDarija: 'الجنيه الإسترليني', symbol: '£', defaultRateToMAD: 13.1 },
  AED: { code: 'AED', nameFr: 'Dirham des Émirats', nameDarija: 'الدرهم الإماراتي', symbol: 'AED', defaultRateToMAD: 2.75 },
};

const STORAGE_KEY_RATES = 'floussi_custom_exchange_rates';
const STORAGE_KEY_PREF_CURR = 'floussi_mre_pref_currency';
const STORAGE_KEY_MRE_ENABLED = 'floussi_mre_enabled';

export function getExchangeRates(): Record<string, number> {
  if (typeof window === 'undefined') {
    return Object.keys(SUPPORTED_CURRENCIES).reduce((acc, code) => {
      acc[code] = SUPPORTED_CURRENCIES[code].defaultRateToMAD;
      return acc;
    }, {} as Record<string, number>);
  }
  const saved = localStorage.getItem(STORAGE_KEY_RATES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (_) {}
  }
  const defaults = Object.keys(SUPPORTED_CURRENCIES).reduce((acc, code) => {
    acc[code] = SUPPORTED_CURRENCIES[code].defaultRateToMAD;
    return acc;
  }, {} as Record<string, number>);
  localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(defaults));
  return defaults;
}

export function saveExchangeRates(rates: Record<string, number>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(rates));
  }
}

export function convertToMAD(amount: number, fromCurrency: string, customRate?: number): number {
  const rate = customRate ?? getExchangeRates()[fromCurrency] ?? SUPPORTED_CURRENCIES[fromCurrency]?.defaultRateToMAD ?? 1;
  return amount * rate;
}

export function convertFromMAD(amountMAD: number, toCurrency: string, customRate?: number): number {
  const rate = customRate ?? getExchangeRates()[toCurrency] ?? SUPPORTED_CURRENCIES[toCurrency]?.defaultRateToMAD ?? 1;
  if (rate === 0) return 0;
  return amountMAD / rate;
}

export function formatDualCurrency(amountMAD: number, secondaryCurrency: string, customRate?: number): string {
  const curr = SUPPORTED_CURRENCIES[secondaryCurrency] || SUPPORTED_CURRENCIES.EUR;
  const converted = convertFromMAD(amountMAD, curr.code, customRate);
  
  // Format MAD part
  const formatterMAD = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', currencyDisplay: 'code' });
  const formattedMAD = formatterMAD.format(amountMAD).replace('MAD', 'DH').trim();

  // Format secondary currency smoothly
  let formattedSecStr = '';
  if (curr.code === 'EUR') {
    formattedSecStr = `${converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
  } else if (curr.code === 'USD') {
    formattedSecStr = `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (curr.code === 'GBP') {
    formattedSecStr = `£${converted.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (curr.code === 'CAD') {
    formattedSecStr = `C$${converted.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    formattedSecStr = `${converted.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr.symbol}`;
  }

  return `${formattedMAD} (≈ ${formattedSecStr})`;
}

export function getMREPreference(): { enabled: boolean; currency: string } {
  if (typeof window === 'undefined') {
    return { enabled: false, currency: 'EUR' };
  }
  const enabled = localStorage.getItem(STORAGE_KEY_MRE_ENABLED) === 'true';
  const currency = localStorage.getItem(STORAGE_KEY_PREF_CURR) || 'EUR';
  return { enabled, currency };
}

export function setMREPreference(enabled: boolean, currency: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MRE_ENABLED, enabled ? 'true' : 'false');
    localStorage.setItem(STORAGE_KEY_PREF_CURR, currency);
    if (enabled) {
      localStorage.setItem('floussi_selected_persona', 'mre');
    }
  }
}
