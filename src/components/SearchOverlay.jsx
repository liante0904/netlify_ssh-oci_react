import { useSearchOverlayController } from '../hooks/useSearchOverlayController';
import SearchOverlayContent from './search/SearchOverlayContent';
import './SearchOverlay.css';

function SearchOverlay() {
  const { isSearchOpen, toggleSearch, query, category, toast, boards, selectedCompanyOrder, selectedBoard, overlayRef, inputRef, setQuery, handleCategory, handleSearchClick, handleCompany, handleBoard } = useSearchOverlayController();
  if (!isSearchOpen) return null;
  return <SearchOverlayContent overlayRef={overlayRef} inputRef={inputRef} category={category} query={query} boards={boards} selectedCompanyOrder={selectedCompanyOrder} selectedBoard={selectedBoard} toast={toast} onClose={toggleSearch} onCategory={handleCategory} onQuery={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleSearchClick()} onSearch={handleSearchClick} onCompany={handleCompany} onBoard={handleBoard} />;
}

export default SearchOverlay;
