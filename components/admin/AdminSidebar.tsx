'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/components/admin/AdminContext';

const NAV_ITEMS = [
  { label: { en: 'Customers', ko: '고객 관리' }, href: '/admin/customers' },
  { label: { en: 'Messages', ko: '문의 및 채팅' }, href: '/admin/messages' },
  { label: { en: 'Broadcast', ko: '전체 공지 발송' }, href: '/admin/broadcast' },
  { label: { en: 'Logistics', ko: '물류 관리' }, href: '/admin/logistics' },
  { label: { en: 'Subscriptions', ko: '구독 관리' }, href: '/admin/subscriptions' },
];

const NAV_ITEMS_2 = [
  { label: { en: 'Sales Performance', ko: '판매 실적 관제' }, href: '/admin/sales' },
  { label: { en: 'Marketing Studio', ko: '마케팅 스튜디오' }, href: '/admin/marketing' },
  { label: { en: 'Revenue & Profit', ko: '수익 및 이익 분석' }, href: '/admin/revenue' },
];

const NAV_ITEMS_CONTENT = [
  { label: { en: 'Quiz Studio', ko: '퀴즈 관리' }, href: '/admin/quiz' },
  { label: { en: 'CMS Manager', ko: '홈페이지 문구 수정' }, href: '/admin/cms' },
];

const NAV_ITEMS_3 = [
  { label: { en: 'Backers', ko: '후원자 명단' }, href: '/admin/backers' },
  { label: { en: 'Settings', ko: '설정' }, href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { lang } = useAdmin();

  const NavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => (
    <Link
      href={item.href}
      className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
    >
      {item.label[lang]}
    </Link>
  );

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="logo-area" style={{ marginBottom: '50px' }}>
        <img src="/images/halersymbol.png" alt="Haler" style={{ height: '28px' }} />
      </div>

      {/* Primary Nav */}
      {NAV_ITEMS.map(item => <NavLink key={item.href} item={item} />)}

      <div className="admin-nav-divider" />

      {/* Secondary Nav */}
      {NAV_ITEMS_2.map(item => <NavLink key={item.href} item={item} />)}

      <div className="admin-nav-divider" />

      {/* Content Management */}
      {NAV_ITEMS_CONTENT.map(item => <NavLink key={item.href} item={item} />)}

      {/* Bottom Nav */}
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        {NAV_ITEMS_3.map(item => <NavLink key={item.href} item={item} />)}
      </div>
    </aside>
  );
}
