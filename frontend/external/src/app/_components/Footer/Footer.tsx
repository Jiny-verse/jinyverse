'use client';

import Link from 'next/link';
import type { NavigationItem } from 'common/types';

interface Props {
  items: NavigationItem[];
}

export function Footer({ items }: Props) {
  const year = new Date().getFullYear();

  const menuColumns = items.filter((item) => item.children && item.children.length > 0);
  const standaloneItems = items.filter((item) => !item.children || item.children.length === 0);

  if (items.length === 0) return null;

  return (
    <footer className="border-t border-border bg-background mt-12">
      <div className="px-[4%] py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.2fr_repeat(auto-fit,1fr)]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-lg font-black tracking-[-0.5px] text-foreground no-underline"
            >
              JINYVERSE
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              &copy; {year} JINYVERSE. All rights reserved.
            </p>
          </div>

          {/* Menu columns */}
          {menuColumns.map((item) => (
            <div key={item.id}>
              <Link
                href={item.href}
                className="text-sm font-semibold text-foreground no-underline"
              >
                {item.label}
              </Link>
              <ul className="mt-3 flex flex-col gap-2 list-none p-0 m-0">
                {item.children!.map((child) => (
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
            </div>
          ))}

          {/* Standalone items (no children) */}
          {standaloneItems.length > 0 && (
            <div>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {standaloneItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
