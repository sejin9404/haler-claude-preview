'use client';
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { getShopifyLogisticsData } from './actions';

export default function LogisticsPage() {
  const { lang, toast } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    const res = await getShopifyLogisticsData();
    if (res.success) {
      setData(res);
    } else {
      if (!isAuto) toast(lang === 'ko' ? '물류 데이터 로드 실패' : 'Failed to load logistics data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // 5분마다 자동 갱신
    const interval = setInterval(() => loadData(true), 300000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <>
      <AdminHeader title="3PL Fulfillment Center." titleKo="물류 관리 센터." />

      {/* KPI Cards */}
      <div className="logistic-grid">
        {[
          { label: lang === 'ko' ? '3PL 배송 대기' : 'PENDING TO 3PL', val: loading ? '...' : (data?.pendingFulfillment || 0), unit: lang === 'ko' ? '건' : 'Units', note: lang === 'ko' ? '동기화 완료' : 'Sync Active', color: 'var(--p-blue)' },
          { label: lang === 'ko' ? '최근 배송 완료' : 'RECENTLY FULFILLED', val: loading ? '...' : (data?.recentFulfilled || 0), note: 'Last 50 orders', color: 'var(--green)' },
          { label: lang === 'ko' ? '총 가용 재고' : 'TOTAL STOCK', val: loading ? '...' : (data?.totalStock || 0), note: 'Live Inventory Level', color: 'var(--text-main)', clickable: true },
          { label: lang === 'ko' ? '배송 성공률' : 'FULFILL ACCURACY', val: '99', unit: '%', note: 'Last 30 Days', color: 'var(--text-main)', noteColor: 'var(--green)' },
        ].map((kpi, i) => (
          <div key={i} className="logistic-card" style={{ cursor: kpi.clickable ? 'pointer' : 'default' }}
            onClick={() => kpi.clickable && loadData()}>
            <div className="kpi-label">{kpi.label}</div>
            <div>
              <div className="admin-stat-val" style={{ fontSize: '2rem', color: kpi.color }}>
                {kpi.val} {kpi.unit && <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 500 }}>{kpi.unit}</span>}
              </div>
              <p style={{ fontSize: '0.65rem', color: kpi.noteColor || '#94A3B8', marginTop: '5px', fontWeight: kpi.noteColor ? 700 : 400 }}>{kpi.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fulfillment Table */}
      <div className="admin-glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div>
            <h2 className="admin-h1" style={{ fontSize: '1.8rem' }}>
              {lang === 'ko' ? '물류 처리 현황 (Shopify API).' : 'Shopify Fulfillment Status.'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '5px' }}>
              {lang === 'ko' ? '쇼피파이 실시간 연동 (FedEx/UPS/DHL)' : 'Real-time tracking synced with Shopify Admin'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="admin-btn ghost" style={{ height: '44px', padding: '0 25px' }}
              onClick={() => loadData()}>
              {lang === 'ko' ? '강제 업데이트' : 'Force Refresh'}
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '100px', textAlign: 'center' }}>
            <div className="admin-loading-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.03)' }}>
                  {['Order ID', 'Destination', 'Status', 'Carrier', 'Tracking No.'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '20px 30px 20px 0', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '25px 30px 25px 0' }}><strong>#1024</strong></td>
                  <td style={{ padding: '25px 30px 25px 0', color: '#64748B', fontSize: '0.85rem' }}>San Francisco, CA</td>
                  <td style={{ padding: '25px 30px 25px 0' }}><span className="status-chip status-done">Fulfilled</span></td>
                  <td style={{ padding: '25px 30px 25px 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--p-blue)' }}>FedEx</td>
                  <td style={{ padding: '25px 0', fontSize: '0.72rem', color: '#94A3B8' }}>771234567890</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '25px 30px 25px 0' }}><strong>#1023</strong></td>
                  <td style={{ padding: '25px 30px 25px 0', color: '#64748B', fontSize: '0.85rem' }}>Seoul, KR</td>
                  <td style={{ padding: '25px 30px 25px 0' }}><span className="status-chip status-pending">In Transit</span></td>
                  <td style={{ padding: '25px 30px 25px 0', fontSize: '0.8rem', fontWeight: 700, color: 'var(--p-blue)' }}>CJ Logistics</td>
                  <td style={{ padding: '25px 0', fontSize: '0.72rem', color: '#94A3B8' }}>6543210987</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
