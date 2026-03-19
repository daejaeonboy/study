# Intelligent Knowledge Library Web

`web/`는 지능형 지식 라이브러리의 실제 MVP 앱 코드입니다.

## 실행

```powershell
cd C:\Users\최동준\Desktop\study\web
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 됩니다.

## 검증

```powershell
npm run lint
npm run build
```

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

환경 변수가 비어 있으면 앱은 로컬 시드 데이터로 동작합니다.
