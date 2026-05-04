'use client';
import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';

export default function BroadcastPage() {
  const { lang, toast } = useAdmin();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [target, setTarget] = useState<'all' | 'verified'>('all');

  const send = () => {
    if (!subject || !body) { toast(lang === 'ko' ? '제목과 내용을 입력하세요.' : 'Please fill subject and content.'); return; }
    toast(lang === 'ko' ? '브랜드 뉴스레터 발송 중...' : 'Broadcasting branded newsletter...');
    setTimeout(() => toast(lang === 'ko' ? '뉴스레터가 성공적으로 발송되었습니다.' : 'Newsletter dispatched successfully.'), 2000);
  };

  return (
    <>
      <AdminHeader title="Newsletter Studio." titleKo="전체 공지 발송." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-glass-card" style={{ padding: '35px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontWeight: 800, marginBottom: '5px' }}>{lang === 'ko' ? '이메일 편집기' : 'Email Editor'}</h3>
            {[
              { label: lang === 'ko' ? '이메일 제목' : 'Email Subject', val: subject, set: setSubject, ph: lang === 'ko' ? '예: Haler 4월 업데이트' : 'e.g., Haler April Update' },
              { label: lang === 'ko' ? '내용' : 'Message Content', val: body, set: setBody, ph: lang === 'ko' ? '뉴스레터 내용을 입력하세요...' : 'Write your newsletter content...', area: true },
              { label: lang === 'ko' ? '버튼 텍스트 (CTA)' : 'Call to Action Text', val: ctaText, set: setCtaText, ph: 'Shop Now' },
              { label: lang === 'ko' ? '버튼 링크 (CTA)' : 'Call to Action URL', val: ctaUrl, set: setCtaUrl, ph: 'https://halerkorea.com' },
            ].map(field => (
              <div key={field.label as string}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{field.label}</label>
                {field.area ? (
                  <textarea value={field.val} onChange={e => field.set(e.target.value)} placeholder={field.ph as string} rows={6}
                    style={{ width: '100%', padding: '15px 20px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'rgba(128,128,128,0.03)', fontSize: '0.95rem', fontFamily: 'var(--font-main)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', transition: '0.3s' }} />
                ) : (
                  <input type="text" value={field.val} onChange={e => field.set(e.target.value)} placeholder={field.ph as string}
                    style={{ width: '100%', padding: '15px 20px', borderRadius: '16px', border: '1.5px solid var(--border)', background: 'rgba(128,128,128,0.03)', fontSize: '0.95rem', fontFamily: 'var(--font-main)', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }} />
                )}
              </div>
            ))}

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>{lang === 'ko' ? '발송 대상' : 'Target Recipients'}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[['all', lang === 'ko' ? '전체 후원자' : 'All Backers'], ['verified', lang === 'ko' ? '정보 수집 완료' : 'Verified Only']].map(([val, label]) => (
                  <button key={val as string} onClick={() => setTarget(val as 'all' | 'verified')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1.5px solid var(--border)', background: target === val ? 'var(--dark)' : 'var(--surface)', color: target === val ? 'white' : 'var(--text-dim)', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-main)', transition: '0.2s' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button className="admin-btn" style={{ width: '100%', padding: '20px', fontSize: '1rem', borderRadius: '18px' }} onClick={send}>
              {lang === 'ko' ? '📮 브랜드 뉴스레터 발송' : '📮 Send Branded Broadcast'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="admin-glass-card" style={{ padding: '35px' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '25px' }}>{lang === 'ko' ? '실시간 미리보기' : 'Live Newsletter Preview'}</h3>
          <div style={{ background: '#F8FAFC', borderRadius: '24px', padding: '40px', border: '1px solid rgba(0,0,0,0.04)', minHeight: '400px' }}>
            <div style={{ background: '#1C88FF', padding: '25px 30px', borderRadius: '16px 16px 0 0', marginBottom: '0' }}>
              <img src="/images/halersymbol.png" alt="Haler" style={{ height: '24px', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
            </div>
            <div style={{ background: '#FFF', padding: '35px', borderRadius: '0 0 16px 16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px', color: '#111' }}>{subject || (lang === 'ko' ? '이메일 제목을 입력하세요' : 'Your subject line')}</h2>
              <p style={{ color: '#64748B', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{body || (lang === 'ko' ? '뉴스레터 내용이 여기에 표시됩니다.' : 'Your newsletter content will appear here.')}</p>
              {ctaText && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <span style={{ background: '#1C88FF', color: '#FFF', padding: '14px 35px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' }}>{ctaText}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>Haler Korea · Unsubscribe</div>
          </div>
        </div>
      </div>
    </>
  );
}
