import { useState, useCallback } from 'react';

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitSearch = useCallback(() => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const trimmedQuery = query.trim();
    console.log('Query before submission:', trimmedQuery);

    if (!trimmedQuery) {
      alert('검색어를 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    onSearch(trimmedQuery, category);
    setQuery('');
    setTimeout(() => setIsSubmitting(false), 100); // 비동기 처리 후 플래그 해제
  }, [query, category, isSubmitting, onSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Enter 기본 동작 방지
      submitSearch();
    }
  };

  const handleButtonClick = (e) => {
    e.preventDefault(); // 버튼 기본 동작 방지
    submitSearch();
  };

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