import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionAppUser } from "@/lib/app-auth";

import { signup } from "@/app/auth/actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  const appUser = await getSessionAppUser();
  const nextPath = next?.trim() || "/";

  if (appUser) {
    redirect(nextPath);
  }

  return (
    <section className="view">
      <header className="stack" style={{ gap: "var(--space-5)" }}>
        <span className="caption" style={{ color: "var(--accent)" }}>
          USER AUTH
        </span>
        <h1 className="hero-title">메인 서비스 회원가입</h1>
        <p className="hero-copy" style={{ maxWidth: "860px" }}>
          새 계정을 만들고 학습 기록을 시작하세요.
        </p>
        <div className="hero-actions">
          <Link href={`/auth?next=${encodeURIComponent(nextPath)}`} className="btn btn-secondary">
            로그인으로 돌아가기
          </Link>
          <Link href="/" className="btn btn-ghost">
            메인으로 돌아가기
          </Link>
        </div>
      </header>

      {message ? (
        <section
          className="surface"
          style={{
            marginTop: "var(--space-6)",
            padding: "var(--space-5)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <p className="muted">{message}</p>
        </section>
      ) : null}

      <section
        className="surface-elevated"
        style={{
          marginTop: "var(--space-8)",
          padding: "var(--space-8)",
          maxWidth: "560px",
        }}
      >
        <div className="section-head">
          <h2 className="section-title">회원가입</h2>
          <p className="muted">학습 기록을 만들 새 계정을 등록합니다.</p>
        </div>
        <form className="stack" style={{ gap: "var(--space-4)", marginTop: "var(--space-5)" }}>
          <input type="hidden" name="auth_path" value="/signup" />
          <input type="hidden" name="next" value={nextPath} />
          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">이름</span>
            <input className="plain-input" type="text" name="display_name" required />
          </label>
          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">이메일</span>
            <input className="plain-input" type="email" name="signup_email" required />
          </label>
          <label className="stack" style={{ gap: "8px" }}>
            <span className="caption">비밀번호</span>
            <input
              className="plain-input"
              type="password"
              name="signup_password"
              minLength={8}
              required
            />
          </label>
          <button type="submit" formAction={signup} className="btn btn-primary">
            회원가입
          </button>
        </form>
      </section>
    </section>
  );
}
