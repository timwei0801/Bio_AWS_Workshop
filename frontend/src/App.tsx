import { useEffect, useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Dashboard } from './components/layout/Dashboard';
import { CryptoBackground } from './components/common/CryptoBackground';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { loadStats, loadFraudNodes, loadFpFnNodes, loadPredictNodes } = useDashboard();

  useEffect(() => {
    Promise.all([loadStats(), loadFraudNodes(), loadFpFnNodes(), loadPredictNodes()]);
  }, [loadStats, loadFraudNodes, loadFpFnNodes, loadPredictNodes]);

  return <Dashboard />;
}

/**
 * Detect print mode from ?print=true query. When active we:
 * - tag <html> with data-print-mode="true" so the CSS rules in index.css
 *   apply a white, high-contrast, animation-free theme
 * - skip the CryptoBackground canvas altogether
 * This is for report screenshots / PDF export.
 */
function usePrintMode(): boolean {
  const [printMode, setPrintMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('print') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (printMode) root.setAttribute('data-print-mode', 'true');
    else root.removeAttribute('data-print-mode');
    return () => root.removeAttribute('data-print-mode');
  }, [printMode]);

  // Allow runtime toggle via keyboard: shift + p
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'p' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setPrintMode(p => !p);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return printMode;
}

export default function App() {
  const printMode = usePrintMode();
  return (
    <ErrorBoundary>
      <DashboardProvider>
        {!printMode && <CryptoBackground />}
        <AppContent />
      </DashboardProvider>
    </ErrorBoundary>
  );
}
