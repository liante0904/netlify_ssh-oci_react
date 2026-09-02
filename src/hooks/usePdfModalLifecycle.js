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
