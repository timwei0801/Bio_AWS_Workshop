import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { ShapWaterfall } from '../common/ShapWaterfall';
import { Spinner } from '../common/Spinner';
import { LLM_Model } from './LLM_Model';

export function ShapPanel() {
  const { t } = useTranslation();
  const { state, loadShapWaterfall } = useDashboard();
  const { shapWaterfall, selectedUserId, loading, error, dashboardMode } = state;
  const fpFnMode = dashboardMode === 'fn' ? 'fn' : dashboardMode === 'fp' ? 'fp' : state.fpFnMode;
  const isFp = fpFnMode === 'fp';

  useEffect(() => {
    loadShapWaterfall(fpFnMode, selectedUserId ?? undefined);
  }, [fpFnMode, selectedUserId, loadShapWaterfall]);

  useEffect(() => {
    const refresh = () => loadShapWaterfall(fpFnMode, selectedUserId ?? undefined);
    window.addEventListener('bitoguard:localeChanged', refresh);
    return () => window.removeEventListener('bitoguard:localeChanged', refresh);
  }, [fpFnMode, selectedUserId, loadShapWaterfall]);

  const title = isFp ? t('fpfn.shapFP') : t('fpfn.shapFN');

  const insight = (() => {
    if (!shapWaterfall?.features?.length) return '';
    const sorted = [...shapWaterfall.features].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    const top3 = sorted.slice(0, 3).map(f => f.feature_name);
    const posFeats = sorted.filter(f => f.contribution > 0).slice(0, 2).map(f => f.feature_name);
    const negFeats = sorted.filter(f => f.contribution < 0).slice(0, 2).map(f => f.feature_name);
    const joiner = (arr: string[], fallback: string[]) => (arr.length ? arr : fallback).join(', ');
    if (isFp) {
      return t('fpfn.insightFP', {
        positive: joiner(posFeats, top3),
        negative: joiner(negFeats, ['—']),
      });
    }
    return t('fpfn.insightFN', {
      positive: joiner(posFeats, ['—']),
      negative: joiner(negFeats, top3),
    });
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-700 flex-wrap">
        <span className="w-0.5 h-4 bg-sky-500 rounded-full inline-block flex-shrink-0" aria-hidden />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</h3>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">
          {selectedUserId != null ? t('fpfn.perUser', { id: selectedUserId }) : t('fpfn.groupAverage')}
        </span>
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
        {loading.shapWaterfall ? (
          <div className="flex items-center justify-center h-20"><Spinner /></div>
        ) : error.shapWaterfall ? (
          <p className="text-xs text-red-400 text-center py-4">{error.shapWaterfall}</p>
        ) : shapWaterfall ? (
          <ShapWaterfall features={shapWaterfall.features} baseValue={shapWaterfall.base_value} />
        ) : null}
      </div>

      <div className="bg-slate-800/40 ring-1 ring-slate-700/50 rounded-lg p-2.5">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">💡 {t('fpfn.insight')}</p>
        <p className="text-xs text-slate-300 leading-relaxed">{insight}</p>
      </div>

      <LLM_Model />
    </div>
  );
}
