import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useContent() {
  const [content, setContent] = useState<Record<string, { ko: string; en: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, text_ko, text_en');

      if (!error && data) {
        const mapped = data.reduce((acc: any, item: any) => {
          acc[item.key] = { ko: item.text_ko, en: item.text_en };
          return acc;
        }, {});
        setContent(mapped);
      }
      setLoading(false);
    }

    loadContent();
  }, []);

  const t = (key: string, lang: 'ko' | 'en' = 'en') => {
    return content[key]?.[lang] || '';
  };

  return { t, loading };
}
