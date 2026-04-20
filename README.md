# Intelligent Knowledge Library Web

`web/`는 지능형 지식 라이브러리의 실제 MVP 앱 코드입니다.

## 실행

```powershell
cd C:\Users\USER\Desktop\study-0327
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.
`npm run dev`는 실행 전에 `.next` 캐시를 정리한 뒤 Next 개발 서버를 띄워서, 이전 번들이 남아 반영이 늦는 문제를 줄입니다.

캐시 정리 없이 원래 개발 서버만 바로 띄우고 싶으면 아래 스크립트를 사용할 수 있습니다.

```powershell
npm run dev:raw
```

## 검증

```powershell
npm run lint
npm run build
npm run test:seed-import
npm run test:editorial-bootstrap
npm run test:db-check
npm run db:check
```

운영 번들 기준으로 한 번 더 확인하려면 preview 서버를 사용할 수 있습니다.

```powershell
npm run preview
```

브라우저에서 `http://localhost:3001`으로 접속하면 됩니다.

## 현재 구조

- `src/app/`: Next.js App Router 라우트
- `src/components/`: UI와 클라이언트 상태 컴포넌트
- `src/lib/data/seed.ts`: 로컬 시드 데이터
- `src/lib/repository.ts`: Supabase 연결을 고려한 데이터 접근 계층
- `supabase/schema.sql`: 초기 DB 스키마

## 환경 변수

`.env.example`를 참고해 아래 값을 채우면 됩니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BOOTSTRAP_ADMIN_EMAIL`

환경 변수가 비어 있으면 앱은 로컬 시드 데이터로 동작합니다.
읽기 전용 연결은 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 가능하고,
운영 콘솔의 실제 저장/할당/검수 write API는 `SUPABASE_SERVICE_ROLE_KEY`까지 있어야 활성화됩니다.
첫 운영 관리자는 `SUPABASE_BOOTSTRAP_ADMIN_EMAIL`로 지정합니다. 현재 프로젝트에서는
`cryingonion77@gmail.com` 계정을 관리자 기준으로 사용합니다.

문제 풀이 저장과 운영자 문제 템플릿 편집까지 쓰려면 `supabase/schema.sql`의
`practice_question_templates`, `practice_attempts` 테이블 정의도 Supabase SQL Editor에
적용해야 합니다. 적용 전에는 문제 생성/인쇄는 가능하지만, 풀이 저장과 템플릿 저장은
스키마 적용 필요 메시지를 반환합니다.

## Supabase 운영 스크립트

```powershell
npm run admin:bootstrap
npm run db:check
npm run seed:supabase -- --dry-run
```

- `admin:bootstrap`: `SUPABASE_BOOTSTRAP_ADMIN_EMAIL` 계정을 `editorial_users`의 admin으로 생성/보정합니다.
- `db:check`: Supabase Auth, 주요 테이블 row 수, bootstrap admin 계정, practice 테이블 적용 여부를 읽기 전용으로 점검합니다.
- `seed:supabase -- --dry-run`: 시드 적재 전 예상 대상 수를 확인합니다.

이미 시드 Topic이 들어간 DB에서는 `npm run seed:supabase`가 기본적으로 중단됩니다.
의도적으로 projection row를 새로 고치려면 `npm run seed:supabase -- --force`를 사용하십시오.
