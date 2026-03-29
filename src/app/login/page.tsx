import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionEditorialUser } from "@/lib/editorial-auth";

import { login } from "./actions";

export default async function LoginPage({
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
          <h1 className="auth-card__title">운영진 로그인</h1>
          <p className="auth-card__description">
            운영 콘솔과 Topic 편집 화면은<br />
            운영진 계정으로만 접근할 수 있습니다.
          </p>
        </header>

        {message ? (
          <div className="auth-card__message">
            <p>{message}</p>
          </div>
        ) : null}

        <section className="auth-card__body">
          <form className="auth-form">
            <input type="hidden" name="next" value={nextPath} />

            <div className="auth-form__field">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="editor@example.com"
                required
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" formAction={login} className="auth-form__submit">
              로그인
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
