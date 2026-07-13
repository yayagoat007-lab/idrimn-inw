import { useEffect } from 'react';
import { getMetaTagsForPage } from '../lib/seo';
import { Language } from '../lib/i18n';

export function useSEO(path: string, language: Language = 'fr') {
  useEffect(() => {
    const meta = getMetaTagsForPage(path, language);
    document.title = meta.title;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', meta.description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = meta.description;
      document.head.appendChild(newMeta);
    }
  }, [path, language]);
}
export default useSEO;
