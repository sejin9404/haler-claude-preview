'use client';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';

export default function RevenuePage() {
  const { lang } = useAdmin();
  const expenses = [
    { label: lang === 'ko' ? '제품 제조 원가 (COGS)' : 'Product Manufacturing (COGS)', val: '$84,000.00' },
    { label: lang === 'ko' ? '글로벌 배송 및 이행 비용' : 'Global Shipping & Fulfillment', val: '$32,160.00' },
    { label: lang === 'ko' ? '마케팅 비용 및 일반 관리비' : 'Marketing Spend & Admin', val: '$15,200.00' },
  ];
  return (
    <>
      <AdminHeader title="Revenue & Profit." titleKo="수익 및 이익 분석." />
      <div className="admin-stat-grid" style={{ marginBottom: '40px' }}>
        <div className="admin-stat-card" style={{ background: 'var(--dark)', color: '#FFF', border: 'none' }}>
          <span className="admin-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{lang === 'ko' ? '누적 총 매출액' : 'TOTAL GROSS REVENUE'}</span>
          <div className="admin-stat-val">$184,200.00</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '실질 영업 이익' : 'NET OPERATING PROFIT'}</span>
          <div className="admin-stat-val" style={{ color: 'var(--green)' }}>$52,840.00</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '매출 총 이익률 (%)' : 'GROSS MARGIN (%)'}</span>
          <div className="admin-stat-val">28.7%</div>
        </div>
      </div>
      <div className="admin-glass-card" style={{ padding: '40px' }}>
        <h3 style={{ fontWeight: 800, marginBottom: '30px', fontSize: '1.3rem' }}>{lang === 'ko' ? '항목별 지출 명세서 (비용 분석)' : 'Expense Breakdown (Fiscal Summary)'}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {expenses.map(({ label, val }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              <span style={{ color: '#64748B' }}>{label}</span>
              <strong style={{ color: 'var(--dark)' }}>{val}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, paddingTop: '10px' }}>
            <span>{lang === 'ko' ? '예상 순이익' : 'Projected Net Profit'}</span>
            <span style={{ color: 'var(--green)' }}>$52,840.00</span>
          </div>
        </div>
      </div>
    </>
  );
}
