"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const adminNavItems = [
  { href: "/admin", label: "개요" },
  { href: "/admin/topics", label: "Topic" },
  { href: "/admin/review-queue", label: "검수" },
  { href: "/admin/users", label: "운영진" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function resolvePageTitle(pathname: string) {
  if (pathname.startsWith("/admin/topics/") && pathname.endsWith("/edit")) {
    return "Topic 편집";
  }

  if (pathname.startsWith("/admin/topics/")) {
    return "Topic 상세";
  }

  if (pathname.startsWith("/admin/topics")) {
    return "Topic";
  }

  if (pathname.startsWith("/admin/review-queue")) {
    return "검수";
  }

  if (pathname.startsWith("/admin/users")) {
    return "운영진";
  }

  return "개요";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <Link href="/admin" className="admin-shell__brand">
          <span className="admin-shell__brand-mark">IK</span>
          <span className="admin-shell__brand-copy">
            <strong>운영</strong>
            <small>admin</small>
          </span>
        </Link>

        <nav className="admin-shell__nav" aria-label="Admin Navigation">
          {adminNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-shell__nav-link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-shell__sidebar-footer">
          <Link href="/" className="admin-shell__sidebar-link">
            서비스 보기
          </Link>
        </div>
      </aside>

      <main className="admin-shell__main">
        <header className="admin-shell__topbar">
          <div className="admin-shell__topbar-copy">
            <span className="admin-shell__eyebrow">ADMIN</span>
            <strong>{resolvePageTitle(pathname)}</strong>
          </div>

          <div className="admin-shell__topbar-actions">
            <Link href="/" className="btn btn-secondary btn-sm">
              공개 화면
            </Link>
          </div>
        </header>

        <div className="admin-shell__content">{children}</div>
      </main>
    </div>
  );
}
