'use client';
import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const SUBSCRIBERS = [
  { id: 'S001', name: 'Kalcross L.', email: 'kalcross@haler.co', plan: 'Essential', capsules: '3 Boxes', nextDelivery: 'May 24, 2026', term: 'Monthly', status: 'active', price: '$49.00', since: 'Jan 12, 2026', deliveries: 4, spent: '$196.00', address: '123 Haler Ave, Seoul', payment: 'VISA •••• 4242' },
  { id: 'S002', name: 'Emma Watson', email: 'emma@example.com', plan: 'Daily+', capsules: '5 Boxes', nextDelivery: 'May 30, 2026', term: 'Monthly', status: 'paused', price: '$79.00', since: 'Feb 5, 2026', deliveries: 2, spent: '$158.00', address: '456 Oak St, Seoul', payment: 'VISA •••• 1111' },
  { id: 'S003', name: 'James Kim', email: 'jkim@example.com', plan: 'Light', capsules: '2 Boxes', nextDelivery: '—', term: 'Monthly', status: 'cancelled', price: '$29.00', since: 'Mar 1, 2026', deliveries: 1, spent: '$29.00', address: '789 Pine Rd, Busan', payment: 'VISA •••• 9999' },
];

export default function SubscriptionsPage() {
  const { lang, toast } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof SUBSCRIBERS[0] | null>(null);

  const filtered = SUBSCRIBERS.filter(s =>
    (filter === 'all' || s.status === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const active = SUBSCRIBERS.filter(s => s.status === 'active');
  const mrr = active.reduce((sum, s) => sum + parseInt(s.price.replace('$', '')), 0);

  const statusStyle: Record<string, string> = {
    active: 'status-active', paused: 'status-paused', cancelled: 'status-error'
  };
  const statusLabel: Record<string, Record<string, string>> = {
    active: { en: '● Active', ko: '● 활성' },
    paused: { en: '⏸ Paused', ko: '⏸ 일시정지' },
    cancelled: { en: '✕ Cancelled', ko: '✕ 취소됨' },
  };
  const planStyle: Record<string, string> = {
    'Essential': 'rgba(28,136,255,0.08)', 'Daily+': 'rgba(0,0,0,0.06)', 'Light': '#F1F5F9',
  };

  return (
    <>
      <AdminHeader title="Pass Subscribers." titleKo="구독 관리 센터." />

      {/* KPI Grid */}
      <div className="sub-kpi-grid">
        <div className="sub-kpi-card">
          <div className="kpi-label">{lang === 'ko' ? '활성 구독자' : 'Active Subscribers'}</div>
          <div className="admin-stat-val" style={{ color: 'var(--green)' }}>{active.length}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '10px', color: 'var(--green)' }}>↑ +1 this month</div>
        </div>
        <div className="sub-kpi-card">
          <div className="kpi-label">{lang === 'ko' ? '월간 반복 매출' : 'Monthly Recurring Revenue'}</div>
          <div className="admin-stat-val">${mrr}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '10px', color: 'var(--p-blue)' }}>MRR this cycle</div>
        </div>
        <div className="sub-kpi-card">
          <div className="kpi-label">{lang === 'ko' ? '평균 구독 가치' : 'Avg. Subscription Value'}</div>
          <div className="admin-stat-val">${Math.round(mrr / (active.length || 1))}</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '10px', color: '#94A3B8' }}>Per active subscriber</div>
        </div>
        <div className="sub-kpi-card" style={{ borderColor: 'rgba(255,75,75,0.15)', background: 'rgba(255,75,75,0.02)' }}>
          <div className="kpi-label" style={{ color: 'var(--err)' }}>{lang === 'ko' ? '이번 달 이탈' : 'Churn This Month'}</div>
          <div className="admin-stat-val" style={{ color: 'var(--err)' }}>0</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '10px', color: 'var(--green)' }}>↓ 0% churn rate</div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
          <div>
            <h2 className="admin-h1" style={{ fontSize: '1.8rem' }}>{lang === 'ko' ? 'Pass 구독자.' : 'Pass Subscribers.'}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '5px' }}>{lang === 'ko' ? '전체 구독 현황 관리.' : 'All active, paused, and cancelled subscriptions.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" className="admin-search" style={{ width: '220px' }} placeholder={lang === 'ko' ? '이름 또는 이메일...' : 'Search name or email...'} value={search} onChange={e => setSearch(e.target.value)} />
            {(['all', 'active', 'paused', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '9px 18px', borderRadius: '100px', border: '1.5px solid var(--border)', background: filter === f ? 'var(--dark)' : 'var(--surface)', color: filter === f ? 'white' : 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s', fontFamily: 'var(--font-main)' }}>
                {f === 'all' ? (lang === 'ko' ? '전체' : 'All') : f === 'active' ? (lang === 'ko' ? '활성' : 'Active') : f === 'paused' ? (lang === 'ko' ? '일시정지' : 'Paused') : (lang === 'ko' ? '취소됨' : 'Cancelled')}
              </button>
            ))}
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              {['Customer', 'Plan', 'Capsules', 'Next Delivery', 'Term', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{sub.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sub.email}</div>
                </td>
                <td><span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, background: planStyle[sub.plan] || '#F1F5F9', color: sub.plan === 'Essential' ? 'var(--p-blue)' : 'var(--dark)' }}>{sub.plan}</span></td>
                <td>{sub.capsules}</td>
                <td>{sub.nextDelivery}</td>
                <td>{sub.term}</td>
                <td><span className={`status-chip ${statusStyle[sub.status]}`}>{statusLabel[sub.status][lang]}</span></td>
                <td><button className="admin-btn" style={{ padding: '10px 18px', fontSize: '0.85rem' }} onClick={() => setSelected(sub)}>{lang === 'ko' ? '상세보기' : 'View'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Side Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(12px)', zIndex: 9998 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
              style={{ position: 'fixed', top: 0, right: 0, width: '520px', height: '100vh', background: 'var(--surface)', borderLeft: '1.5px solid var(--border)', zIndex: 9999, overflowY: 'auto', padding: '50px 45px', boxShadow: '-40px 0 100px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
                <div>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(28,136,255,0.1)', color: 'var(--p-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '15px' }}>
                    {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em' }}>{selected.name}</h2>
                  <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '4px' }}>{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.6rem', cursor: 'pointer', color: '#94A3B8' }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '35px' }}>
                <span className={`status-chip ${statusStyle[selected.status]}`}>{statusLabel[selected.status][lang]}</span>
                <span style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800, background: planStyle[selected.plan], color: selected.plan === 'Essential' ? 'var(--p-blue)' : 'var(--dark)' }}>{selected.plan}</span>
              </div>
              {[
                { title: lang === 'ko' ? '구독 상세' : 'Subscription Details', rows: [
                  ['Plan', selected.plan], ['Price', selected.price], ['Term', selected.term],
                  ['Next Delivery', selected.nextDelivery], ['Member Since', selected.since],
                  ['Deliveries', String(selected.deliveries)], ['Total Spent', selected.spent],
                ]},
                { title: lang === 'ko' ? '배송 및 결제' : 'Shipping & Payment', rows: [['Address', selected.address], ['Payment', selected.payment]] },
              ].map(section => (
                <div key={section.title} style={{ marginBottom: '35px', paddingBottom: '35px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>{section.title}</div>
                  {section.rows.map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.03)', fontSize: '0.95rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
                      <span style={{ fontWeight: 700, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['📦 Change Next Delivery Date', '⏸ Pause Subscription', '✉️ Send Confirmation Email'].map(action => (
                  <button key={action} onClick={() => toast(action)} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--surface)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: '0.3s', color: 'var(--text-main)', fontFamily: 'var(--font-main)', textAlign: 'left' }}>{action}</button>
                ))}
                <button onClick={() => toast('Cancellation flow initiated')} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1.5px solid rgba(255,75,75,0.3)', background: 'rgba(255,75,75,0.03)', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', color: 'var(--err)', fontFamily: 'var(--font-main)', textAlign: 'left' }}>✕ Cancel Subscription</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
