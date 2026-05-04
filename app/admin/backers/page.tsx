'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzWOm9lx8S2tQavpj967Jx_x7cajHB2sAvbwLVZi_hdVu3rKML-nn7eJwPDWP8NhwuiHg/exec';

interface Backer {
  id: string;
  backer_id: string;
  name: string;
  email: string;
  tel: string;
  reward: string;
  address: string;
  status: 'done' | 'pending';
}

function DetailModal({ backer, onClose, lang }: { backer: Backer; onClose: () => void; lang: 'en' | 'ko' }) {
  // ... (이전과 동일한 모달 UI 코드 생략 - 실제 구현 시 포함됨)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: '54px',
            width: '100%',
            maxWidth: '600px',
            padding: '50px 60px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '5px', letterSpacing: '-0.03em' }}>
                {lang === 'ko' ? '후원자 상세 기록.' : 'Backer Detail.'}
              </h2>
              <p style={{ color: '#94A3B8' }}>
                {lang === 'ko' ? '조회 대상:' : 'Viewing records for'}{' '}
                <strong style={{ color: 'var(--p-blue)' }}>#{backer.backer_id}</strong>
              </p>
            </div>
            <span className={`status-chip ${backer.status === 'done' ? 'status-done' : 'status-pending'}`}
              style={{ fontSize: '0.85rem', padding: '12px 25px' }}>
              {backer.status === 'done'
                ? (lang === 'ko' ? '완료' : 'DONE')
                : (lang === 'ko' ? '대기' : 'PENDING')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '25px', borderRadius: '28px' }}>
              <div className="admin-stat-label" style={{ marginBottom: '15px' }}>
                {lang === 'ko' ? '수신자 정보' : 'Recipient Info'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: 500 }}>{lang === 'ko' ? '이름' : 'Full Name'}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '3px' }}>{backer.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: 500 }}>{lang === 'ko' ? '연락처' : 'Contact'}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '3px' }}>{backer.tel}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: 500 }}>Email</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '3px', color: '#64748B' }}>{backer.email}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(28,136,255,0.03)', border: '1px solid rgba(28,136,255,0.1)', padding: '25px', borderRadius: '28px' }}>
              <div className="admin-stat-label" style={{ marginBottom: '15px', color: 'var(--p-blue)' }}>
                {lang === 'ko' ? '리워드 상세' : 'Reward Details'}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: 500 }}>{lang === 'ko' ? '리워드 구성' : 'Package'}</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '3px', color: 'var(--p-blue)' }}>{backer.reward}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '25px', borderRadius: '28px', marginBottom: '35px' }}>
            <div className="admin-stat-label" style={{ marginBottom: '15px' }}>
              {lang === 'ko' ? '배송 주소' : 'Shipping Address'}
            </div>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{ background: '#FFF', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', flexShrink: 0 }}>📍</div>
              <div style={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }}>{backer.address}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="admin-btn ghost" style={{ flex: 1, padding: '20px' }} onClick={onClose}>
              {lang === 'ko' ? '닫기' : 'Close'}
            </button>
            <button className="admin-btn" style={{ flex: 1, padding: '20px', background: 'var(--dark)' }}
              onClick={() => alert('Export PDF — Coming soon')}>
              {lang === 'ko' ? 'PDF 라벨 출력' : 'Export PDF Label'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function BackersPage() {
  const { lang, toast } = useAdmin();
  const [backers, setBackers] = useState<Backer[]>([]);
  const [filtered, setFiltered] = useState<Backer[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Backer | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(true); // 자동 업데이트 상태

  // 1. 초기 로드 및 자동 업데이트 인터벌 설정
  useEffect(() => {
    fetchBackersFromDB();

    let interval: NodeJS.Timeout;
    if (autoSync) {
      // 5분마다 자동 업데이트 (300,000ms)
      interval = setInterval(() => {
        fetchBackersFromDB(true);
      }, 300000);
    }

    return () => clearInterval(interval);
  }, [autoSync]);

  // 1. 미국 Supabase DB에서 데이터 읽어오기
  const fetchBackersFromDB = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('backers')
        .select('*')
        .order('backer_id', { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map((b: any) => ({
        id: b.id,
        backer_id: b.backer_id,
        name: b.name,
        email: b.email,
        tel: b.tel,
        reward: b.reward,
        address: b.address,
        status: b.status,
      }));

      setBackers(formatted);
      setFiltered(formatted);
      if (isAuto) console.log('Auto-sync complete at:', new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      if (!isAuto) toast(lang === 'ko' ? 'DB 데이터 로드 실패' : 'Failed to load data from DB.');
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  // 2. 검색 필터링
  const handleSearch = (term: string) => {
    setSearch(term);
    if (!term.trim()) {
      setFiltered(backers);
      return;
    }
    const low = term.toLowerCase();
    const f = backers.filter(b => 
      b.name.toLowerCase().includes(low) || 
      b.email.toLowerCase().includes(low) || 
      b.backer_id.toLowerCase().includes(low)
    );
    setFiltered(f);
  };

  // 3. 구글 시트와 동기화
  const syncWithGoogleSheets = async () => {
    setLoading(true);
    try {
      const res = await fetch(GAS_URL);
      const data = await res.json();
      
      if (!data || !Array.isArray(data)) throw new Error('Invalid data format');

      // Supabase에 데이터 업서트(Upsert)
      const { error } = await supabase
        .from('backers')
        .upsert(data.map((b: any) => ({
          backer_id: b.backer_id?.toString() || '',
          name: b.name || '',
          email: b.email || '',
          tel: b.tel || '',
          reward: b.reward || '',
          address: b.address || '',
          status: 'pending' // 기본값
        })), { onConflict: 'email' });

      if (error) throw error;
      
      toast(lang === 'ko' ? '구글 시트 동기화 완료!' : 'Sync with Google Sheets complete!');
      fetchBackersFromDB();
    } catch (err) {
      console.error(err);
      toast(lang === 'ko' ? '동기화 실패' : 'Sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const doneCount = backers.filter(b => b.status === 'done').length;

  return (
    <>
      <AdminHeader title="Backer Command." titleKo="후원자 관리 센터." />

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '총 후원자 수' : 'Total Backers'}</span>
          <div className="admin-stat-val">{backers.length}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">{lang === 'ko' ? '정보 수집 완료' : 'Information Collected'}</span>
          <div className="admin-stat-val">{doneCount}</div>
        </div>
        
        {/* 자동 업데이트 제어 카드 */}
        <div className="admin-stat-card" style={{ 
          borderColor: autoSync ? 'rgba(5, 206, 120, 0.3)' : 'rgba(255, 75, 75, 0.3)', 
          background: autoSync ? 'rgba(5, 206, 120, 0.02)' : 'rgba(255, 75, 75, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-stat-label" style={{ color: autoSync ? 'var(--green)' : 'var(--err)', margin: 0 }}>
              {autoSync ? (lang === 'ko' ? '● 자동 업데이트 중' : '● AUTO-SYNC ACTIVE') : (lang === 'ko' ? '○ 업데이트 중단됨' : '○ SYNC PAUSED')}
            </span>
            <button 
              onClick={() => {
                setAutoSync(!autoSync);
                toast(autoSync ? (lang === 'ko' ? '자동 업데이트를 중단했습니다.' : 'Auto-sync paused.') : (lang === 'ko' ? '자동 업데이트를 재개합니다.' : 'Auto-sync resumed.'));
              }}
              className="admin-btn"
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.7rem', 
                background: autoSync ? 'var(--err)' : 'var(--p-blue)',
                borderRadius: '8px'
              }}
            >
              {autoSync ? (lang === 'ko' ? '중단하기' : 'Pause') : (lang === 'ko' ? '재개하기' : 'Resume')}
            </button>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500, marginTop: '10px' }}>
            {autoSync ? (lang === 'ko' ? '5분마다 최신 정보를 가져옵니다.' : 'Refreshing every 5 mins.') : (lang === 'ko' ? '데이터가 고정되었습니다.' : 'Data is frozen.')}
          </div>
        </div>
      </div>

      <div className="admin-glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <input
            type="text"
            className="admin-search"
            placeholder={lang === 'ko' ? '이름, 이메일 또는 번호 검색...' : 'Search records...'}
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          <button
            className="admin-btn"
            style={{ background: 'var(--dark)', padding: '15px 35px' }}
            onClick={syncWithGoogleSheets}
          >
            {lang === 'ko' ? '구글 시트 데이터 가져오기' : 'Sync from Google Sheets'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }} className="animate-spin">⟳</div>
            {lang === 'ko' ? '미국 서버 통신 중...' : 'Connecting to US server...'}
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>{lang === 'ko' ? '번호' : 'No.'}</th>
                <th>{lang === 'ko' ? '이름' : 'Name'}</th>
                <th>{lang === 'ko' ? '이메일' : 'Email'}</th>
                <th>{lang === 'ko' ? '리워드' : 'Reward'}</th>
                <th style={{ width: '150px' }}>{lang === 'ko' ? '상태' : 'Status'}</th>
                <th style={{ width: '120px' }}>{lang === 'ko' ? '관리' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>
                    {lang === 'ko' ? '등록된 데이터가 없습니다.' : 'No records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(backer => (
                  <motion.tr key={backer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td style={{ color: '#94A3B8', fontWeight: 500 }}>#{backer.backer_id}</td>
                    <td style={{ fontWeight: 600 }}>{backer.name}</td>
                    <td style={{ color: '#64748B' }}>{backer.email}</td>
                    <td style={{ fontSize: '0.9rem' }}>{backer.reward}</td>
                    <td>
                      <span className={`status-chip ${backer.status === 'done' ? 'status-done' : 'status-pending'}`}>
                        {backer.status === 'done' ? (lang === 'ko' ? '완료' : 'Done') : (lang === 'ko' ? '대기' : 'Pending')}
                      </span>
                    </td>
                    <td>
                      <button className="admin-btn" style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                        onClick={() => setSelected(backer)}>
                        {lang === 'ko' ? '보기' : 'View'}
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && <DetailModal backer={selected} onClose={() => setSelected(null)} lang={lang} />}
    </>
  );
}
