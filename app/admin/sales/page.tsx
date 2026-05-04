'use client';
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { getShopifySalesData } from './actions';

export default function SalesPage() {
  const { lang, toast } = useAdmin();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getShopifySalesData();
      if (res.success) {
        setData(res);
      } else {
        toast(lang === 'ko' ? '쇼피파이 데이터 로드 실패' : 'Failed to load Shopify data.');
      }
      setLoading(false);
    }
    loadData();
  }, [lang]);

  return (
    <>
      <AdminHeader title="Sales Performance." titleKo="판매 실적 관제." />
      
      <div className="admin-stat-grid" style={{ marginBottom: '40px' }}>
        {[
          { 
            label: lang === 'ko' ? '당일 총 판매액' : 'DAILY SALES (GROSS)', 
            val: loading ? '...' : (data?.todaySales || '$0.00'), 
            trend: loading ? '' : 'Based on UTC today', 
            trendColor: 'var(--green)' 
          },
          { 
            label: lang === 'ko' ? '평균 주문 가치 (AOV)' : 'AVG ORDER VALUE (AOV)', 
            val: loading ? '...' : (data?.aov || '$0.00'), 
            trend: 'Last 50 orders avg', 
            trendColor: 'var(--p-blue)' 
          },
          { 
            label: lang === 'ko' ? '최고 인기 SKU' : 'TOP PERFORMING SKU', 
            val: loading ? '...' : (data?.topSku || 'N/A'), 
            trend: 'Volume leader', 
            trendColor: '#94A3B8' 
          },
        ].map((card, i) => (
          <div key={i} className="admin-stat-card">
            <span className="admin-stat-label">{card.label}</span>
            <div className="admin-stat-val" style={{ fontSize: i === 2 ? '1.5rem' : '2.4rem' }}>{card.val}</div>
            <p style={{ fontSize: '0.75rem', color: card.trendColor, fontWeight: 700, marginTop: '10px' }}>{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="admin-glass-card" style={{ padding: '40px' }}>
        <h2 className="admin-h1" style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          {lang === 'ko' ? '쇼피파이 연동 실시간 트래킹.' : 'Live Shopify Sales Tracking.'}
        </h2>
        
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="admin-loading-spinner" />
          </div>
        ) : (
          <div style={{ height: '300px', background: 'rgba(0,0,0,0.02)', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p-blue)', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '3rem' }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>
              {lang === 'ko' ? `현재 ${data?.orderCount || 0}개의 주문 데이터와 실시간 연동 중입니다.` : `Live syncing with ${data?.orderCount || 0} orders.`}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>Next Phase: Advanced Charting (Recharts)</div>
          </div>
        )}
      </div>
    </>
  );
}
