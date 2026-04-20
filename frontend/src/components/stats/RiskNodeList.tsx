import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { hasGraphData } from '../../utils/graphDataStore';
import { RISK_THRESHOLD } from '../../constants/risk';
import type { FraudNode } from '../../types/index';

type RiskTab = 'high' | 'mid' | 'low';

interface Props {
  nodes: FraudNode[];
}

const TAB_DEFS: { key: RiskTab; labelKey: string; color: string; active: string; min: number; max: number }[] = [
  { key: 'high', labelKey: 'risk.tier.high',   color: 'text-red-400',    active: 'bg-red-500/20 border-red-500/60',       min: RISK_THRESHOLD.EXTREME,  max: 1.01 },
  { key: 'mid',  labelKey: 'risk.tier.mid',    color: 'text-orange-400', active: 'bg-orange-500/20 border-orange-500/60', min: RISK_THRESHOLD.MID_HIGH, max: RISK_THRESHOLD.EXTREME },
  { key: 'low',  labelKey: 'risk.tier.midlow', color: 'text-yellow-400', active: 'bg-yellow-500/20 border-yellow-500/60', min: RISK_THRESHOLD.MID,      max: RISK_THRESHOLD.MID_HIGH },
];

export function RiskNodeList({ nodes }: Props) {
  const { t } = useTranslation();
  const { state, dispatch, loadSubgraph, loadNodeDetail } = useDashboard();
  const [tab, setTab] = useState<RiskTab>('high');

  const tabDef = TAB_DEFS.find(td => td.key === tab)!;
  const filtered = nodes.filter(n => n.risk_score >= tabDef.min && n.risk_score < tabDef.max);

  const counts: Record<RiskTab, number> = {
    high: nodes.filter(n => n.risk_score >= TAB_DEFS[0].min && n.risk_score < TAB_DEFS[0].max).length,
    mid:  nodes.filter(n => n.risk_score >= TAB_DEFS[1].min && n.risk_score < TAB_DEFS[1].max).length,
    low:  nodes.filter(n => n.risk_score >= TAB_DEFS[2].min && n.risk_score < TAB_DEFS[2].max).length,
  };

  const handleSelect = (userId: number) => {
    dispatch({ type: 'SELECT_USER', userId });
    loadNodeDetail(userId);
    if (!state.subgraphCache.has(userId)) loadSubgraph(userId, 2);
  };

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
        <span className="w-0.5 h-3.5 bg-sky-500 rounded-full inline-block" />
        {t('risk.nodeList')}
      </h3>

      <div className="flex gap-1 mb-2">
        {TAB_DEFS.map(td => (
          <button
            key={td.key}
            onClick={() => setTab(td.key)}
            aria-pressed={tab === td.key}
            className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
              ${tab === td.key ? `${td.active} ${td.color}` : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}
          >
            {t(td.labelKey)}<br/>
            <span className="text-[10px] font-normal">({counts[td.key]})</span>
          </button>
        ))}
      </div>

      <div className="max-h-44 overflow-y-auto ring-1 ring-slate-700 rounded-lg">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-10">
            <p className="text-xs text-slate-500">{t('risk.noMatch')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-700/40">
            {filtered.slice(0, 200).map(n => {
              const isSelected = state.selectedUserId === n.user_id;
              const riskColor =
                n.risk_score >= RISK_THRESHOLD.EXTREME ? 'text-red-400'
                : n.risk_score >= RISK_THRESHOLD.MID_HIGH ? 'text-orange-400'
                : 'text-yellow-400';
              return (
                <li key={n.user_id}>
                  <button
                    onClick={() => handleSelect(n.user_id)}
                    className={`w-full text-left px-3 py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors
                      ${isSelected ? 'bg-indigo-500/25 border-l-2 border-indigo-400' : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sky-400 text-xs font-semibold flex items-center gap-1">
                        {n.user_id}
                        <span title={hasGraphData(n.user_id) ? t('fraud.hasGraph') : t('fraud.noGraph')} aria-hidden className={hasGraphData(n.user_id) ? 'text-emerald-400 text-[10px]' : 'text-slate-600 text-[10px]'}>
                          {hasGraphData(n.user_id) ? '●' : '○'}
                        </span>
                      </span>
                      <span className={`font-mono text-xs font-semibold ${riskColor}`}>
                        {(n.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
