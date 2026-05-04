'use client';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';

export default function MarketingPage() {
  const { lang } = useAdmin();
  return (
    <>
      <AdminHeader title="Marketing Studio." titleKo="마케팅 스튜디오." />
      <div className="admin-stat-grid" style={{ marginBottom: '40px' }}>
        {[
          { label: lang === 'ko' ? '총 마케팅 집행 비용' : 'TOTAL AD SPEND', val: '$15,200' },
          { label: lang === 'ko' ? '평균 광고 효율 (ROAS)' : 'AVERAGE ROAS', val: '4.25x', color: 'var(--green)' },
          { label: lang === 'ko' ? '고객 획득 비용 (CAC)' : 'ACQUISITION COST (CAC)', val: '$12.50', color: 'var(--p-blue)' },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card">
            <span className="admin-stat-label">{card.label}</span>
            <div className="admin-stat-val" style={{ color: card.color || 'var(--text-main)' }}>{card.val}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="admin-glass-card" style={{ padding: '40px' }}>
          <h3 style={{ marginBottom: '25px', fontWeight: 800 }}>{lang === 'ko' ? '채널별 전환 효율' : 'Channel Efficiency'}</h3>
          {[['Meta Ads (Instagram)', 'ROAS 5.2x', 'var(--green)'], ['Google Search', 'ROAS 3.8x', 'var(--text-main)'], ['Branded Newsletter', '18% Conv.', 'var(--p-blue)']].map(([channel, val, color]) => (
            <div key={channel as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>{channel}</span>
              <strong style={{ color: color as string }}>{val}</strong>
            </div>
          ))}
        </div>
        <div className="admin-glass-card" style={{ padding: '40px' }}>
          <h3 style={{ marginBottom: '25px', fontWeight: 800 }}>{lang === 'ko' ? '도달 범위 및 유입' : 'Audience & Reach'}</h3>
          {[['Impressions', '1.2M'], ['Engaged Users', '85.4k'], ['Organic Visitors', '45%']].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-dim)' }}>{label}</span>
              <strong>{val}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
