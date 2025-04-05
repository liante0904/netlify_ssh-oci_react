import { useState, useCallback } from 'react';

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');

  // 검색 실행 함수
  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();
    console.log('Query before submission:', trimmedQuery);

    if (!trimmedQuery) {
      alert('검색어를 입력해주세요.');
      return;
    }

    onSearch(trimmedQuery, category); // 검색 실행
    setQuery(''); // 입력 초기화
  }, [query, category, onSearch]);

  // 엔터 키 핸들러
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 동작 방지
      handleSearch();
    }
  }, [handleSearch]);

  // 버튼 클릭 핸들러
  const handleButtonClick = useCallback((e) => {
    e.preventDefault(); // 버튼 기본 동작 방지
    handleSearch();
  }, [handleSearch]);

  if (!isOpen) return null; // 조건부 렌더링으로 불필요한 DOM 제거

  return (
    <div
      className="search-overlay"
      id="searchOverlay"
      style={{ display: isOpen ? 'flex' : 'none' }}
      onClick={toggleSearch}
    >
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <select
          id="searchCategory"
          className="search-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="title">제목</option>
          <option value="writer">작성자</option>
          <option value="company">증권사</option>
        </select>
        <input
          type="text"
          id="searchInput"
          placeholder="검색어 입력..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="search-submit" onClick={handleButtonClick}>
          검색
        </button>
        <button className="search-close" onClick={toggleSearch}>
          ×
        </button>
      </div>
    </div>
  );
}

export default SearchOverlay;