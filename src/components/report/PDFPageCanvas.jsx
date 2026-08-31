import React, { useEffect, useRef } from 'react';

const MAX_DPR = 2;

function PDFPageCanvas({ page, scale }) {
  const ref = useRef(null);
  const renderRef = useRef(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    destroyedRef.current = false;
    return () => {
      destroyedRef.current = true;
      renderRef.current?.cancel();
    };
  }, [page, scale]);

  useEffect(() => {
    if (!page || !ref.current) return undefined;
    renderRef.current?.cancel();
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let cancelled = false;

    (async () => {
      const viewport = page.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const pixelWidth = Math.min(Math.floor(viewport.width * dpr), 2400);
      const pixelHeight = Math.floor(viewport.height * (pixelWidth / (viewport.width * dpr)) * dpr);
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      if (cancelled || destroyedRef.current) return;
      renderRef.current = page.render({ canvasContext: ctx, viewport });
      await renderRef.current.promise;
    })().catch(() => {});

    return () => { cancelled = true; };
  }, [page, scale]);

  return <canvas ref={ref} className="pdf-page-canvas" />;
}

export default React.memo(PDFPageCanvas);
