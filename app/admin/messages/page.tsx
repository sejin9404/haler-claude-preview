'use client';
import { useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';

const CONVERSATIONS = [
  { id: 'JK', name: 'James Kim', order: '#842', time: '14:20', preview: 'When will I get my order #842?', messages: [{ from: 'customer', text: 'Is there any update on order #842? I\'m moving next month.' }, { from: 'admin', text: 'Hello James! Let me check that for you right away.' }, { from: 'customer', text: 'When will I get my order #842?' }] },
  { id: 'EW', name: 'Emma Watson', order: '#711', time: 'Yesterday', preview: 'Thank you for the update!', messages: [{ from: 'customer', text: 'Thank you for the update!' }] },
  { id: 'SP', name: 'Sejin Park', order: '#101', time: '3 days ago', preview: 'Addressing issue with reward package.', messages: [{ from: 'customer', text: 'Addressing issue with reward package.' }] },
];

export default function MessagesPage() {
  const { lang, toast } = useAdmin();
  const [active, setActive] = useState(CONVERSATIONS[0]);
  const [reply, setReply] = useState('');
  const [messages, setMessages] = useState(active.messages);

  const sendReply = () => {
    if (!reply.trim()) return;
    setMessages(prev => [...prev, { from: 'admin', text: reply }]);
    setReply('');
    toast(lang === 'ko' ? '답변이 전송되었습니다.' : 'Reply sent!');
  };

  return (
    <>
      <AdminHeader title="Support Hub." titleKo="고객 문의 관리." />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: 'calc(100vh - 200px)', background: '#FFF', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.05)', border: '1.5px solid rgba(0,0,0,0.02)' }}>
        {/* List */}
        <div style={{ borderRight: '1.5px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '30px', borderBottom: '1.5px solid rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dark)' }}>{lang === 'ko' ? '문의 목록.' : 'Inquiries.'}</h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '5px' }}>{CONVERSATIONS.length} Active conversations</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {CONVERSATIONS.map(c => (
              <div key={c.id} onClick={() => { setActive(c); setMessages(c.messages); }}
                style={{ padding: '25px 30px', borderBottom: '1px solid rgba(0,0,0,0.015)', cursor: 'pointer', display: 'flex', gap: '15px', background: active.id === c.id ? 'rgba(28,136,255,0.04)' : 'transparent', borderLeft: active.id === c.id ? '4px solid var(--p-blue)' : '4px solid transparent', transition: '0.2s' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: active.id === c.id ? 'rgba(28,136,255,0.1)' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: active.id === c.id ? 'var(--p-blue)' : '#475569', flexShrink: 0 }}>{c.id}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{c.time}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
          <div style={{ padding: '25px 40px', background: '#FFF', borderBottom: '1.5px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{active.id}</div>
              <div>
                <h4 style={{ fontWeight: 700 }}>{active.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--p-blue)', fontWeight: 600 }}>Order {active.order}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="admin-btn ghost" style={{ padding: '12px 20px', fontSize: '0.85rem' }} onClick={() => toast('Marked as resolved')}>Mark Resolved</button>
              <button className="admin-btn" style={{ padding: '12px 20px', fontSize: '0.85rem' }} onClick={() => toast('Assigned to Logistics Team')}>Assign Team</button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth: '65%', padding: '18px 25px', borderRadius: '25px', fontSize: '0.95rem', lineHeight: 1.6, alignSelf: m.from === 'admin' ? 'flex-end' : 'flex-start', background: m.from === 'admin' ? 'var(--p-blue)' : '#FFF', color: m.from === 'admin' ? '#FFF' : 'var(--dark)', borderBottomRightRadius: m.from === 'admin' ? '5px' : '25px', borderBottomLeftRadius: m.from === 'admin' ? '25px' : '5px', boxShadow: m.from === 'customer' ? '0 5px 15px rgba(0,0,0,0.02)' : 'none' }}>{m.text}</div>
            ))}
          </div>

          <div style={{ padding: '30px 40px', background: '#FFF', borderTop: '1.5px solid rgba(0,0,0,0.03)', display: 'flex', gap: '20px' }}>
            <input type="text" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} className="admin-search" style={{ flex: 1, width: 'auto', borderRadius: '20px' }} placeholder={lang === 'ko' ? '답변을 입력하세요...' : 'Type your reply here...'} />
            <button className="admin-btn" style={{ padding: '15px 40px', borderRadius: '20px' }} onClick={sendReply}>{lang === 'ko' ? '전송' : 'Send Reply'}</button>
          </div>
        </div>
      </div>
    </>
  );
}
