'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation';
import useLanguage from '../../utils/i18n/hooks/useLanguage';
import { LanguageSelector } from '../LanguageSelector';

interface Props {
  items: NavigationItem[];
  isLoading?: boolean;
}

function NavLinkItem({
  item,
  pathname,
}: {
  item: NavigationItem;
  pathname: string;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [open]);

  const isActive = pathname === item.href;

  if (hasChildren) {
    return (
      <li key={item.id} className="relative list-none" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 text-sm transition-colors duration-[0.4s] py-3 ${
            isActive
              ? 'cursor-default font-medium text-white'
              : 'cursor-pointer font-normal text-[#e5e5e5] hover:text-[#b3b3b3]'
          }`}
        >
          {item.label}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <ul className="absolute left-0 top-full z-50 mt-0.5 min-w-[160px] list-none rounded bg-[#2a2a2a] py-1 shadow-lg">
            <li className="list-none">
              <Link
                href={item.href}
                className="block px-4 py-2.5 text-sm text-[#e5e5e5] no-underline hover:bg-[#333] hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label} ({t('nav.all')})
              </Link>
            </li>
            {item.children!.map((child) => (
              <li key={child.id} className="list-none">
                <Link
                  href={child.href}
                  className="block px-4 py-2.5 text-sm text-[#e5e5e5] no-underline hover:bg-[#333] hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li key={item.id} className="list-none">
      <Link
        href={item.href}
        className={`flex h-full items-center text-sm no-underline transition-colors duration-[0.4s] ${
          isActive
            ? 'cursor-default font-medium text-white'
            : 'cursor-pointer font-normal text-[#e5e5e5] hover:text-[#b3b3b3]'
        }`}
      >
        {item.label}
      </Link>
    </li>
  );
}

export function Navigation({ items, isLoading = false }: Props) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] transition-colors duration-[0.4s] ${
        isScrolled
          ? 'bg-[rgb(20,20,20)]'
          : 'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_10%,rgba(0,0,0,0)_100%)]'
      }`}
    >
      <div className="flex h-full items-center justify-between px-[4%] text-xl">
        <div className="flex items-center">
          <Link
            href="/"
            className="mr-[25px] inline-block align-middle text-[1.8em] font-black tracking-[-0.5px] text-[#e50914] no-underline cursor-pointer"
          >
            JINYVERSE
          </Link>

          <nav>
            {isLoading ? (
              <span className="text-sm text-gray-400">{t('common.loading')}</span>
            ) : (
              <ul className="m-0 flex list-none items-center gap-[18px] p-0">
                {items.map((item) => (
                  <NavLinkItem key={item.id} item={item} pathname={pathname} />
                ))}
              </ul>
            )}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="flex h-full items-center justify-end gap-[15px]">
          <LanguageSelector />
          <button
            type="button"
            className="relative mt-0.5 border-0 bg-transparent p-0.5 px-1.5 text-2xl leading-none text-white cursor-pointer"
            aria-label={t('nav.search')}
          >
            <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
              <path
                fillRule="evenodd"
                d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-1.38 7.03a9 9 0 1 1 1.41-1.41l5.68 5.67-1.42 1.42z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            className="relative mt-0.5 border-0 bg-transparent p-0.5 px-1.5 text-2xl leading-none text-white cursor-pointer"
            aria-label={t('nav.notification')}
          >
            <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
              <path
                fillRule="evenodd"
                d="M13 4.07A7 7 0 0 1 19 11v4.25q1.58.12 3.1.28l-.2 2a93 93 0 0 0-19.8 0l-.2-2q1.52-.15 3.1-.28V11a7 7 0 0 1 6-6.93V2h2zm4 11.06V11a5 5 0 0 0-10 0v4.13a97 97 0 0 1 10 0m-8.37 4.24C8.66 20.52 10.15 22 12 22s3.34-1.48 3.37-2.63c.01-.22-.2-.37-.42-.37h-5.9c-.23 0-.43.15-.42.37"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            className="flex w-full items-center border-0 bg-transparent p-0 cursor-pointer"
            aria-label={t('nav.profile')}
          >
            <div className="relative inline-block">
              <img
                src="https://occ-0-988-3997.1.nflxso.net/dnm/api/v6/vN7bi_My87NPKvsBoib006Llxzg/AAAABTZ2zlLdBVC05fsd2YQAR43J6vB1NAUBOOrxt7oaFATxMhtdzlNZ846H3D8TZzooe2-FT853YVYs8p001KVFYopWi4D4NXM.png?r=229"
                alt={t('nav.profile')}
                className="inline-block h-8 w-8 align-middle rounded"
              />
            </div>
            <span
              className="ml-2.5 inline-block h-0 w-0 border-[5px] border-solid border-t-white border-x-transparent border-b-transparent transition-transform duration-300"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </header>
  );
}
