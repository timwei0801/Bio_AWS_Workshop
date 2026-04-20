import { useEffect, useRef } from 'react';
import { useDashboard } from '../context/DashboardContext';
import type { DashboardMode } from '../types/index';
import { ALL_DASHBOARD_MODES } from '../types/index';

/**
 * Sync dashboard mode and selected user with URL hash.
 * Format:  #/<mode>[?user=<id>]
 *   e.g.   #/overview
 *          #/fp?user=226
 *          #/fraud?user=64142
 *
 * We use the hash (not pathname) so it works with the static /Bio_AWS_Workshop/ base.
 */
export function useUrlState() {
  const { state, dispatch, loadNodeDetail, loadSubgraph } = useDashboard();
  const firstRunRef = useRef(true);

  // Hash → state (initial + back/forward)
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;
      const [rawMode, query] = hash.split('?');
      const mode = rawMode as DashboardMode;
      if (!ALL_DASHBOARD_MODES.includes(mode)) return;
      if (state.dashboardMode !== mode) dispatch({ type: 'SET_DASHBOARD_MODE', mode });
      const params = new URLSearchParams(query ?? '');
      const userIdRaw = params.get('user');
      if (userIdRaw) {
        const uid = Number(userIdRaw);
        if (Number.isFinite(uid) && uid !== state.selectedUserId) {
          dispatch({ type: 'SELECT_USER', userId: uid });
          loadNodeDetail(uid);
          if (!state.subgraphCache.has(uid)) loadSubgraph(uid, 2);
        }
      }
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State → hash
  useEffect(() => {
    if (firstRunRef.current) { firstRunRef.current = false; return; }
    const parts = [state.dashboardMode];
    const qs: string[] = [];
    if (state.selectedUserId != null) qs.push(`user=${state.selectedUserId}`);
    const hash = `#/${parts.join('/')}${qs.length ? `?${qs.join('&')}` : ''}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }, [state.dashboardMode, state.selectedUserId]);
}
