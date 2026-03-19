import Link from "next/link";

export default function NotFound() {
  return (
    <section className="view">
      <section className="section-card centered-card">
        <span className="eyebrow">Not Found</span>
        <h1 className="section-title">찾으시는 Topic이나 경로를 찾지 못했습니다.</h1>
        <p className="muted">
          아직 시드 데이터에 없는 항목이거나 잘못된 주소일 수 있습니다. 홈으로 돌아가서
          다른 Topic부터 시작해 보세요.
        </p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            홈으로 이동
          </Link>
          <Link href="/topic/black-hole" className="btn btn-secondary">
            대표 Topic 보기
          </Link>
        </div>
      </section>
    </section>
  );
}
