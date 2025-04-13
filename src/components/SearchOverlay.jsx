import { useState, useCallback, useEffect, useRef } from 'react';

const firm_names = [
  "LS증권", "신한증권", "NH투자증권", "하나증권", "KB증권", "삼성증권",
  "상상인증권", "신영증권", "미래에셋증권", "현대차증권", "키움증권", "DS투자증권",
  "유진투자증권", "한국투자증권", "다올투자증권", "토스증권", "리딩투자증권", "대신증권",
  "IM증권", "DB금융투자", "메리츠증권", "한화투자증권", "한양증권", "BNK투자증권",
  "교보증권", "IBK투자증권"
];

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current && category !== 'company') {
      inputRef.current.focus();
    }
  }, [isOpen, category]);

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

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setQuery('');
  };

  const handleCompanyChange = (e) => {
    const selectedIndex = e.target.value;
    setQuery(selectedIndex);
    if (selectedIndex !== '') {
      onSearch(selectedIndex, 'company'); // ✅ 자동 호출
    }
  };

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
          onChange={handleCategoryChange}
        >
          <option value="title">제목</option>
          <option value="writer">작성자</option>
          <option value="company">증권사</option>
        </select>

        {category === 'company' ? (
          <select
            className="search-input"
            value={query}
            onChange={handleCompanyChange} // ✅ 자동 호출 로직 분리
          >
            <option value="">증권사 선택...</option>
            {firm_names.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            id="searchInput"
            placeholder="검색어 입력..."
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
        )}

        {/* ✅ 검색 버튼은 'company'일 때 숨김 */}
        {category !== 'company' && (
          <button className="search-submit" onClick={handleButtonClick}>
            검색
          </button>
        )}
        <button className="search-close" onClick={toggleSearch}>
          ×
        </button>
      </div>
    </div>
  );
}

export default SearchOverlay;
