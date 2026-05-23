# Food Diary 🍽️

오늘 먹은 음식 사진을 업로드하면 자동으로 누끼를 따서 스티커로 저장하는 일상 수집 다이어리.

## 주요 기능

- **자동 배경 제거**: `@imgly/background-removal`으로 브라우저에서 직접 누끼 처리 (API 키 불필요)
- **물리 시뮬레이션**: Matter.js로 스티커가 중력에 따라 떨어지며 쌓이는 효과
- **스티커 갤러리**: 최신순/오래된순 정렬
- **메모 기능**: 스티커별 날짜 + 메모 저장

## 로컬 개발 세팅

### 1. PostgreSQL 데이터베이스 준비

[Neon](https://neon.tech) 에서 무료 PostgreSQL 인스턴스를 생성합니다.

1. neon.tech 가입 → New Project 생성
2. Dashboard → Connection String 복사 (postgresql://... 형태)

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 을 열어 DATABASE_URL에 복사한 Connection String을 붙여넣습니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

---

## Vercel 배포

### 1. 저장소 push 후 Vercel 연결

```bash
git add .
git commit -m "init"
git remote add origin <your-repo-url>
git push
```

[vercel.com](https://vercel.com) 에서 GitHub 저장소 import

### 2. 환경변수 설정 (Vercel Dashboard → Settings → Environment Variables)

| 이름 | 값 |
|------|-----|
| `DATABASE_URL` | Neon Connection String |

### 3. Vercel Blob 설정 (이미지 저장)

Vercel Dashboard → Storage → Blob → Create Store  
프로젝트에 연결하면 `BLOB_READ_WRITE_TOKEN`이 자동으로 주입됩니다.

> **로컬에서는** `BLOB_READ_WRITE_TOKEN`이 없어도 됩니다.  
> 이미지가 `public/uploads/` 폴더에 저장됩니다.

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma |
| 이미지 저장 | Vercel Blob (개발: public/uploads) |
| 배경 제거 | @imgly/background-removal |
| 물리 엔진 | Matter.js |
