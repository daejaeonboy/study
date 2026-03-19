"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  badge: string;
};

const learnItems: NavItem[] = [
  { href: "/", label: "홈", hint: "시작 노트", badge: "HM" },
  { href: "/topic/black-hole", label: "주제", hint: "깊이 읽기", badge: "TP" },
  { href: "/guide", label: "가이드", hint: "탐색 설계", badge: "GD" },
];

const archiveItems: NavItem[] = [
  { href: "/path/black-hole", label: "여정", hint: "학습 경로", badge: "PT" },
  { href: "/library", label: "서고", hint: "보관된 노트", badge: "LB" },
  { href: "/workspace", label: "작업실", hint: "연결과 기록", badge: "WS" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={`nav-item ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className="nav-item__badge">{item.badge}</span>
      <span className="nav-item__meta">
        <span className="nav-item__label">{item.label}</span>
        <small className="nav-item__hint">{item.hint}</small>
      </span>
    </Link>
  );
}

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Primary Navigation">
      <div className="nav-cluster">
        <span className="nav-group__label">학습</span>
        {learnItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
      <div className="nav-cluster">
        <span className="nav-group__label">축적</span>
        {archiveItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </nav>
  );
}
