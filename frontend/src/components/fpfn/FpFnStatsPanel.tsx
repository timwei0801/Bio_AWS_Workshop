import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';

export function FpFnStatsPanel() {
  const { t } = useTranslation();
  const { state } = useDashboard();
  const isFp = state.dashboardMode === 'fp' || state.fpFnMode === 'fp';
  const nodes = isFp ? state.fpNodes : state.fnNodes;
  const count = nodes.length;

  const titleKey = isFp ? 'fpfn.fp.title'    : 'fpfn.fn.title';
  const descKey  = isFp ? 'fpfn.fp.subtitle' : 'fpfn.fn.subtitle';
  const accent   = isFp
    ? 'bg-amber-500/10 ring-amber-500/30 text-amber-300'
    : 'bg-emerald-500/10 ring-emerald-500/30 text-emerald-300';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
        <span className="w-1 h-5 rounded-full bg-slate-500" aria-hidden />
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          {t('fpfn.title')}
        </h2>
      </div>

      <div className={`rounded-lg ring-1 p-4 text-center ${accent}`}>
        <p className="text-3xl font-bold text-white">{count.toLocaleString()}</p>
        <p className="text-xs font-semibold uppercase tracking-wider mt-1">{t(titleKey)}</p>
        <p className="text-[11px] opacity-80 mt-0.5">{t(descKey)}</p>
      </div>

      <div className="bg-slate-900/40 ring-1 ring-slate-700/50 rounded-lg p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
          {isFp ? 'FP' : 'FN'} · {t('detail.riskScore')}
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isFp
            ? t('fpfn.fp.subtitle')
            : t('fpfn.fn.subtitle')}
        </p>
      </div>
    </div>
  );
}
