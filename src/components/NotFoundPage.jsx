import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="not-found-page" aria-labelledby="not-found-title">
      <p className="not-found-code">404</p>
      <h1 id="not-found-title">페이지를 찾을 수 없습니다.</h1>
      <p>주소가 변경되었거나 존재하지 않는 페이지입니다.</p>
      <Link className="not-found-link" to="/">메인으로 돌아가기</Link>
    </main>
  );
}
