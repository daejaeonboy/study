import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionEditorialUser } from "@/lib/editorial-auth";

import { signup } from "@/app/login/actions";

export default async function EditorialSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const { message, next } = await searchParams;
  const editorialUser = await getSessionEditorialUser();
  const nextPath = next?.trim() || "/admin";

  if (editorialUser) {
    redirect(nextPath);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <Link href="/" className="auth-card__logo">
            IK
          </Link>
          <h1 className="auth-card__title">운영진 계정 등록</h1>
          <p className="auth-card__description">
            첫 등록자는 자동으로 admin이 되고,<br />
            이후 등록자는 기본 editor 권한으로 생성됩니다.
          </p>
        </header>

        {message ? (
          <div className="auth-card__message">
            <p>{message}</p>
          </div>
        ) : null}

        <section className="auth-card__body">
          <form className="auth-form">
            <input type="hidden" name="auth_path" value="/login/signup" />
            <input type="hidden" name="next" value={nextPath} />

            <div className="auth-form__field">
              <label htmlFor="display_name">이름</label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                placeholder="운영진 이름"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="signup_email">이메일</label>
              <input
                type="email"
                id="signup_email"
                name="signup_email"
                placeholder="editor@example.com"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="signup_password">비밀번호</label>
              <input
                type="password"
                id="signup_password"
                name="signup_password"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </div>

            <button type="submit" formAction={signup} className="auth-form__submit">
              계정 등록
            </button>
          </form>

          <div className="auth-card__actions">
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="auth-card__link">
              운영진 로그인
            </Link>
            <div className="auth-card__divider" />
            <Link href="/auth" className="auth-card__link is-secondary">
              메인 사용자 로그인
            </Link>
          </div>
        </section>

        <footer className="auth-card__footer">
          <Link href="/" className="auth-card__back-link">
            ← 홈으로 돌아가기
          </Link>
        </footer>
      </div>
    </main>
  );
}
