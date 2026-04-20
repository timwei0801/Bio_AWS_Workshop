import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { ShapWaterfall } from '../common/ShapWaterfall';
import { getShapForUser } from '../../utils/graphDataStore';
import { classifyRisk } from '../../constants/risk';
import type { ShapWaterfallResponse } from '../../types/index';

export function PredictDetailPanel() {
  const { t } = useTranslation();
  const { state } = useDashboard();
  const { selectedUserId, predictNodes } = state;
  const [shapData, setShapData] = useState<ShapWaterfallResponse | null>(null);
  const [shapLoading, setShapLoading] = useState(false);

  const selectedNode = useMemo(() => {
    if (selectedUserId == null) return null;
    return predictNodes.find(n => n.user_id === selectedUserId) ?? null;
  }, [selectedUserId, predictNodes]);

  useEffect(() => {
    if (selectedUserId == null) { setShapData(null); return; }
    let cancelled = false;
    const fetch = () => {
      setShapLoading(true);
      getShapForUser('fp', selectedUserId)
        .then(d => { if (!cancelled) setShapData(d); })
        .finally(() => { if (!cancelled) setShapLoading(false); });
    };
    fetch();
    window.addEventListener('bitoguard:localeChanged', fetch);
    return () => {
      cancelled = true;
      window.removeEventListener('bitoguard:localeChanged', fetch);
    };
  }, [selectedUserId]);

  if (!selectedNode) {
    return <p className="text-xs text-slate-500 py-1 text-center">○ {t('predict.selectPrompt')}</p>;
  }

  const { user_id, risk_score, is_blacklist } = selectedNode;
  const isBlack = is_blacklist === 1;
  const tier = classifyRisk(risk_score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-700 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-violet-500 rounded-full" aria-hidden />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('predict.title')}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${isBlack ? 'bg-red-900/60 text-red-300 ring-1 ring-red-500/50' : 'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50'}`}>
          {isBlack ? `⚠ ${t('predict.chipBlacklist')}` : `✓ ${t('predict.chipNormal')}`}
        </span>
      </div>

      <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg ring-1 ${isBlack ? 'bg-red-900/10 ring-red-700/40' : 'bg-slate-800/40 ring-slate-700/50'}`}>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.userId')}</p>
          <p className="text-base font-bold text-sky-400 mt-0.5">{user_id}</p>
        </div>
        <div className="rounded-md bg-slate-700/40 p-2.5">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('detail.riskScore')}</p>
          <p className={`text-base font-bold mt-0.5 ${tier.textClass}`}>{risk_score.toFixed(4)}</p>
        </div>
        <div className="rounded-md bg-slate-700/40 p-2.5 col-span-2">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{t('predict.result')}</p>
          <p className={`text-base font-bold mt-0.5 ${isBlack ? 'text-red-400' : 'text-emerald-400'}`}>
            {isBlack ? t('predict.resultBlacklist') : t('predict.resultNormal')}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-700 flex-wrap">
          <span className="w-0.5 h-4 bg-violet-500 rounded-full inline-block flex-shrink-0" aria-hidden />
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
          {shapLoading ? (
            <p className="text-xs text-slate-400 text-center py-4 animate-pulse">{t('common.loading')}</p>
          ) : shapData && shapData.features.length > 0 ? (
            <ShapWaterfall features={shapData.features} baseValue={shapData.base_value} sort={false} />
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">{t('detail.shapUnavailable')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
