// Dynamic SEO and meta tags utility for Floussi

export interface MetaTags {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

export function getMetaTagsForPage(path: string, lang: 'fr' | 'darija' = 'fr'): MetaTags {
  const isAr = lang === 'darija';
  const siteName = 'Floussi';

  const defaultMeta: Record<string, MetaTags> = {
    '/': {
      title: isAr 
        ? 'Floussi - T7kem f floussik, dirham b dirham' 
        : 'Floussi - Prenez le contrôle de votre budget, en Dirham Marocain',
      description: isAr
        ? 'Floussi t\'ay3awnk t9add sandoqat dyalk, masrouf dyal l3aila o Jmâa bla ktab, f ddfina o f talifoun.'
        : 'Floussi vous aide à gérer vos seaux de budget, vos dépenses familiales et vos tontines (Daret) en Darija et sans compte bancaire obligatoire.',
      ogTitle: 'Floussi - Budget & Daret Marocain',
      ogDescription: 'Gérez votre argent en toute sérénité. Saisie cash, OCR Marjane/BIM et cercles de confiance Jmâa.',
      ogImage: 'https://floussi.ma/assets/og-home.jpg',
      canonical: 'https://floussi.ma'
    },
    '/pricing': {
      title: isAr ? 'Floussi - L-Atmane dyal l-Ishtirak' : 'Floussi - Tarifs et Plans d\'Abonnement',
      description: isAr
        ? 'Plans gratuit, Premium, Famille, o Elite. Khtar l-plan li t\'aynasbk bzaf.'
        : 'Découvrez nos tarifs transparents en Dirham. Plans Gratuit, Premium 29 DH, Famille 49 DH, Analyse et Elite 200 DH.',
      ogTitle: 'Abonnements Floussi - En Dirham',
      ogDescription: 'Des formules adaptées pour tous les Marocains, à partir de 0 DH.',
      ogImage: 'https://floussi.ma/assets/og-pricing.jpg',
      canonical: 'https://floussi.ma/pricing'
    },
    '/about': {
      title: 'À propos de Floussi - Notre Mission pour l\'inclusion financière',
      description: 'Découvrez l\'histoire de Floussi, notre équipe à Casablanca et notre mission de digitalisation du cash au Maroc.',
      ogTitle: 'Floussi - Notre Histoire',
      ogDescription: 'L\'inclusion financière pour tous les Marocains grâce à l\'éducation budgétaire.',
      ogImage: 'https://floussi.ma/assets/og-about.jpg',
      canonical: 'https://floussi.ma/about'
    }
  };

  return defaultMeta[path] || defaultMeta['/'];
}

export function generateStructuredData(type: 'organization' | 'faq' | 'product') {
  if (type === 'organization') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Floussi',
      'url': 'https://floussi.ma',
      'logo': 'https://floussi.ma/icon-192.png',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+212-661-234567',
        'contactType': 'customer support',
        'areaServed': 'MA',
        'availableLanguage': ['French', 'Arabic']
      },
      'sameAs': [
        'https://facebook.com/floussiapp',
        'https://instagram.com/floussiapp',
        'https://tiktok.com/@floussi'
      ]
    };
  }

  if (type === 'faq') {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Est-ce que Floussi est gratuit ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Oui, le plan de base Floussi est 100% gratuit avec jusqu\'à 3 seaux budgétaires et la saisie des dépenses.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Est-ce que ça marche sans compte bancaire au Maroc ?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Absolument. Floussi est conçu pour un usage cash-first. Vous pouvez saisir vos opérations manuellement ou scanner vos reçus Marjane/BIM.'
          }
        }
      ]
    };
  }

  return null;
}
