import { useWindowDimensions } from 'react-native';
import { BreakpointConfig, BreakpointName } from './DataTable.types';

function getBreakpoint(width: number): BreakpointName {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): BreakpointConfig {
  const { width } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);
  switch (breakpoint) {
    case 'mobile': return { breakpoint: 'mobile', paddingH: 8, paddingV: 10, fontSize: 13 };
    case 'tablet': return { breakpoint: 'tablet', paddingH: 10, paddingV: 14, fontSize: 14 };
    case 'desktop': return { breakpoint: 'desktop', paddingH: 12, paddingV: 16, fontSize: 15 };
  }
}