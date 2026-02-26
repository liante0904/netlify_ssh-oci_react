import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import './SearchOverlay.css';
import CompanySelect from './CompanySelect';

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);
  const isInitialMount = useRef(true);

  // 토스트 도우미
  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2000);
  }, []);

  // 오버레이 열릴 때 상태 복원
  useEffect(() => {
    console.log('SearchOverlay: isOpen changed to:', isOpen);
    if (isOpen && isInitialMount.current) {
      const urlQuery = searchParams.get('q') || '';
      const urlCategory = searchParams.get('category') || 'title';
      setQuery(urlQuery);
      setCategory(urlCategory);
      console.log('SearchOverlay: Restored state:', { urlQuery, urlCategory });
      isInitialMount.current = false;
    }
    if (!isOpen) {
      setQuery('');
      setCategory('title');
      isInitialMount.current = true; // 다음 오버레이 열림 시 초기화
    }
  }, [isOpen, searchParams]);

  // 포커스 처리
  useEffect(() => {
    if (isOpen && inputRef.current && category !== 'company') {
      inputRef.current.focus();
    }
  }, [isOpen, category]);

  const handleSearch = useCallback(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery && category !== 'company') {
      showToast('검색어를 입력해주세요.');
      return;
    }

    console.log('SearchOverlay: Executing search:', { query: trimmedQuery, category });
    setSearchParams({ q: trimmedQuery, category });
    onSearch({ query: trimmedQuery, category });
    // toggleSearch() 제거: 검색 후 오버레이 유지
  }, [query, category, onSearch, setSearchParams, showToast]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleButtonClick = useCallback(
    (buttonName) => {
      if (buttonName === 'search') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleCategoryChange = useCallback(
    (e) => {
      const newCategory = e.target.value;
      console.log('SearchOverlay: Category changed to:', newCategory);
      setCategory(newCategory);
      setQuery('');
      setSearchParams({}, { replace: true }); // 즉시 URL 파라미터 초기화, 히스토리 대체
    },
    [setSearchParams]
  );

  const handleCompanyChange = useCallback(
    (e) => {
      const selectedValue = e.target.value;
      console.log('SearchOverlay: Company selected:', selectedValue);
      setQuery(selectedValue);
      if (selectedValue) {
        setSearchParams({ q: selectedValue, category: 'company' }, { replace: true });
        onSearch({ query: selectedValue, category: 'company' });
        // toggleSearch() 제거: 회사 선택 후 오버레이 유지
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [onSearch, setSearchParams]
  );

  if (!isOpen) {
    console.log('SearchOverlay: Not rendering (isOpen is false)');
    return null;
  }

  return (
    <>
      <div className={`search-overlay ${isOpen ? 'visible' : ''}`} id="searchOverlay" onClick={toggleSearch}>
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
            <CompanySelect value={query} onChange={handleCompanyChange} />
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

          {category !== 'company' && (
            <button
              className="search-submit"
              onClick={() => handleButtonClick('search')}
            >
              검색
            </button>
          )}
        </div>
      </div>
      
      {/* 토스트 알림 */}
      <div className={`toast-container ${toast.visible ? 'visible' : ''}`}>
        {toast.message}
      </div>
    </>
  );
}

export default SearchOverlay;
