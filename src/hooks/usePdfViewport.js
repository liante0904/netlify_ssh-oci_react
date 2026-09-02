import { useEffect, useRef } from 'react';

export function usePdfViewport({ bodyRef, pageWidthRef, setScale }) {
  const zoomRef = useRef(1);
  const pinchRef = useRef({ dist: 0, base: 1 });

  useEffect(() => {
    const element = bodyRef.current;
    if (!element) return undefined;
    const distance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    const handleStart = (event) => {
      if (event.touches.length === 2) pinchRef.current = { dist: distance(event.touches), base: zoomRef.current };
    };
    const handleMove = (event) => {
      if (event.touches.length !== 2 || !pinchRef.current.dist) return;
      const zoom = Math.max(0.5, Math.min(5, pinchRef.current.base * (distance(event.touches) / pinchRef.current.dist)));
      zoomRef.current = zoom;
      setScale((pageWidthRef.current && bodyRef.current) ? (bodyRef.current.clientWidth / pageWidthRef.current) * zoom : zoom);
    };
    const handleEnd = () => { pinchRef.current = { dist: 0, base: 1 }; };
    element.addEventListener('touchstart', handleStart, { passive: false });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd);
    element.addEventListener('touchcancel', handleEnd);
    return () => {
      element.removeEventListener('touchstart', handleStart);
      element.removeEventListener('touchmove', handleMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('touchcancel', handleEnd);
    };
  }, [bodyRef, pageWidthRef, setScale]);

  useEffect(() => {
    const handleResize = () => {
      if (!bodyRef.current || !pageWidthRef.current) return;
      const contentWidth = bodyRef.current.clientWidth;
      if (contentWidth > 0) setScale(contentWidth / pageWidthRef.current);
    };
    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, [bodyRef, pageWidthRef, setScale]);
}
