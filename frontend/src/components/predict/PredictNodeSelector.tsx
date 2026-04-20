import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { Spinner } from '../common/Spinner';
import { ExportButton } from '../common/ExportButton';
import { hasGraphData } from '../../utils/graphDataStore';
import { RiskBadge } from '../common/RiskBadge';

export function PredictNodeSelector() {
  const { t } = useTranslation();
  const { state, dispatch, loadSubgraph, loadNodeDetail } = useDashboard();
  const { predictNodes, selectedUserId, loading } = state;
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'blacklist' | 'normal'>('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const filtered = useMemo(() => {
    let nodes = predictNodes;
    if (filterMode === 'blacklist') nodes = nodes.filter(n => n.is_blacklist === 1);
    else if (filterMode === 'normal') nodes = nodes.filter(n => n.is_blacklist === 0);
    if (debouncedKeyword.trim()) {
      nodes = nodes.filter(n => String(n.user_id).includes(debouncedKeyword.trim()));
    }
    return nodes;
  }, [predictNodes, debouncedKeyword, filterMode]);

  const counts = useMemo(() => ({
    all: predictNodes.length,
    blacklist: predictNodes.filter(n => n.is_blacklist === 1).length,
    normal: predictNodes.filter(n => n.is_blacklist === 0).length,
  }), [predictNodes]);

  const handleSelect = useCallback((userId: number) => {
    dispatch({ type: 'SELECT_USER', userId });
    loadNodeDetail(userId);
    if (!state.subgraphCache.has(userId)) loadSubgraph(userId, 2);
  }, [dispatch, loadSubgraph, loadNodeDetail, state.subgraphCache]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-violet-400">{t('predict.title')}</span>
        <span className="text-xs text-slate-500">{t('fraud.resultCount', { count: filtered.length })}</span>
        <span className="ml-auto">
          <ExportButton rows={filtered.map(n => ({ user_id: n.user_id, risk_score: n.risk_score, is_blacklist: n.is_blacklist }))} filename={`predict-${filterMode}`} size="xs" />
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mb-2">{t('predict.subtitle')}</p>

      <div className="flex gap-1.5 mb-2 flex-wrap">
        {([
          { key: 'all', labelKey: 'predict.filter.all', count: counts.all },
          { key: 'blacklist', labelKey: 'predict.filter.blacklist', count: counts.blacklist },
          { key: 'normal', labelKey: 'predict.filter.normal', count: counts.normal },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterMode(tab.key)}
            aria-pressed={filterMode === tab.key}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
              ${filterMode === tab.key ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/50' : 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/70'}`}
          >
            {t(tab.labelKey, { count: tab.count })}
          </button>
        ))}
      </div>

      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" aria-hidden>🔍</span>
        <input
          type="text"
          placeholder={t('fraud.searchUserPlaceholder')}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          aria-label={t('common.search')}
          className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm shadow-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-56 sm:max-h-44 overflow-y-auto ring-1 ring-slate-700 rounded-lg">
        {loading.predictNodes ? (
          <div className="flex items-center justify-center h-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-10">
            <p className="text-xs text-slate-500">{t('risk.noMatch')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/40">
            {filtered.slice(0, 200).map(node => {
              const isSelected = selectedUserId === node.user_id;
              const isBlack = node.is_blacklist === 1;
              return (
                <li key={node.user_id}>
                  <button
                    onClick={() => handleSelect(node.user_id)}
                    className={`w-full text-left px-3 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors
                      ${isSelected ? 'bg-indigo-500/25 border-l-2 border-indigo-400' : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold text-xs ${isBlack ? 'text-red-400' : 'text-emerald-400'} flex items-center gap-1.5`}>
                        ID: {node.user_id}
                        <span className="text-slate-500 font-normal">{node.risk_score.toFixed(3)}</span>
                        <span title={hasGraphData(node.user_id) ? t('fraud.hasGraph') : t('fraud.noGraph')} aria-hidden className={hasGraphData(node.user_id) ? 'text-emerald-400 text-[10px]' : 'text-slate-600 text-[10px]'}>
                          {hasGraphData(node.user_id) ? '●' : '○'}
                        </span>
                      </span>
                      <RiskBadge score={node.risk_score} />
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
