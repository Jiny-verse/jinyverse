'use client';

import { getNavigationItemsByChannel } from '../../data/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  channel?: 'external' | 'internal';
}

export function Navigation({ channel = 'internal' }: Props) {
  const items = getNavigationItemsByChannel(channel);
  const pathname = usePathname();

  return (
    <aside 
      style={{
        width: '256px',
        backgroundColor: '#181818',
        borderRight: '1px solid #333',
        minHeight: '100vh',
        flexShrink: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        zIndex: 10
      }}
    >
      <div style={{ height: '100vh', overflowY: 'auto' }}>
        {/* 로고/헤더 */}
        <div 
          style={{
            padding: '24px',
            borderBottom: '1px solid #333'
          }}
        >
          <h2 
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              margin: 0
            }}
          >
            Jinyverse
          </h2>
          <p 
            style={{
              fontSize: '14px',
              color: '#999',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}
          >
            Admin Panel
          </p>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav style={{ padding: '16px' }}>
          <ul 
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#fff' : '#b3b3b3',
                      backgroundColor: isActive ? '#333' : 'transparent',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.backgroundColor = '#2a2a2a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#b3b3b3';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
