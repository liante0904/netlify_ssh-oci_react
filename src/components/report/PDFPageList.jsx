import React from 'react';

const PDFPageList = React.memo(function PDFPageList({ pages, scale, PageCanvas, style }) {
  const Canvas = PageCanvas;
  return <div className="pdf-viewer-pages" style={style}>{pages.map(({ pageNum, page }) => <div key={pageNum} className="pdf-page-wrapper"><Canvas page={page} scale={scale} /></div>)}</div>;
});

export default PDFPageList;
