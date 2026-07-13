/**
 * Hijri-Gregorian Date Utilities for Floussi (Morocco)
 * Leverages native Intl.DateTimeFormat with islamic-umalqura calendar
 */

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthNameFr: string;
  monthNameDarija: string;
  formattedFr: string;
  formattedDarija: string;
}

const HIJRI_MONTHS_FR = [
  "Mouharram", "Safar", "Rabi' al-awwal", "Rabi' ath-thani",
  "Joumada al-oula", "Joumada ath-thaniya", "Rajab", "Cha'bane",
  "Ramadan", "Chawwal", "Dhou al-Qi'dah", "Dhou al-Hijjah"
];

const HIJRI_MONTHS_DARIJA = [
  "Fatih Mouharram", "Sfar", "Rbi' l'ouwal (Mawlid)", "Rbi' t-tani",
  "Joumada l'oula", "Joumada t-tania", "Rajab", "Cha'bane",
  "Ramdan", "Chouwal (Aid Sghir)", "Dou l'qi'da", "Dou l'hijja (Aid Kbir)"
];

export function convertGregorianToHijri(date: Date | string): HijriDate {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  try {
    const formatter = new Intl.DateTimeFormat('fr-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(d);
    const dayVal = parts.find(p => p.type === 'day')?.value;
    const monthVal = parts.find(p => p.type === 'month')?.value;
    const yearVal = parts.find(p => p.type === 'year')?.value;
    
    const day = dayVal ? parseInt(dayVal, 10) : d.getDate();
    const month = monthVal ? parseInt(monthVal, 10) : 1;
    const year = yearVal ? parseInt(yearVal, 10) : 1448;
    
    const monthNameFr = HIJRI_MONTHS_FR[month - 1] || "Mouharram";
    const monthNameDarija = HIJRI_MONTHS_DARIJA[month - 1] || "Mouharram";
    
    return {
      day,
      month,
      year,
      monthNameFr,
      monthNameDarija,
      formattedFr: `${day} ${monthNameFr} ${year}`,
      formattedDarija: `${day} ${monthNameDarija} ${year}`
    };
  } catch (e) {
    // High-fidelity fallback math if Intl calendar is not fully supported in local runtime
    const jd = gregToJulian(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const hijri = julianToHijri(jd);
    
    const monthNameFr = HIJRI_MONTHS_FR[hijri.month - 1] || "Mouharram";
    const monthNameDarija = HIJRI_MONTHS_DARIJA[hijri.month - 1] || "Mouharram";
    
    return {
      day: hijri.day,
      month: hijri.month,
      year: hijri.year,
      monthNameFr,
      monthNameDarija,
      formattedFr: `${hijri.day} ${monthNameFr} ${hijri.year}`,
      formattedDarija: `${hijri.day} ${monthNameDarija} ${hijri.year}`
    };
  }
}

// Helpers for fallback
function gregToJulian(year: number, month: number, day: number): number {
  if (month < 3) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = Math.floor(a / 4);
  const c = 2 - a + b;
  const e = Math.floor(365.25 * (year + 4716));
  const f = Math.floor(30.6001 * (month + 1));
  return c + day + e + f - 1524.5;
}

function julianToHijri(jd: number): { day: number; month: number; year: number } {
  const l = Math.floor(jd - 1948438.5 + 0.5);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n;
  let j = Math.floor((l2 - 1) / 354);
  const l3 = l2 - 354 * j;
  const k = Math.floor((11 * j + 3) / 30);
  const l4 = l3 - k;
  
  let year = 30 * n + j + 1;
  let month = Math.floor((l4 - 1) / 29.5) + 1;
  let day = Math.floor(l4 - 29.5 * (month - 1) + 0.5);
  
  if (day > 30) {
    day -= 30;
    month += 1;
  }
  if (month > 12) {
    month -= 12;
    year += 1;
  }
  return { day, month, year };
}

/**
 * Estimates the Gregorian start and end dates for a given Hijri event in a specific Gregorian year.
 * (Allows Floussi to display dynamic estimates without backend requests)
 */
export function estimateHijriEventInGregorian(type: string, gregYear: number): { start: string; end: string } {
  // Approximate lookup based on known astronomical computations for 2026-2027
  if (gregYear === 2026) {
    switch (type) {
      case 'ramadan':
        return { start: '2026-02-18', end: '2026-03-19' };
      case 'aid_al_fitr':
        return { start: '2026-03-20', end: '2026-03-22' };
      case 'aid_al_adha':
        return { start: '2026-05-27', end: '2026-05-30' };
      case 'mawlid':
        return { start: '2026-08-26', end: '2026-08-27' };
      case 'hijri_new_year':
        return { start: '2026-06-16', end: '2026-06-17' };
    }
  } else if (gregYear === 2027) {
    switch (type) {
      case 'ramadan':
        return { start: '2027-02-08', end: '2027-03-09' };
      case 'aid_al_fitr':
        return { start: '2027-03-10', end: '2027-03-12' };
      case 'aid_al_adha':
        return { start: '2027-05-17', end: '2027-05-20' };
      case 'mawlid':
        return { start: '2027-08-15', end: '2027-08-16' };
      case 'hijri_new_year':
        return { start: '2027-06-06', end: '2027-06-07' };
    }
  }

  // Generative math fallback based on standard offset (shifts approx 11 days earlier per year)
  const baseOffset: Record<string, string> = {
    ramadan: '2026-02-18',
    aid_al_fitr: '2026-03-20',
    aid_al_adha: '2026-05-27',
    mawlid: '2026-08-26',
    hijri_new_year: '2026-06-16',
  };

  const baseDateStr = baseOffset[type] || '2026-01-01';
  const baseDate = new Date(baseDateStr);
  const yearsDiff = gregYear - 2026;
  const daysShift = Math.round(yearsDiff * 10.87); // Average shift
  
  const estimatedStart = new Date(baseDate.getTime() - daysShift * 24 * 60 * 60 * 1000);
  const estimatedEnd = new Date(estimatedStart.getTime() + (type === 'ramadan' ? 29 : 2) * 24 * 60 * 60 * 1000);

  return {
    start: estimatedStart.toISOString().split('T')[0],
    end: estimatedEnd.toISOString().split('T')[0]
  };
}
