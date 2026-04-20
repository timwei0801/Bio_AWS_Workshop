import { useTranslation } from 'react-i18next';
import type { StatsResponse } from '../../types/index';

interface RelationStatsProps {
  counts: StatsResponse['relation_counts'];
}

export function RelationStats({ counts }: RelationStatsProps) {
  const { t } = useTranslation();

  const relations = [
    { key: 'R1', labelKey: 'relation.r1', value: counts.r1, dotColor: 'bg-sky-500',     barColor: 'bg-sky-500/30',     textColor: 'text-sky-300' },
    { key: 'R2', labelKey: 'relation.r2', value: counts.r2, dotColor: 'bg-amber-500',   barColor: 'bg-amber-500/30',   textColor: 'text-amber-300' },
    { key: 'R3', labelKey: 'relation.r3', value: counts.r3, dotColor: 'bg-emerald-500', barColor: 'bg-emerald-500/30', textColor: 'text-emerald-300' },
  ];

  const maxVal = Math.max(...relations.map(r => r.value), 1);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="w-0.5 h-3.5 bg-sky-500 rounded-full inline-block" />
        {t('risk.relationStats')}
      </h3>
      <div className="space-y-2 text-sm">
        {relations.map((rel) => (
          <div key={rel.key} className="relative overflow-hidden bg-slate-700/30 rounded-md p-2.5">
            <div
              className={`absolute inset-y-0 left-0 rounded-md transition-all ${rel.barColor}`}
              style={{ width: `${(rel.value / maxVal) * 100}%` }}
              aria-hidden
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-slate-800 ${rel.dotColor}`} aria-hidden />
                <div>
                  <span className={`font-semibold text-xs ${rel.textColor}`}>{rel.key}</span>
                  <span className="text-slate-400 text-xs ml-1">{t(rel.labelKey)}</span>
                </div>
              </div>
              <span className="font-semibold text-slate-100 text-sm">{rel.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
