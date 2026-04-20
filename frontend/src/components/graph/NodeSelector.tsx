import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { useFraudNodes } from '../../hooks/useFraudNodes';
import type { FraudNode } from '../../types/index';
import { Spinner } from '../common/Spinner';
import { hasGraphData, findUsersByWalletId, type WalletSearchResult } from '../../utils/graphDataStore';
import { RiskBadge } from '../common/RiskBadge';

type SearchMode = 'node' | 'wallet';

export function getFilteredNodes(nodes: FraudNode[], keyword: string): FraudNode[] {
  return nodes.filter(n => n.risk_score >= 0.4 && String(n.user_id).includes(keyword.trim()));
}

export function NodeSelector() {
  const { t } = useTranslation();
  const { fraudNodes, loading } = useFraudNodes();
  const { state, dispatch, loadSubgraph, loadNodeDetail } = useDashboard();

  const [mode, setMode] = useState<SearchMode>('node');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [walletResults, setWalletResults] = useState<WalletSearchResult[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (mode !== 'wallet') return;
    if (!debouncedKeyword.trim()) { setWalletResults([]); return; }
    setWalletLoading(true);
    findUsersByWalletId(debouncedKeyword)
      .then(setWalletResults)
      .catch(() => setWalletResults([]))
      .finally(() => setWalletLoading(false));
  }, [debouncedKeyword, mode]);

  const handleModeChange = useCallback((next: SearchMode) => {
    setMode(next); setKeyword(''); setDebouncedKeyword(''); setWalletResults([]);
  }, []);

  const handleSelect = useCallback((userId: number) => {
    dispatch({ type: 'SELECT_USER', userId });
    loadNodeDetail(userId);
    if (!state.subgraphCache.has(userId)) loadSubgraph(userId, 2);
  }, [dispatch, loadSubgraph, loadNodeDetail, state.subgraphCache]);

  const handleSelectWallet = useCallback((walletId: string, userId: number) => {
    dispatch({ type: 'SELECT_WALLET', walletId, userId });
    loadNodeDetail(userId);
    if (!state.subgraphCache.has(userId)) loadSubgraph(userId, 2);
  }, [dispatch, loadSubgraph, loadNodeDetail, state.subgraphCache]);

  const filteredNodes = getFilteredNodes(fraudNodes, debouncedKeyword);
  const resultCount = mode === 'node' ? filteredNodes.length : walletResults.length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-slate-400 text-xs" aria-hidden>☰</span>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {t('fraud.selectTitle')}
        </label>
        <span className="ml-auto text-xs text-slate-500">{t('fraud.resultCount', { count: resultCount })}</span>
      </div>

      <div className="flex mb-2 rounded-lg overflow-hidden ring-1 ring-slate-600/60 bg-slate-800/60">
        <button
          onClick={() => handleModeChange('node')}
          aria-pressed={mode === 'node'}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500
            ${mode === 'node' ? 'bg-indigo-600/70 text-indigo-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'}`}
        >
          {t('fraud.searchMode.user')}
        </button>
        <button
          onClick={() => handleModeChange('wallet')}
          aria-pressed={mode === 'wallet'}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500
            ${mode === 'wallet' ? 'bg-indigo-600/70 text-indigo-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'}`}
        >
          {t('fraud.searchMode.wallet')}
        </button>
      </div>

      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" aria-hidden>🔍</span>
        <input
          id="node-search"
          type="text"
          placeholder={mode === 'node' ? t('fraud.searchUserPlaceholder') : t('fraud.searchWalletPlaceholder')}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          aria-label={t('common.search')}
          className="w-full pl-8 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm shadow-sm placeholder-slate-500 text-slate-200
                     focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-56 sm:max-h-44 overflow-y-auto ring-1 ring-slate-700 rounded-lg">
        {mode === 'node' ? (
          loading ? (
            <div className="flex items-center justify-center h-16"><Spinner /></div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex items-center justify-center gap-2 h-10 text-center">
              <span className="text-slate-600" aria-hidden>🔍</span>
              <p className="text-xs text-slate-500">{t('risk.noMatch')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700/40">
              {filteredNodes.slice(0, 300).map(n => {
                const isSelected = state.selectedUserId === n.user_id;
                return (
                  <li key={n.user_id}>
                    <button
                      onClick={() => handleSelect(n.user_id)}
                      className={`w-full text-left px-3 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors
                        ${isSelected ? 'bg-indigo-500/25 border-l-2 border-indigo-400' : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sky-400 text-xs flex items-center gap-1.5">
                          ID: {n.user_id}
                          <span className="text-slate-500 font-normal">{n.risk_score.toFixed(3)}</span>
                          <span title={hasGraphData(n.user_id) ? t('fraud.hasGraph') : t('fraud.noGraph')} aria-hidden className={hasGraphData(n.user_id) ? 'text-emerald-400 text-[10px]' : 'text-slate-600 text-[10px]'}>
                            {hasGraphData(n.user_id) ? '●' : '○'}
                          </span>
                        </span>
                        <RiskBadge score={n.risk_score} showPercent />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          walletLoading ? (
            <div className="flex items-center justify-center h-16"><Spinner /></div>
          ) : !debouncedKeyword.trim() ? (
            <div className="flex items-center justify-center gap-2 h-10 text-center">
              <span aria-hidden>💰</span>
              <p className="text-xs text-slate-500">{t('fraud.searchWalletPlaceholder')}</p>
            </div>
          ) : walletResults.length === 0 ? (
            <div className="flex items-center justify-center gap-2 h-10 text-center">
              <span aria-hidden>🔍</span>
              <p className="text-xs text-slate-500">{t('risk.noMatch')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700/40">
              {walletResults.map((r, i) => {
                const isSelected = state.selectedWalletId === r.walletId;
                const relLabel = r.relationType === 'R1' ? t('fraud.inflow') : t('fraud.outflow');
                const relCls   = r.relationType === 'R1' ? 'text-emerald-400' : 'text-orange-400';
                return (
                  <li key={`${r.walletId}-${r.userId}-${i}`}>
                    <button
                      onClick={() => handleSelectWallet(r.walletId, r.userId)}
                      className={`w-full text-left px-3 py-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 transition-colors
                        ${isSelected ? 'bg-amber-500/20 border-l-2 border-amber-400' : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span aria-hidden>💰</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{r.walletId}</span>
                        <span className={`text-[10px] font-medium ${relCls}`}>{relLabel}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sky-400 text-xs flex items-center gap-1.5">
                          ID: {r.userId}
                          <span className="text-slate-500 font-normal">{r.riskScore.toFixed(3)}</span>
                        </span>
                        <RiskBadge score={r.riskScore} showPercent />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
