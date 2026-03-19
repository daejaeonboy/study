"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <section className="view">
      <section className="section-card centered-card">
        <span className="eyebrow">Something Went Wrong</span>
        <h1 className="section-title">화면을 불러오는 중 문제가 생겼습니다.</h1>
        <p className="muted">
          브라우저 캐시나 확장 프로그램 상태가 꼬였을 수 있습니다. 한 번 새로고침하거나 홈으로
          돌아가 다시 시작해 보세요.
        </p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            다시 시도
          </button>
          <Link href="/" className="btn btn-secondary">
            홈으로 이동
          </Link>
        </div>
      </section>
    </section>
  );
}
