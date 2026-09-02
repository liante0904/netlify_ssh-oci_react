import React from 'react';
import { createPortal } from 'react-dom';
import GridSelectOverlay from './GridSelectOverlay';
import { useGridOverlay } from '../hooks/useGridOverlay';
import { hasGridSelection, normalizeGridValue } from '../utils/gridSelect';
import './BoardSelect.css';

function BoardSelect({ value, boards = [], onChange, className = '' }) {
  const { isOpen, searchTerm, setSearchTerm, toggleOverlay, closeOverlay } = useGridOverlay();

  const selectedBoard = (boards || []).find(board => board?.article_board_order?.toString() === value?.toString());
  const selectedName = hasGridSelection(value)
    ? (selectedBoard?.board_nm || '게시판 필터')
    : '게시판 필터';

  const handleSelect = (boardOrder) => {
    onChange({ target: { value: normalizeGridValue(boardOrder) } });
    closeOverlay();
  };

  const filteredBoards = (boards || [])
    .map((board) => ({
      name: board?.board_nm || '',
      order: board?.article_board_order,
      count: board?.report_count || 0
    }))
    .filter(item => item.name?.includes(searchTerm));

  const overlay = (
    <GridSelectOverlay type="board" title="게시판 선택" closeLabel="게시판 선택 닫기" searchPlaceholder="찾으시는 게시판을 입력하세요" searchTerm={searchTerm} onSearchTermChange={setSearchTerm} onClose={closeOverlay}>
        <div className="firm-checkerboard">
          <div
            className={`checker-item all ${hasGridSelection(value) ? '' : 'active'}`}
            onClick={() => handleSelect(null)}
          >
            <div className="checker-icon">ALL</div>
            <div className="checker-name">전체보기</div>
          </div>

          {filteredBoards.map(({ name, order, count }) => {
            const initial = name.substring(0, 1);

            return (
              <div
                key={order}
                className={`checker-item ${value?.toString() === order?.toString() ? 'active' : ''}`}
                onClick={() => handleSelect(order)}
              >
                <div className="checker-icon">
                  {initial}
                </div>
                <div className="checker-name">
                  {name}
                  <span className="checker-count">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
    </GridSelectOverlay>
  );

  return (
    <div className={`board-grid-container ${className}`.trim()}>
      <button type="button" className={`grid-trigger-btn ${hasGridSelection(value) ? 'selected' : ''}`} onClick={toggleOverlay} aria-label="게시판 선택 열기">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
        </svg>
        <span>{selectedName}</span>
      </button>

      {isOpen && createPortal(overlay, document.body)}
    </div>
  );
}

export default BoardSelect;
