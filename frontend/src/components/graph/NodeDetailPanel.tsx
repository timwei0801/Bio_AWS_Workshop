import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { ShapWaterfall } from '../common/ShapWaterfall';
import { SHAP_BASE_VALUE, classifyRisk } from '../../constants/risk';
import type { NeighborPeer } from '../../types/index';

interface NeighborListProps {
  peers: NeighborPeer[];
  labelKey: string;
  color: string;
}

function NeighborList({ peers, labelKey, color }: NeighborListProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-1.5">
      <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${color}`}>{t(labelKey)}</p>
      <div className="space-y-1">
        {peers.map(p => {
          const label = p.node_type === 'wallet'
            ? (p.node_label ?? `wallet_${p.peer_id}`)
            : `User ${p.peer_id}`;
          return (
            <div key={p.peer_id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-slate-800/60 ring-1 ring-slate-600/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`text-[10px] flex-shrink-0 ${p.node_type === 'wallet' ? 'text-violet-400' : 'text-sky-400'}`} aria-hidden>
                  {p.node_type === 'wallet' ? '◆' : '●'}
                </span>
                <span className="text-xs text-slate-300 truncate" title={label}>{label}</span>
                {p.status === 1 && (
                  <span className="text-[9px] bg-red-900/60 text-red-300 px-1 rounded flex-shrink-0">{t('detail.fraud')}</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <div className="text-right">
                  <div className="text-[9px] text-slate-500">{t('detail.neighbors.txCount')}</div>
                  <div className="text-xs text-slate-400">{p.tx_count}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface NeighborSectionProps {
  labelKey: string;
  count: number;
  activeColor: string;
  textColor: string;
  children: React.ReactNode;
}

function NeighborSection({ labelKey, count, activeColor, textColor, children }: NeighborSectionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500
          ${open ? `${activeColor} ${textColor}` : 'bg-slate-700/30 ring-slate-600/40 text-slate-400 hover:text-slate-200'}`}
      >
        <span>{t(labelKey)} · {count}</span>
        <span className="text-[10px]" aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      {open && count > 0 && <div className="mt-1 px-1">{children}</div>}
      {open && count === 0 && <p className="text-[10px] text-slate-500 text-center py-2">{t('detail.neighbors.empty')}</p>}
    </div>
  );
}

export function NodeDetailPanel() {
  const { t } = useTranslation();
  const { state, loadNodeDetail } = useDashboard();
  const { selectedNode, loading, error } = state;

  useEffect(() => {
    const refresh = () => { if (selectedNode?.user_id != null) loadNodeDetail(selectedNode.user_id); };
    window.addEventListener('bitoguard:localeChanged', refresh);
    return () => window.removeEventListener('bitoguard:localeChanged', refresh);
  }, [selectedNode?.user_id, loadNodeDetail]);

  if (loading.nodeDetail) return <div className="text-sm text-slate-400">{t('common.loading')}</div>;
  if (error.nodeDetail)  return <div className="text-sm text-red-400">{error.nodeDetail}</div>;
  if (!selectedNode)     return <p className="text-xs text-slate-500 py-1 text-center">○ {t('detail.selectPrompt')}</p>;

  const { user_id, risk_score, status, shap_features, neighbor_counts, neighbor_details } = selectedNode;
  const isFraud = status === 1;
  const tier = classifyRisk(risk_score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-sky-500 rounded-full" aria-hidden />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('detail.title')}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isFraud ? 'bg-red-900/60 text-red-300 ring-1 ring-red-500/50' : 'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50'}`}>
          {isFraud ? `⚠ ${t('detail.fraud')}` : `✓ ${t('detail.normal')}`}
        </span>
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg ring-1 ${isFraud ? 'bg-red-900/10 ring-red-700/40' : 'bg-slate-800/40 ring-slate-700/50'}`}>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.userId')}</p>
          <p className="text-base font-bold text-sky-400 mt-0.5">{user_id}</p>
        </div>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.riskScore')}</p>
          <p className={`text-base font-bold mt-0.5 ${tier.textClass}`}>{risk_score.toFixed(3)}</p>
        </div>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.status')}</p>
          <p className={`text-base font-bold mt-0.5 ${isFraud ? 'text-red-400' : 'text-emerald-400'}`}>
            {isFraud ? t('detail.fraud') : t('detail.normal')}
          </p>
        </div>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.neighborCount')}</p>
          <p className="text-base font-bold text-slate-100 mt-0.5">{neighbor_counts.r1 + neighbor_counts.r2 + neighbor_counts.r3}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-700 flex-wrap">
          <span className="w-0.5 h-4 bg-sky-500 rounded-full inline-block flex-shrink-0" aria-hidden />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('detail.shapTitle')}</h4>
          <span className="ml-auto text-[10px] text-slate-500 font-mono">User {user_id}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500 opacity-80" aria-hidden />
            {t('detail.shapLegendPos')}
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-80" aria-hidden />
            {t('detail.shapLegendNeg')}
          </div>
        </div>
        <div className="bg-slate-900/40 rounded-lg px-2 py-1.5 ring-1 ring-slate-700/40">
          {shap_features.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{t('detail.shapUnavailable')}</p>
          ) : (
            <ShapWaterfall features={shap_features} baseValue={SHAP_BASE_VALUE} showEndpoints={false} />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span className="w-0.5 h-3.5 bg-sky-500 rounded-full inline-block" aria-hidden />
          {t('detail.neighborsHeader')}
        </h4>

        <NeighborSection labelKey="detail.neighbors.r1" count={neighbor_counts.r1} activeColor="bg-sky-500/20" textColor="text-sky-300">
          <NeighborList peers={neighbor_details.r1} labelKey="detail.neighbors.sourceWallets" color="text-sky-400" />
        </NeighborSection>

        <NeighborSection labelKey="detail.neighbors.r2" count={neighbor_counts.r2} activeColor="bg-amber-500/20" textColor="text-amber-300">
          {neighbor_details.r2_out.length > 0 && (
            <NeighborList peers={neighbor_details.r2_out} labelKey="detail.neighbors.r2_out" color="text-amber-400" />
          )}
          {neighbor_details.r2_in.length > 0 && (
            <NeighborList peers={neighbor_details.r2_in} labelKey="detail.neighbors.r2_in" color="text-amber-300" />
          )}
        </NeighborSection>

        <NeighborSection labelKey="detail.neighbors.r3" count={neighbor_counts.r3} activeColor="bg-emerald-500/20" textColor="text-emerald-300">
          <NeighborList peers={neighbor_details.r3} labelKey="detail.neighbors.targetWallets" color="text-emerald-400" />
        </NeighborSection>
      </div>
    </div>
  );
}
