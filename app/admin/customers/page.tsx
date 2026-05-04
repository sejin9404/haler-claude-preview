'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { motion } from 'framer-motion';
import { getShopifyCustomerData } from './actions';

interface Customer {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
  status: string;
  tags: string;
}

export default function CustomersPage() {
  const { lang, toast } = useAdmin();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const res = await getShopifyCustomerData();
    if (res.success) {
      setCustomers(res.customers || []);
      setMetrics(res.metrics);
    } else {
      toast(lang === 'ko' ? '데이터 로드 실패' : 'Failed to load data.');
    }
    setLoading(false);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminHeader title="Customer CRM." titleKo="고객 관리 센터." />

      {/* KPI Dashboard */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '총 고객 수' : 'Total Customers'}</span>
          <div className="admin-stat-val">{metrics?.totalCustomers || 0}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '평균 LTV' : 'Avg LTV'}</span>
          <div className="admin-stat-val" style={{ color: 'var(--p-blue)' }}>{metrics?.avgLTV || '$0.00'}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '평균 구독 매출' : 'Avg Sub Revenue'}</span>
          <div className="admin-stat-val">{metrics?.avgSubRevenue || '$0.00'}</div>
        </div>
        
        {metrics?.subRatios && (
          <div className="admin-stat-card">
            <span className="admin-stat-label">{lang === 'ko' ? '구독권 비율 (E/P/L)' : 'Sub Ratios (E/P/L)'}</span>
            <div className="admin-stat-val" style={{ fontSize: '1.4rem' }}>
              {metrics?.subRatios.essential}% / {metrics?.subRatios.premium}% / {metrics?.subRatios.elite}%
            </div>
          </div>
        )}

        {!metrics?.subRatios && (
          <div className="admin-stat-card" style={{ opacity: 0.5 }}>
            <span className="admin-stat-label">{lang === 'ko' ? '추가 지표' : 'More Metrics'}</span>
            <div className="admin-stat-val" style={{ fontSize: '1rem' }}>
              {lang === 'ko' ? '데이터 분석 대기 중' : 'Waiting for Data...'}
            </div>
          </div>
        )}
      </div>

      <div className="admin-glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '15px' }}>
          <input
            type="text"
            className="admin-search"
            placeholder={lang === 'ko' ? '고객 이름 또는 이메일 검색...' : 'Search customers...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
          <button
            className="admin-btn"
            style={{ background: 'var(--dark)', padding: '15px 35px' }}
            onClick={fetchData}
          >
            {lang === 'ko' ? '데이터 새로고침' : 'Refresh Data'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }} className="animate-spin">⟳</div>
            {lang === 'ko' ? '쇼피파이 데이터 동기화 중...' : 'Syncing Shopify data...'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{lang === 'ko' ? '고객명' : 'Customer'}</th>
                <th>{lang === 'ko' ? '이메일' : 'Email'}</th>
                <th>{lang === 'ko' ? '총 지출액' : 'Total Spent'}</th>
                <th>{lang === 'ko' ? '주문 수' : 'Orders'}</th>
                <th>{lang === 'ko' ? '최근 주문' : 'Last Order'}</th>
                <th style={{ width: '120px' }}>{lang === 'ko' ? '상태' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
                    {lang === 'ko' ? '검색 결과가 없습니다.' : 'No customers found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(customer => (
                  <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td style={{ fontWeight: 600 }}>{customer.name}</td>
                    <td style={{ color: '#64748B' }}>{customer.email}</td>
                    <td style={{ fontWeight: 600, color: 'var(--p-blue)' }}>
                      {customer.totalSpent.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td>{customer.orderCount}</td>
                    <td style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      {customer.lastOrder !== '-' ? new Date(customer.lastOrder).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <span className={`status-chip ${customer.status === 'Active' ? 'status-done' : 'status-pending'}`}>
                        {customer.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
