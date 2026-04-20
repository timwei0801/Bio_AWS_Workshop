import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import type { FpFnNode } from '../../types/index';
import { Spinner } from '../common/Spinner';
import { ExportButton } from '../common/ExportButton';
import { hasGraphData } from '../../utils/graphDataStore';

export function getFilteredFpFnNodes(nodes: FpFnNode[], keyword: string): FpFnNode[] {
  return nodes.filter(n => String(n.user_id).includes(keyword.trim()));
}

export function FpFnNodeSelector() {
  const { t } = useTranslation();
  const { state, dispatch, loadSubgraph, loadNodeDetail } = useDashboard();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const isFp = state.dashboardMode === 'fp' || state.fpFnMode === 'fp';
  const nodes = isFp ? state.fpNodes : state.fnNodes;
  const loading = state.loading.fpFnNodes;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => { setKeyword(''); }, [state.dashboardMode]);

  const filtered = getFilteredFpFnNodes(nodes, debouncedKeyword);

  const handleSelect = useCallback((userId: number) => {
    dispatch({ type: 'SELECT_USER', userId });
    loadNodeDetail(userId);
    if (!state.subgraphCache.has(userId)) loadSubgraph(userId, 2);
  }, [dispatch, loadSubgraph, loadNodeDetail, state.subgraphCache]);

  const accentClass = isFp ? 'text-amber-300' : 'text-emerald-300';
  const title = isFp ? t('fpfn.fp.listTitle') : t('fpfn.fn.listTitle');
  const desc  = isFp ? t('fpfn.fp.subtitle')  : t('fpfn.fn.subtitle');

  return (
    <div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className={`text-xs font-bold uppercase tracking-wider ${accentClass}`}>{title}</span>
        <span className="text-xs text-slate-500">{t('fraud.resultCount', { count: filtered.length })}</span>
        <span className="ml-auto">
          <ExportButton rows={filtered.map(n => ({ ...n }))} filename={isFp ? 'fp-nodes' : 'fn-nodes'} size="xs" />
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{desc}</p>

      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" aria-hidden>🔍</span>
        <input
          type="text"
          placeholder={t('fraud.searchUserPlaceholder')}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          aria-label={t('common.search')}
          className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm shadow-sm placeholder-slate-500 text-slate-200
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-56 sm:max-h-44 overflow-y-auto ring-1 ring-slate-700 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center h-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-10">
            <p className="text-xs text-slate-500">{t('risk.noMatch')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/40">
            {filtered.slice(0, 200).map(n => {
              const isSelected = state.selectedUserId === n.user_id;
              return (
                <li key={n.user_id}>
                  <button
                    onClick={() => handleSelect(n.user_id)}
                    className={`w-full text-left px-3 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors
                      ${isSelected
                        ? 'bg-indigo-500/25 border-l-2 border-indigo-400'
                        : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold text-xs ${accentClass} flex items-center gap-1.5`}>
                        ID: {n.user_id}
                        <span className="text-slate-500 font-normal">{n.risk_score.toFixed(3)}</span>
                        <span title={hasGraphData(n.user_id) ? t('fraud.hasGraph') : t('fraud.noGraph')} className={hasGraphData(n.user_id) ? 'text-emerald-400 text-[10px]' : 'text-slate-600 text-[10px]'} aria-hidden>
                          {hasGraphData(n.user_id) ? '●' : '○'}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{(n.risk_score * 100).toFixed(0)}%</span>
                    </div>
                  </button>
                </li>
              );
            })}
            {filtered.length > 200 && (
              <li>
                <p className="text-xs text-slate-500 text-center py-1.5">{t('predict.overflow')}</p>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
