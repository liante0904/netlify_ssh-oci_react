import { useState } from 'react';

function SearchOverlay({ isOpen, toggleSearch, onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('title');

  const submitSearch = async () => {
    if (!query.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    const apiUrl = `https://g76c46bf8e6ef65-oracledb.adb.ap-seoul-1.oraclecloudapps.com/ords/admin/data_main_daily_send/search/?${category}=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(apiUrl);
      const { items } = await response.json();

      // 데이터 그룹화
      const groupedData = items.reduce((acc, item) => {
        const date = item.save_time.split('T')[0]; // 날짜 추출
        if (!acc[date]) acc[date] = {};
        if (!acc[date][item.firm_nm]) acc[date][item.firm_nm] = [];
        acc[date][item.firm_nm].push({
          id: item.report_id,
          title: item.article_title,
          writer: item.writer,
          link: item.telegram_url || item.download_url || item.attach_url,
        });
        return acc;
      }, {});

      // 부모 컴포넌트로 검색 결과 전달
      onSearch(groupedData);
      toggleSearch(); // 검색 후 오버레이 닫기
      setQuery(''); // 입력 필드 초기화
    } catch (error) {
      console.error('Error fetching search data:', error);
      alert('검색 중 오류가 발생했습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submitSearch();
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
        <button className="search-submit" onClick={submitSearch}>
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