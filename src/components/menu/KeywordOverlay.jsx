import React from 'react';
import KeywordOverlayHeader from './KeywordOverlayHeader';
import KeywordOverlayContent from './KeywordOverlayContent';
import KeywordUndoBar from './KeywordUndoBar';

function KeywordOverlay({ newKeyword, setNewKeyword, handleAddKeyword, handleDeleteKeyword, handleDeleteAllKeywords, handleUndoDelete, keywords, isLoadingKeywords, lastDeleted, toggleKeywordOverlay }) {
  return <div className="grid-overlay-portal keyword-setup-overlay"><KeywordOverlayHeader value={newKeyword} onChange={setNewKeyword} onAdd={handleAddKeyword} onClose={toggleKeywordOverlay} /><KeywordOverlayContent keywords={keywords} loading={isLoadingKeywords} onDelete={handleDeleteKeyword} onDeleteAll={handleDeleteAllKeywords} /><KeywordUndoBar lastDeleted={lastDeleted} onUndo={handleUndoDelete} /></div>;
}

export default KeywordOverlay;
