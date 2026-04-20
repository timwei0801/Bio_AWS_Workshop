/**
 * Central place for all risk / threshold / model constants.
 * Tweak here — the rest of the app reads from these.
 */

export const RISK_THRESHOLD = {
  FRAUD:     0.8415,   // Model decision threshold (precision-recall optimal).
  EXTREME:   0.8743,   // Ranking cutoff for "極高" tier.
  HIGH:      0.70,
  MID_HIGH:  0.65,
  MID:       0.45,
  LOW:       0.20,
} as const;

export const SHAP_BASE_VALUE = -2.885;

export interface RiskTier {
  id: 'critical' | 'high' | 'mid' | 'midlow' | 'low';
  /** i18n key for the tier label. */
  labelKey: string;
  color: string;
  chipClass: string;   // tailwind classes for pill/badge
  textClass: string;   // tailwind classes for just text
  minScore: number;    // inclusive
}

export const RISK_TIERS: RiskTier[] = [
  {
    id: 'critical',
    labelKey: 'risk.tier.critical',
    color: '#ef4444',
    chipClass: 'bg-red-900/60 text-red-300 ring-1 ring-red-500/50',
    textClass: 'text-red-400',
    minScore: RISK_THRESHOLD.FRAUD,
  },
  {
    id: 'high',
    labelKey: 'risk.tier.high',
    color: '#f97316',
    chipClass: 'bg-orange-900/60 text-orange-300 ring-1 ring-orange-500/50',
    textClass: 'text-orange-400',
    minScore: RISK_THRESHOLD.HIGH,
  },
  {
    id: 'mid',
    labelKey: 'risk.tier.mid',
    color: '#f59e0b',
    chipClass: 'bg-yellow-900/60 text-yellow-300 ring-1 ring-yellow-500/50',
    textClass: 'text-yellow-400',
    minScore: RISK_THRESHOLD.MID,
  },
  {
    id: 'midlow',
    labelKey: 'risk.tier.midlow',
    color: '#84cc16',
    chipClass: 'bg-sky-900/60 text-sky-300 ring-1 ring-sky-500/50',
    textClass: 'text-sky-400',
    minScore: RISK_THRESHOLD.LOW,
  },
  {
    id: 'low',
    labelKey: 'risk.tier.low',
    color: '#10b981',
    chipClass: 'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50',
    textClass: 'text-emerald-400',
    minScore: 0,
  },
];

/** Classify a risk score into a tier. Returns `RISK_TIERS[0]` as fallback. */
export function classifyRisk(score: number): RiskTier {
  return RISK_TIERS.find(t => score >= t.minScore) ?? RISK_TIERS[RISK_TIERS.length - 1];
}

// ── Model metrics (reported) ────────────────────────────────────────────────
// Source: final ensemble evaluation on holdout set.
export const MODEL_METRICS = [
  { key: 'auc_roc', value: '0.8612', color: 'sky'     as const },
  { key: 'auc_pr',  value: '0.3071', color: 'violet'  as const },
  { key: 'recall',  value: '0.4634', color: 'emerald' as const },
  { key: 'f1',      value: '0.3572', color: 'amber'   as const },
];
