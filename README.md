# 증권사 실시간 레포트 모아보기

React를 사용하여 구축된 주식 리포트 조회용 웹 애플리케이션입니다.

## ✨ 주요 기능

- **리포트 조회**: 카테고리별(전체, 글로벌, 산업)로 주식 리포트 목록을 확인할 수 있습니다.
- **무한 스크롤**: 사용자가 페이지 하단으로 스크롤하면 자동으로 다음 리포트를 불러옵니다.
- **검색**: 전체 리포트 내에서 원하는 내용을 검색할 수 있는 오버레이 형태의 검색 기능을 제공합니다.
- **반응형 UI**: 데스크톱 및 모바일 환경에 최적화된 UI를 제공합니다.
  - 스크롤에 따라 동적으로 사라지거나 나타나는 헤더와 하단 네비게이션
  - 플로팅 메뉴 및 햄버거 메뉴를 통한 추가 기능 접근

## 🛠️ 기술 스택

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router
- **UI**: React Infinite Scroll Component
- **Linting**: ESLint

## ⚙️ 시작하기

### 1. 프로젝트 복제

```bash
git clone <repository-url>
cd stock-reports-vite
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

## 📜 사용 가능한 스크립트

- `npm run dev`: 개발 모드로 앱을 실행합니다.
- `npm run build`: 프로덕션용으로 앱을 빌드합니다.
- `npm run lint`: ESLint를 사용하여 코드 스타일을 검사합니다.
- `npm run preview`: 프로덕션 빌드를 로컬에서 미리 봅니다.