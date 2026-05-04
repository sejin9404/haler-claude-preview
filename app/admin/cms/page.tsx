'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { supabase } from '@/lib/supabase';

export default function CMSPage() {
  const { lang, toast } = useAdmin();
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      toast(lang === 'ko' ? '데이터 로드 실패' : 'Failed to load content.');
    } else {
      setContent(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleUpdate = async (id: string, textKo: string, textEn: string) => {
    const { error } = await supabase
      .from('site_content')
      .update({ text_ko: textKo, text_en: textEn, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      toast(lang === 'ko' ? '수정 실패' : 'Update failed.');
    } else {
      toast(lang === 'ko' ? '수정되었습니다.' : 'Content updated.');
      fetchContent();
    }
  };

  return (
    <>
      <AdminHeader title="CMS Manager." titleKo="홈페이지 문구 수정." />
      
      <div className="admin-glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            {lang === 'ko' ? '홈페이지 내의 모든 텍스트를 실시간으로 수정합니다.' : 'Edit all website text in real-time.'}
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="admin-loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '200px' }}>{lang === 'ko' ? '구분(Key)' : 'Key'}</th>
                <th>{lang === 'ko' ? '한글 문구 (KO)' : 'Korean Text'}</th>
                <th>{lang === 'ko' ? '영어 문구 (EN)' : 'English Text'}</th>
                <th style={{ width: '120px' }}>{lang === 'ko' ? '관리' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {content.map((item) => (
                <EditableRow key={item.id} item={item} onSave={handleUpdate} lang={lang} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function EditableRow({ item, onSave, lang }: any) {
  const [ko, setKo] = useState(item.text_ko);
  const [en, setEn] = useState(item.text_en);

  return (
    <tr>
      <td style={{ verticalAlign: 'top', paddingTop: '25px' }}>
        <code style={{ fontSize: '0.75rem', color: 'var(--p-blue)', background: 'rgba(28,136,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
          {item.key}
        </code>
        <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '5px' }}>{item.description}</p>
      </td>
      <td style={{ padding: '20px 10px' }}>
        <textarea 
          value={ko} 
          onChange={(e) => setKo(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
        />
      </td>
      <td style={{ padding: '20px 10px' }}>
        <textarea 
          value={en} 
          onChange={(e) => setEn(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
        />
      </td>
      <td>
        <button 
          className="admin-btn" 
          style={{ padding: '8px 15px', fontSize: '0.8rem' }}
          onClick={() => onSave(item.id, ko, en)}
        >
          {lang === 'ko' ? '저장' : 'Save'}
        </button>
      </td>
    </tr>
  );
}
