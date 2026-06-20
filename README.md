# 사미반점 온라인 주문 시스템

매장 선택 → 메뉴판 → 장바구니 → 주문 접수 → 주문 현황으로 이어지는 고객용 흐름과,
메뉴/카테고리 관리, 주문 상태 관리, 실시간 알림을 갖춘 관리자 화면을 포함한 **완전히 동작하는 본체**입니다.

## 빠른 시작 (내 컴퓨터에서 실행해보기)

### 1) Node.js 설치 확인
터미널에 `node -v` 입력 → v18 이상이면 OK. 없으면 nodejs.org에서 설치.

### 2) 패키지 설치
```bash
npm install
```

### 3) 환경변수 설정
`.env.example` 파일을 복사해서 `.env` 파일을 만듭니다.
```bash
cp .env.example .env
```
`.env` 파일을 열어서 `ADMIN_PASSWORD`를 원하는 비밀번호로 바꿔주세요. (기본값: sami1234)

### 4) 데이터베이스 생성 + 초기 데이터 입력
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```
이 3줄이 끝나면 `prisma/dev.db` 파일이 생기고, 매장 2곳(하남 본점/미사2호점)·카테고리 4개·메뉴 9개가 자동으로 입력됩니다.

### 5) 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속 → 고객 화면이 보입니다.
`http://localhost:3000/admin` 접속 → 관리자 로그인 화면이 보입니다. (.env에 설정한 비밀번호로 로그인)

## 화면 구조

| 경로 | 설명 |
|---|---|
| `/` | 고객 화면 (매장선택 → 메뉴판 → 장바구니 → 주문접수 → 주문현황) |
| `/admin` | 관리자 로그인 후 대시보드 (주문 목록 + 상태 변경) |
| `/admin/menus` | 메뉴 추가/수정/삭제, 품절 처리 |
| `/admin/categories` | 카테고리 관리 |
| `/admin/orders/search` | 주문 검색/필터링 |
| `/admin/login` | 관리자 로그인 |
| `/api/health` | 배포 후 DB 연결 확인용 |

## 기술 구성

- **Next.js 15** (App Router)
- **tRPC** — 타입 안전한 API 통신
- **Prisma** — 데이터베이스 ORM (개발: SQLite / 운영: Postgres로 한 줄만 교체)
- **Tailwind CSS** — 사미반점 브랜드 색상(짜장 갈색·고추기름 빨강 톤)으로 커스텀

## 다음 단계 — Vercel 배포

운영 환경에 올리려면 `prisma/schema.prisma`의 `provider`를 `"sqlite"` → `"postgresql"`로 바꾸고,
Supabase 같은 무료 Postgres를 연결한 뒤 GitHub에 push → Vercel에서 Import 하면 됩니다.
이 부분은 별도로 도와드릴 수 있으니 준비되면 말씀해주세요.

## 알아두면 좋은 것

- 주문번호는 0001부터 순서대로 올라갑니다.
- 고객 화면의 주문 현황은 4초마다, 관리자 대시보드는 5초마다 자동 새로고침됩니다(폴링 방식).
- 메뉴를 품절 처리하면 고객 화면에서 즉시 주문 버튼이 비활성화됩니다.
- 관리자 비밀번호는 `.env` 파일의 `ADMIN_PASSWORD`로 관리되며, 코드에는 평문으로 남지 않습니다.
