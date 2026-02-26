'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavigationItem } from '../../types/navigation';
import useLanguage from '../../utils/i18n/hooks/useLanguage';
import { LanguageSelector } from '../LanguageSelector';

interface Props {
  items: NavigationItem[];
  isLoading?: boolean;
  rightControls?: React.ReactNode;
  showLanguageSelector?: boolean;
}

function isItemActive(item: NavigationItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  if (pathname.startsWith(item.href + '/')) return true;
  if (item.children) {
    return item.children.some((child) => isItemActive(child, pathname));
  }
  return false;
}

function DesktopRootItem({
  item,
  pathname,
  onHover,
}: {
  item: NavigationItem;
  pathname: string;
  onHover: (id: string | null) => void;
}) {
  const hasChildren = !!(item.children && item.children.length > 0);
  const active = isItemActive(item, pathname);

  const baseClass = `flex items-center h-14 text-sm whitespace-nowrap transition-colors duration-[0.4s] ${
    active
      ? 'font-medium text-foreground border-b-2 border-primary'
      : 'font-normal text-muted-foreground hover:text-foreground'
  }`;

  if (hasChildren) {
    return (
      <button
        type="button"
        onMouseEnter={() => onHover(item.id)}
        className={`${baseClass} bg-transparent border-0 cursor-pointer`}
      >
        {item.label}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onMouseEnter={() => onHover(null)}
      className={`${baseClass} no-underline`}
    >
      {item.label}
    </Link>
  );
}

function MobileMenuItems({
  items,
  pathname,
  onClose,
  depth,
}: {
  items: NavigationItem[];
  pathname: string;
  onClose: () => void;
  depth: number;
}) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = isItemActive(item, pathname);
        const exactActive = pathname === item.href;

        if (hasChildren) {
          return (
            <div key={item.id}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center py-2 text-sm font-semibold no-underline ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={{ paddingLeft: depth * 16 }}
              >
                {item.label}
              </Link>
              <MobileMenuItems
                items={item.children!}
                pathname={pathname}
                onClose={onClose}
                depth={depth + 1}
              />
            </div>
          );
        }

        // 최상위 항목(자식 없음) → 상위 메뉴와 동일한 스타일
        if (depth === 0) {
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={`flex items-center py-2 text-sm font-semibold no-underline ${
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        }

        // 하위 항목 (depth > 0)
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            className={`flex items-center py-2 text-sm no-underline rounded-md transition-colors ${
              exactActive
                ? 'border-l-2 border-primary bg-accent/60 font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={
              exactActive
                ? { paddingLeft: depth * 16 + 12 }
                : { paddingLeft: depth * 16 + 8 }
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function MobileMenu({
  items,
  pathname,
  rightControls,
  showLanguageSelector,
  onClose,
}: {
  items: NavigationItem[];
  pathname: string;
  rightControls?: React.ReactNode;
  showLanguageSelector?: boolean;
  onClose: () => void;
}) {
  return (
    <nav className="absolute top-[68px] left-0 right-0 bg-background border-b border-border shadow-lg px-4 py-4 overflow-y-auto max-h-[calc(100vh-68px)]">
      <div className="flex flex-col gap-1">
        <MobileMenuItems items={items} pathname={pathname} onClose={onClose} depth={0} />
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        {showLanguageSelector && <LanguageSelector />}
        {rightControls}
      </div>
    </nav>
  );
}

export function Navigation({ items, isLoading = false, rightControls, showLanguageSelector = true }: Props) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const { t } = useLanguage();

  const hasSubNav = hoveredItemId !== null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-start justify-center pointer-events-none h-0">
        <div
          onMouseLeave={() => setHoveredItemId(null)}
          className={`pointer-events-auto flex flex-col w-full transition-all duration-300 ${
            isScrolled
              ? 'mt-4 mx-[5%] rounded-[28px] border border-border bg-background/80 backdrop-blur-md shadow-sm px-6'
              : 'mt-0 mx-0 bg-transparent px-[4%]'
          }`}
        >
          {/* Logo + 루트 메뉴 + Controls */}
          <div className="flex items-start justify-between text-xl w-full">
            <div className="flex items-start">
              <Link
                href="/"
                className="h-14 flex items-center mr-[48px] shrink-0 text-[1.4em] font-black tracking-[-0.5px] text-foreground no-underline cursor-pointer"
              >
                JINYVERSE
              </Link>

              <nav className="hidden md:block">
                {isLoading ? (
                  <span className="h-14 flex items-center text-sm text-muted-foreground">
                    {t('common.loading')}
                  </span>
                ) : (
                  // CSS Grid: 컬럼 폭을 처음부터 최대 콘텐츠 기준으로 고정 → hover 시 우측 컨트롤 밀림 없음
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${items.length}, max-content)`,
                      columnGap: '36px',
                    }}
                  >
                    {/* 1행: 상위 메뉴 */}
                    {items.map((item) => (
                      <DesktopRootItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        onHover={setHoveredItemId}
                      />
                    ))}

                    {/* 2행: 하위 메뉴 — 항상 DOM에 존재(컬럼 폭 고정), 높이만 애니메이션 */}
                    {items.map((item) => (
                      <div
                        key={`sub-${item.id}`}
                        style={{
                          display: 'grid',
                          gridTemplateRows:
                            hasSubNav && item.children && item.children.length > 0
                              ? '1fr'
                              : '0fr',
                          transition: 'grid-template-rows 300ms ease',
                        }}
                      >
                        <div style={{ overflow: 'hidden', minHeight: 0 }}>
                          {item.children && item.children.length > 0 && (
                            <div className="flex flex-col gap-1.5 border-t border-border/50 pt-2 pb-3">
                              {item.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.href}
                                  className={`text-sm no-underline whitespace-nowrap transition-colors duration-[0.4s] ${
                                    pathname === child.href
                                      ? 'font-medium text-foreground'
                                      : 'text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </nav>
            </div>

            {/* Right controls */}
            <div className="h-14 flex items-center justify-end gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-2">
                {showLanguageSelector && <LanguageSelector />}
                {rightControls}
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="md:hidden flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer"
                aria-label={isMobileOpen ? '메뉴 닫기' : '메뉴 열기'}
                onClick={() => setIsMobileOpen((v) => !v)}
              >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {isLoading ? (
            <nav className="absolute top-[68px] left-0 right-0 bg-background border-b border-border shadow-lg px-4 py-4">
              <p className="text-sm text-muted-foreground px-2">{t('common.loading')}</p>
            </nav>
          ) : (
            <MobileMenu
              items={items}
              pathname={pathname}
              rightControls={rightControls}
              showLanguageSelector={showLanguageSelector}
              onClose={() => setIsMobileOpen(false)}
            />
          )}
        </div>
      )}
    </>
  );
}
