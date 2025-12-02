# Trip Planner 프론트엔드 (Next.js 16) 실행 가이드

로컬에서 Next.js 앱을 실행할 때 필요한 환경 변수와 절차를 정리했습니다.

## 기본 정보
- 기본 포트: `3000`
- API 호출 기본값: `NEXT_PUBLIC_API_BASE`(기본 `http://localhost:8000/api/v1`)

## 사전 요구사항
- Node.js 18+ (권장 20) 및 `pnpm`(lockfile 제공). `npm`/`yarn`도 가능하지만 `pnpm` 사용을 추천.

## 환경 변수 (`frontend/.env.local`)
```
NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1   # 또는 NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key       # 지도 렌더링에 필요, 없으면 지도 컴포넌트에서 오류 메시지 표시
```

## 설치 및 실행
```
cd frontend
pnpm install            # 또는 npm install / yarn
pnpm dev --port 3000
```
- 프로덕션 빌드/실행: `pnpm build && pnpm start`
- API 스펙 요약: `frontend/rest_api_spec.md` 참고

## 빠른 전체 실행 순서
1) `backend/.env` 작성 → 백엔드 `uvicorn app.main:app --reload --port 8000`
2) `frontend/.env.local` 작성 → 프론트 `pnpm dev --port 3000`
3) 브라우저에서 `http://localhost:3000` 접속 (백엔드와 같은 네트워크/포트 설정 확인)

