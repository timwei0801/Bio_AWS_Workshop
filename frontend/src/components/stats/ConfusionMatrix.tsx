import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getConfusionMatrix } from '../../utils/graphDataStore';
import type { ConfusionMatrixData } from '../../utils/graphDataStore';
import { Skeleton } from '../common/Skeleton';

function pct(v: number) { return `${(v * 100).toFixed(1)}%`; }
function fmt(v: number) { return v.toLocaleString(); }

export function ConfusionMatrix() {
  const { t } = useTranslation();
  const [data, setData] = useState<ConfusionMatrixData | null>(null);

  useEffect(() => { getConfusionMatrix().then(setData); }, []);

  if (!data) {
    return (
      <div className="space-y-3">
        <Skeleton className="w-32" />
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" className="h-16" />)}
        </div>
        <Skeleton variant="list" rows={3} />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="w-0.5 h-3.5 bg-purple-500 rounded-full inline-block" />
        {t('overview.confusion.title')}
        <span className="ml-auto text-[10px] text-slate-500 normal-case tracking-normal">
          {t('overview.confusion.thresholdAt', { value: data.threshold })}
        </span>
      </h3>

      <div className="mb-3">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-[10px] text-center mb-1">
          <div />
          <div className="text-red-400 font-semibold py-0.5">{t('overview.confusion.predFraud')}</div>
          <div className="text-emerald-400 font-semibold py-0.5">{t('overview.confusion.predNormal')}</div>
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-1 mb-1">
          <div className="flex items-center justify-end pr-1.5 text-[10px] text-red-400 font-semibold whitespace-nowrap">
            {t('overview.confusion.actualFraud')}
          </div>
          <div className="bg-emerald-500/15 ring-1 ring-emerald-500/40 rounded-lg p-2 text-center">
            <div className="text-xs text-emerald-400 font-bold mb-0.5">{t('overview.confusion.tp.tag')}</div>
            <div className="text-base font-bold text-white">{fmt(data.tp)}</div>
            <div className="text-[10px] text-emerald-400/70">{t('overview.confusion.tp.caption')}</div>
          </div>
          <div className="bg-orange-500/10 ring-1 ring-orange-500/30 rounded-lg p-2 text-center">
            <div className="text-xs text-orange-400 font-bold mb-0.5">{t('overview.confusion.fn.tag')}</div>
            <div className="text-base font-bold text-white">{fmt(data.fn)}</div>
            <div className="text-[10px] text-orange-400/70">{t('overview.confusion.fn.caption')}</div>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-1">
          <div className="flex items-center justify-end pr-1.5 text-[10px] text-emerald-400 font-semibold whitespace-nowrap">
            {t('overview.confusion.actualNormal')}
          </div>
          <div className="bg-red-500/10 ring-1 ring-red-500/30 rounded-lg p-2 text-center">
            <div className="text-xs text-red-400 font-bold mb-0.5">{t('overview.confusion.fp.tag')}</div>
            <div className="text-base font-bold text-white">{fmt(data.fp)}</div>
            <div className="text-[10px] text-red-400/70">{t('overview.confusion.fp.caption')}</div>
          </div>
          <div className="bg-slate-700/30 ring-1 ring-slate-600/40 rounded-lg p-2 text-center">
            <div className="text-xs text-slate-400 font-bold mb-0.5">{t('overview.confusion.tn.tag')}</div>
            <div className="text-base font-bold text-white">{fmt(data.tn)}</div>
            <div className="text-[10px] text-slate-400/70">{t('overview.confusion.tn.caption')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {[
          { labelKey: 'overview.kpi.accuracy.label',    value: pct(data.accuracy),    color: 'text-sky-400' },
          { labelKey: 'overview.kpi.precision.label',   value: pct(data.precision),   color: 'text-violet-400' },
          { labelKey: 'overview.kpi.recall.label',      value: pct(data.recall),      color: 'text-emerald-400' },
          { labelKey: 'overview.kpi.f1.label',          value: pct(data.f1Weighted),  color: 'text-amber-400' },
          { labelKey: 'overview.kpi.specificity.label', value: pct(data.specificity), color: 'text-cyan-400' },
        ].map(m => (
          <div key={m.labelKey} className="bg-slate-900/50 rounded-md px-2 py-1.5 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">{t(m.labelKey)}</span>
            <span className={`text-xs font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
