import { useHeaderHeight } from './useHeaderHeight';
import { useNavigationVisibility } from './useNavigationVisibility';

export function useAppLayout() {
  const navigation = useNavigationVisibility();
  const headerRef = useHeaderHeight();
  return { ...navigation, headerRef };
}
