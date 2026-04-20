import { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { DashboardMode } from '../types/index';

const MAP: Record<string, DashboardMode> = {
  '1': 'overview',
  '2': 'features',
  '3': 'fraud',
  '4': 'fp',
  '5': 'fn',
  '6': 'predict',
  '7': 'compare',
};

export function useKeyboardShortcuts() {
  const { dispatch } = useDashboard();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const mode = MAP[e.key];
      if (mode) {
        e.preventDefault();
        dispatch({ type: 'SET_DASHBOARD_MODE', mode });
        return;
      }
      if (e.key === '/') {
        const input = document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="user_id" i], input[type="text"][placeholder*="search" i]');
        if (input) { e.preventDefault(); input.focus(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);
}
