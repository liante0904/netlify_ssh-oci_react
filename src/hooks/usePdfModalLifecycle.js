import { useEffect, useRef } from 'react';

export function usePdfModalLifecycle({ report, onClose, modalRef, closeButtonRef }) {
  const historyRef = useRef(false);
  const previousActiveElementRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!report) return undefined;
    const viewport = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewport?.getAttribute('content') || '';
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewport?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=10.0, user-scalable=yes, viewport-fit=cover');

    return () => {
      document.body.style.overflow = previousOverflow;
      viewport?.setAttribute('content', previousViewport);
    };
  }, [report]);

  useEffect(() => {
    if (!report) return undefined;
    previousActiveElementRef.current = document.activeElement;
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => previousActiveElementRef.current?.focus?.();
  }, [closeButtonRef, report]);

  useEffect(() => {
    if (!report) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusable = [...modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalRef, report]);

  useEffect(() => {
    if (!report) return undefined;
    const setHeight = () => document.documentElement.style.setProperty(
      '--pdf-viewer-height', `${window.visualViewport?.height || window.innerHeight}px`
    );
    setHeight();
    window.visualViewport?.addEventListener('resize', setHeight);
    window.addEventListener('resize', setHeight);
    return () => {
      window.visualViewport?.removeEventListener('resize', setHeight);
      window.removeEventListener('resize', setHeight);
      document.documentElement.style.removeProperty('--pdf-viewer-height');
    };
  }, [report]);

  useEffect(() => {
    if (!report) return undefined;
    window.history.pushState({ ...window.history.state, pdf: 1 }, '', window.location.href);
    historyRef.current = true;
    const handlePopState = () => {
      historyRef.current = false;
      onCloseRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (historyRef.current && window.history.state?.pdf) {
        historyRef.current = false;
        window.history.back();
      }
    };
  }, [onCloseRef, report]);

  return { onCloseRef };
}

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
      setScale((pageWidthRef.current && bodyRef.current)
        ? (bodyRef.current.clientWidth / pageWidthRef.current) * zoom
        : zoom);
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
