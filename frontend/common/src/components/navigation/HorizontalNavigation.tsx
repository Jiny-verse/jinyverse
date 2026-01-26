'use client';

import { getNavigationItemsByChannel } from '../../data/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Props {
  channel?: 'external' | 'internal';
}

export function Navigation({
  channel = 'external',
}: Props) {
  const items = getNavigationItemsByChannel(channel);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className="pinning-header"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        height: '68px',
        background: isScrolled 
          ? 'rgb(20, 20, 20)' 
          : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 10%, rgba(0,0,0,0) 100%)',
        transition: 'background-color 0.4s'
      }}
    >
      <div 
        className="main-header"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '100%', 
          padding: '0 4%',
          fontSize: '1.2rem'
        }}
      >
        {/* Primary Navigation */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo */}
          <Link 
            href="/"
            className="logo"
            style={{ 
              marginRight: '25px',
              textDecoration: 'none',
              color: '#e50914',
              fontSize: '1.8em',
              fontWeight: 900,
              letterSpacing: '-0.5px',
              cursor: 'pointer',
              display: 'inline-block',
              verticalAlign: 'middle'
            }}
          >
            JINYVERSE
          </Link>

          {/* Navigation Menu */}
          <nav className="tabbed-primary-navigation">
            <ul 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '18px',
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}
            >
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li 
                    key={item.id} 
                    className="navigation-tab"
                    style={{ 
                      display: 'block',
                      listStyleType: 'none',
                      marginLeft: '18px'
                    }}
                  >
                    <Link
                      href={item.href}
                      style={{
                        alignItems: 'center',
                        color: isActive ? '#fff' : '#e5e5e5',
                        display: 'flex',
                        height: '100%',
                        position: 'relative',
                        transition: 'color 0.4s',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: isActive ? 500 : 400,
                        cursor: isActive ? 'default' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.color = '#b3b3b3';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.color = '#e5e5e5';
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

        {/* Secondary Navigation */}
        <div 
          className="secondary-navigation"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            height: '100%',
            justifyContent: 'flex-end'
          }}
        >
          {/* Search */}
          <div className="nav-element">
            <button 
              style={{
                background: 'transparent',
                border: 0,
                color: 'white',
                cursor: 'pointer',
                padding: '2px 6px 3px',
                fontSize: '1.5em',
                lineHeight: 1,
                marginTop: '0.2em',
                position: 'relative'
              }}
              aria-label="검색"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-1.38 7.03a9 9 0 1 1 1.41-1.41l5.68 5.67-1.42 1.42z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Notifications */}
          <div className="nav-element notifications">
            <button 
              className="notifications-menu"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5em',
                lineHeight: 1,
                marginTop: '0.2em',
                padding: '2px 6px 3px',
                position: 'relative'
              }}
              aria-label="알림"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path fillRule="evenodd" d="M13 4.07A7 7 0 0 1 19 11v4.25q1.58.12 3.1.28l-.2 2a93 93 0 0 0-19.8 0l-.2-2q1.52-.15 3.1-.28V11a7 7 0 0 1 6-6.93V2h2zm4 11.06V11a5 5 0 0 0-10 0v4.13a97 97 0 0 1 10 0m-8.37 4.24C8.66 20.52 10.15 22 12 22s3.34-1.48 3.37-2.63c.01-.22-.2-.37-.42-.37h-5.9c-.23 0-.43.15-.42.37" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          {/* Profile */}
          <div className="nav-element account-menu-item">
            <button 
              className="account-dropdown-button"
              style={{
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              aria-label="프로필"
            >
              <div 
                className="avatar-wrapper"
                style={{
                  display: 'inline',
                  position: 'relative'
                }}
              >
                <img 
                  className="profile-icon"
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '4px',
                    verticalAlign: 'middle'
                  }}
                  src="https://occ-0-988-3997.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABTZ2zlLdBVC05fsd2YQAR43J6vB1NAUBOOrxt7oaFATxMhtdzlNZ846H3D8TZzooe2-FT853YVYs8p001KVFYopWi4D4NXM.png?r=229" 
                  alt="프로필"
                />
              </div>
              <span 
                className="caret"
                style={{
                  borderColor: '#fff transparent transparent',
                  borderStyle: 'solid',
                  borderWidth: '5px 5px 0',
                  height: 0,
                  marginLeft: '10px',
                  transition: 'transform 367ms cubic-bezier(0.21, 0, 0.07, 1)',
                  width: 0,
                  display: 'inline-block'
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
