import { useState, useCallback, useEffect, useRef } from 'react';

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');
  const inputRef = useRef(null); // ✅ input DOM 참조

  // ✅ isOpen이 true가 될 때 input에 자동 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      alert('검색어를 입력해주세요.');
      return;
    }
    onSearch(trimmedQuery, category);
    setQuery('');
  }, [query, category, onSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handleButtonClick = useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  if (!isOpen) return null;

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
          ref={inputRef} // ✅ 여기 ref 연결
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