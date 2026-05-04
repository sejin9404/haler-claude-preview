'use client';

import { useAdmin } from '@/components/admin/AdminContext';

interface AdminHeaderProps {
  title: string;
  titleKo?: string;
}

export default function AdminHeader({ title, titleKo }: AdminHeaderProps) {
  const { lang, setLang, darkMode, toggleDarkMode } = useAdmin();

  return (
    <div className="admin-header-row">
      <h1 className="admin-h1">
        {lang === 'ko' && titleKo ? titleKo : title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Language Toggle */}
        <div className="lang-toggle">
          <button
            className={`lang-btn ${lang === 'ko' ? 'active' : ''}`}
            onClick={() => setLang('ko')}
          >
            KOR
          </button>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            ENG
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-main)',
            transition: '0.3s',
          }}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>

        {/* Status */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>
            {lang === 'ko' ? '라이브 캠페인' : 'LIVE CAMPAIGN'}
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--green)' }}>
            ● {lang === 'ko' ? '시스템 정상 작동 중' : 'SYSTEM ACTIVE'}
          </div>
        </div>
      </div>
    </div>
  );
}
