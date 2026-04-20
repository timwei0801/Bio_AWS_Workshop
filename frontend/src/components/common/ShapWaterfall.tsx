import type { ShapWaterfallFeature, ShapFeature } from '../../types/index';
import { useTranslation } from 'react-i18next';

type AnyFeature = ShapWaterfallFeature | ShapFeature;

function hasValue(f: AnyFeature): f is ShapWaterfallFeature {
  return typeof (f as ShapWaterfallFeature).feature_value === 'string';
}

interface ShapWaterfallProps {
  features: AnyFeature[];
  baseValue: number;
  /** Cap number of rows (default 10). */
  maxRows?: number;
  /** Show f(x) and E[f(x)] tick labels. */
  showEndpoints?: boolean;
  /** Whether to sort by |contribution| descending (default true). */
  sort?: boolean;
}

export function ShapWaterfall({
  features,
  baseValue,
  maxRows = 10,
  showEndpoints = true,
  sort = true,
}: ShapWaterfallProps) {
  const { t } = useTranslation();

  const sorted = (sort ? [...features].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)) : [...features])
    .slice(0, maxRows);

  if (sorted.length === 0) return null;

  const finalValue = baseValue + sorted.reduce((s, f) => s + f.contribution, 0);
  let running = finalValue;
  const rows = sorted.map(f => {
    const end = running;
    const start = running - f.contribution;
    running = start;
    return { feature: f, start, end };
  });

  const allX = [baseValue, finalValue, ...rows.flatMap(r => [r.start, r.end])];
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const xPad = (xMax - xMin) * 0.15;
  const xLo = xMin - xPad;
  const xHi = xMax + xPad;

  const ROW_H   = 26;
  const BAR_H   = 14;
  const LABEL_W = 200;
  const TOTAL_W = 600;
  const BAR_AREA = TOTAL_W - LABEL_W - 6;
  const PAD_T = showEndpoints ? 28 : 8;
  const PAD_B = showEndpoints ? 28 : 8;
  const TOTAL_H = rows.length * ROW_H + PAD_T + PAD_B;

  const toX = (v: number) => LABEL_W + ((v - xLo) / (xHi - xLo)) * BAR_AREA;

  return (
    <svg viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`} width="100%" style={{ display: 'block' }} role="img">
      {showEndpoints && (
        <>
          <text x={toX(finalValue)} y={PAD_T - 14} textAnchor="middle" fontSize="9" fill="#64748b">
            {t('common.predValue')}
          </text>
          <text x={toX(finalValue)} y={PAD_T - 4} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#94a3b8" fontWeight="bold">
            {t('common.predValueLabel', { value: finalValue.toFixed(3) })}
          </text>
          <line x1={toX(finalValue)} y1={PAD_T} x2={toX(finalValue)} y2={PAD_T + 4} stroke="#64748b" strokeWidth="1" />
        </>
      )}

      {rows.map((row, i) => {
        const y      = PAD_T + i * ROW_H + ROW_H / 2;
        const isPos  = row.feature.contribution >= 0;
        const x1     = toX(Math.min(row.start, row.end));
        const x2     = toX(Math.max(row.start, row.end));
        const barW   = Math.max(x2 - x1, 2);
        const fill   = isPos ? '#ef4444' : '#3b82f6';
        const fillBg = isPos ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)';
        const txtClr = isPos ? '#fca5a5' : '#93c5fd';
        const valTxt = (isPos ? '+' : '') + row.feature.contribution.toFixed(2);
        const connX  = toX(row.start);

        return (
          <g key={i}>
            {i < rows.length - 1 && (
              <line x1={connX} y1={y + BAR_H / 2} x2={connX} y2={y + ROW_H - BAR_H / 2} stroke="#475569" strokeWidth="1" strokeDasharray="3,2" />
            )}
            {showEndpoints && i === rows.length - 1 && (
              <line x1={connX} y1={y + BAR_H / 2} x2={connX} y2={TOTAL_H - PAD_B + 3} stroke="#475569" strokeWidth="1" strokeDasharray="3,2" />
            )}

            <text x={4} y={y + 4} textAnchor="start" fontSize="10" fill="#e2e8f0">
              {row.feature.feature_name}
            </text>

            {hasValue(row.feature) && (
              <text x={LABEL_W - 6} y={y + 4} textAnchor="end" fontSize="9" fontFamily="monospace" fill="#64748b">
                {row.feature.feature_value}
              </text>
            )}

            <rect x={x1} y={y - BAR_H / 2} width={barW} height={BAR_H} rx={3} fill={fillBg} />
            <rect x={x1} y={y - BAR_H / 2} width={barW} height={BAR_H} rx={3} fill={fill} opacity={0.82} />

            <text
              x={isPos ? x2 + 4 : x1 - 4}
              y={y + 4}
              textAnchor={isPos ? 'start' : 'end'}
              fontSize="10" fontFamily="monospace" fontWeight="bold" fill={txtClr}
            >
              {valTxt}
            </text>
          </g>
        );
      })}

      {showEndpoints && (
        <>
          <text x={toX(baseValue)} y={TOTAL_H - PAD_B + 12} textAnchor="middle" fontSize="9" fill="#64748b">
            {t('common.baseValue')}
          </text>
          <text x={toX(baseValue)} y={TOTAL_H - PAD_B + 23} textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#94a3b8" fontWeight="bold">
            {t('common.baseValueLabel', { value: baseValue.toFixed(3) })}
          </text>
          <line x1={toX(baseValue)} y1={TOTAL_H - PAD_B - 3} x2={toX(baseValue)} y2={TOTAL_H - PAD_B + 3} stroke="#64748b" strokeWidth="1" />
        </>
      )}
    </svg>
  );
}
