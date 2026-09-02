import { useEffect } from 'react';

export function useShareMenuPosition(menuRef, isOpen, position) {
  useEffect(() => {
    if (!isOpen || !menuRef.current || !position) return;
    const menu = menuRef.current;
    const menuWidth = 280;
    const adjustedLeft = Math.max(20, Math.min(position.left - menuWidth / 2, window.innerWidth - menuWidth - 20));
    menu.style.top = `${position.top + 10}px`;
    menu.style.left = `${adjustedLeft}px`;
  }, [isOpen, menuRef, position]);
}
