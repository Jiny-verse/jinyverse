'use client';

import Link from 'next/link';
import type { NavigationItem } from 'common/types';

interface Props {
  items: NavigationItem[];
}

export function Footer({ items }: Props) {
  const year = new Date().getFullYear();

  if (items.length === 0) return null;

  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="px-[4%] py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Brand */}
          <div className="shrink-0 md:mr-auto">
            <Link
              href="/"
              className="text-lg font-black tracking-[-0.5px] text-foreground no-underline"
            >
              JINYVERSE
            </Link>
          </div>

          {/* Menu columns — 원래 순서 유지 */}
          {items.map((item) => (
            <div key={item.id}>
              <Link
                href={item.href}
                className="text-sm font-semibold text-foreground no-underline"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2 list-none p-0 m-0">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={child.href}
                        className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6 text-right">
          <p className="text-sm text-muted-foreground">
            &copy; {year} JINYVERSE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
