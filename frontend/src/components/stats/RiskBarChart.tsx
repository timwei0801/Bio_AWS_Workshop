import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { StatsResponse } from '../../types/index';
import { RISK_THRESHOLD } from '../../constants/risk';

interface RiskBarChartProps {
  data: StatsResponse['risk_distribution'];
}

const RISK_LEVELS = [
  { i18nKey: 'risk.tier.low',      color: '#10b981' },
  { i18nKey: 'risk.tier.midlow',   color: '#84cc16' },
  { i18nKey: 'risk.tier.mid',      color: '#f59e0b' },
  { i18nKey: 'risk.tier.high',     color: '#f97316' },
  { i18nKey: 'risk.tier.critical', color: '#ef4444' },
];

export function RiskBarChart({ data }: RiskBarChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((item, i) => ({
    ...item,
    shortRange: item.range,
    levelLabel: t(RISK_LEVELS[i]?.i18nKey ?? ''),
  }));

  const criticalLabel = t('risk.tier.critical');

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <span className="w-0.5 h-3.5 bg-sky-500 rounded-full inline-block" />
        {t('overview.riskDist.title')}
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 18, right: 4, bottom: 4, left: -8 }}>
          <XAxis
            dataKey="levelLabel"
            tick={{ fontSize: 11, fill: '#cbd5e1' }}
            interval={0}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(100, 116, 139, 0.15)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as typeof chartData[0];
              const isFraud = d.levelLabel === criticalLabel;
              return (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl">
                  <div className="font-semibold text-white mb-1">{d.levelLabel}</div>
                  <div className="text-slate-400 mb-1">{d.shortRange}</div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">{t('overview.fairness.samples')}</span>
                    <span className="text-white font-semibold">{d.count.toLocaleString()}</span>
                  </div>
                  {isFraud && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-red-400 text-[10px]">
                      {t('overview.riskDist.fraudCut', { value: RISK_THRESHOLD.FRAUD })}
                    </div>
                  )}
                </div>
              );
            }}
          />
          <ReferenceLine
            x={criticalLabel}
            stroke="#ef4444"
            strokeDasharray="4 3"
            strokeOpacity={0.5}
            label={{ value: t('overview.riskDist.thresholdLabel', { value: RISK_THRESHOLD.FRAUD }), position: 'insideTopRight', fontSize: 9, fill: '#ef4444', dy: -14 }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 9, fill: '#94a3b8' }}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={RISK_LEVELS[index]?.color ?? '#64748b'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
        {RISK_LEVELS.map((item, i) => (
          <div key={item.i18nKey} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} aria-hidden />
            <span className="text-[10px] text-slate-400">
              {t(item.i18nKey)} {data[i]?.range ?? ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
