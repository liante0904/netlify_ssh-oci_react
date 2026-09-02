import { useEffect, useRef } from 'react';

export function useHeaderHeight() {
  const headerRef = useRef(null);
  useEffect(() => {
    const headerNode = headerRef.current;
    if (!headerNode) return undefined;
    const updateHeaderHeight = () => {
      const safeAreaTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0;
      document.documentElement.style.setProperty('--header-height', `${headerNode.offsetHeight - safeAreaTop}px`);
    };
    updateHeaderHeight();
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerNode);
    return () => resizeObserver.disconnect();
  }, []);
  return headerRef;
}
