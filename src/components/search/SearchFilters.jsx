import CompanySelect from '../CompanySelect';
import BoardSelect from '../BoardSelect';

const ROUTES = [
  { id: 'recent', label: '최근 레포트', icon: '🕘' },
  { id: 'global', label: '글로벌 레포트', icon: '🌍' },
  { id: 'industry', label: '산업 레포트', icon: '🏭' },
  { id: 'outlook', label: '전망 레포트', icon: '🔮' },
  { id: 'ai-summary', label: 'AI요약 리포트', icon: '🤖' },
];

const SORTS = [
  { id: 'time', label: '최근 등록일 순', icon: '⏱️' },
  { id: 'company', label: '증권사 가나다 순', icon: '🗂️' },
];

function FilterChips({ items, value, onChange }) {
  return (
    <div className="filter-chip-group">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`filter-chip-item ${value === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          <span className="chip-icon">{item.icon}</span>
          <span className="chip-text">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SearchFilters({
  category,
  searchTerm,
  selectedCompany,
  selectedBoard,
  selectedRoute,
  selectedSort,
  boards,
  onCategoryChange,
  onSearchTermChange,
  onCompanyChange,
  onBoardChange,
  onRouteChange,
  onSortChange,
  onReset,
}) {
  return (
    <section className="filter-panel-card">
      <div className="filter-grid">
        <div className="filter-item text-search-box">
          <label className="filter-label">🔍 텍스트 검색</label>
          <div className="text-search-fields">
            <select className="search-category-select" value={category} onChange={onCategoryChange}>
              <option value="title">제목</option>
              <option value="writer">작성자</option>
              <option value="tag">태그</option>
              <option value="sector">산업</option>
              <option value="stock">종목명</option>
            </select>
            <input
              type="text"
              placeholder="검색어 입력..."
              className="search-text-input"
              value={searchTerm}
              onChange={onSearchTermChange}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => onSearchTermChange({ target: { value: '' } })}>
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={`filter-item company-box ${selectedCompany ? 'has-boards' : ''}`}>
          <label className="filter-label">🗂️ 증권사 필터</label>
          <CompanySelect value={selectedCompany} onChange={onCompanyChange} className="search-company-select" />
        </div>

        {selectedCompany && (
          <div className="filter-item board-box">
            <label className="filter-label">📋 게시판 필터</label>
            <BoardSelect value={selectedBoard} boards={boards} onChange={onBoardChange} className="search-board-select" />
          </div>
        )}

        <div className="filter-item route-box">
          <label className="filter-label">🏷️ 조회 대상 분류</label>
          <FilterChips items={ROUTES} value={selectedRoute} onChange={onRouteChange} />
        </div>

        <div className="filter-item sort-box">
          <label className="filter-label">⚖️ 정렬 기준</label>
          <FilterChips items={SORTS} value={selectedSort} onChange={onSortChange} />
        </div>
      </div>

      <div className="filter-actions-row">
        <button type="button" className="btn-filter-reset" onClick={onReset}>🔄 필터 초기화</button>
      </div>
    </section>
  );
}
