import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionAppUser } from "@/lib/app-auth";

import { login } from "./actions";

export default async function AuthPage({
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
    <main className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <Link href="/" className="auth-card__logo">
            IK
          </Link>
          <h1 className="auth-card__title">메인 서비스 로그인</h1>
          <p className="auth-card__description">
            학습 기록과 설정을 이어서 사용하려면<br />
            일반 사용자 계정으로 로그인하세요.
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
                placeholder="you@example.com"
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
