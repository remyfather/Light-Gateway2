# Light Gateway UI

Upstage UIE 전용 게이트웨이의 워크플로우 디자인 프론트엔드입니다.

## 기술 스택

- Next.js 16
- React 19
- Tailwind CSS 4
- React Flow (@xyflow/react) - 워크플로우 캔버스

## 실행

```bash
npm install
npm run dev
```

개발 서버: http://localhost:3001

## 구조

- `/` - 워크플로우 목록 (내 워크플로우, 샘플)
- `/workflows/new/design` - 새 워크플로우 디자이너
- `/workflows/[id]/design` - 워크플로우 편집

## 백엔드 연동

Gateway API (Spring Boot + Camel): http://localhost:8080
