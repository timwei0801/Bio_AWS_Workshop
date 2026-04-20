import { useTranslation } from 'react-i18next';
import { FAIRNESS_CHECKS, FAIRNESS_STATUS_STYLE } from '../../constants/fairness';
import type { FairnessCheck } from '../../constants/fairness';

export function FairnessDashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-1 h-5 bg-amber-400 rounded-full" />
            {t('overview.fairness.title')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t('overview.fairness.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {FAIRNESS_CHECKS.map(check => (
          <FairnessCard key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

function FairnessCard({ check }: { check: FairnessCheck }) {
  const { t } = useTranslation();
  const style = FAIRNESS_STATUS_STYLE[check.status];

  // Color bar: DI ratio filled; red if < 0.8, amber 0.8-0.9, emerald >= 0.9
  const barPct = Math.min(100, Math.round(check.disparateImpact * 100));
  const barColor = check.disparateImpact >= 0.9
    ? 'bg-emerald-500'
    : check.disparateImpact >= 0.8
      ? 'bg-amber-400'
      : 'bg-red-500';

  return (
    <div className="bg-slate-900/50 ring-1 ring-slate-700/60 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`} aria-hidden />
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-100">
          {t(check.attributeKey)}
        </h4>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${style.chip}`}>
          {check.status === 'PASS' ? t('overview.fairness.pass')
            : check.status === 'WARNING' ? t('overview.fairness.warn')
            : t('overview.fairness.fail')}
        </span>
      </div>

      <div>
        <div className="flex items-baseline justify-between text-[10px] text-slate-400 mb-1">
          <span>{t('overview.fairness.diRatio')}</span>
          <span className={`font-mono font-semibold ${style.text}`}>{check.disparateImpact.toFixed(2)}</span>
        </div>
        <div className="relative h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-[80%] ring-r border-r border-dashed border-amber-400/60"
            aria-hidden
          />
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${barPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-2.5 gap-y-1 text-[10px]">
        <span className="text-slate-500 uppercase tracking-wide">&nbsp;</span>
        <span className="text-slate-500 uppercase tracking-wide text-right">{t('overview.fairness.fpr')}</span>
        <span className="text-slate-500 uppercase tracking-wide text-right">{t('overview.fairness.fnr')}</span>
        {check.groups.map(g => (
          <div key={g.key} className="contents">
            <span className="text-slate-300">{t(g.labelKey)}</span>
            <span className="font-mono text-red-300 text-right">{(g.fpr * 100).toFixed(1)}%</span>
            <span className="font-mono text-orange-300 text-right">{(g.fnr * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-700/50">
        {t(check.summaryKey)}
      </p>
    </div>
  );
}
