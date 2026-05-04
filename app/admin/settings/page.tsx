'use client';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';

export default function SettingsPage() {
  const { lang, darkMode, toggleDarkMode, toast } = useAdmin();
  return (
    <>
      <AdminHeader title="Settings Control." titleKo="설정." />
      <div style={{ maxWidth: '650px' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="admin-h1" style={{ fontSize: '3.2rem', marginBottom: '8px' }}>
            {lang === 'ko' ? '설정 및 환경 관리.' : 'Settings Control.'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
            {lang === 'ko' ? '대시보드 환경 및 환경설정을 관리합니다.' : 'Customize your dashboard environment and preferences.'}
          </p>
        </div>

        <div className="admin-glass-card" style={{ padding: '50px', borderRadius: '40px' }}>
          {/* Dark Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
                {lang === 'ko' ? '프리미엄 다크 모드.' : 'Premium Dark Mode.'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                {lang === 'ko' ? '눈 편한 다크 테마로 전환합니다.' : 'Toggle midnight theme for eye comfort.'}
              </p>
            </div>
            {/* Toggle Switch */}
            <div
              onClick={toggleDarkMode}
              style={{ position: 'relative', width: '70px', height: '38px', background: darkMode ? 'var(--p-blue)' : 'rgba(128,128,128,0.2)', borderRadius: '100px', cursor: 'pointer', transition: '0.4s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: '5px', left: darkMode ? '37px' : '5px', width: '28px', height: '28px', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: '0.4s' }} />
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border)', marginBottom: '40px' }} />

          {/* System Preferences */}
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
              {lang === 'ko' ? '시스템 환경설정.' : 'System Preferences.'}
            </h4>
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { label: lang === 'ko' ? '클라우드 데이터베이스 강제 동기화' : 'Force Cloud Database Synchronization', action: 'Cloud Sync Active.' },
                { label: lang === 'ko' ? '시스템 캐시 초기화 및 자산 새로고침' : 'Purge System Cache & Refresh Assets', action: 'Cache Purged.' },
              ].map(btn => (
                <button key={btn.label} className="admin-btn ghost"
                  style={{ width: '100%', padding: '22px', fontWeight: 700, textAlign: 'left', borderRadius: '18px' }}
                  onClick={() => toast(btn.action)}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
