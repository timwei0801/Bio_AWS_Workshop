/**
 * Central place for all risk / threshold / model constants.
 * Tweak here — the rest of the app reads from these.
 */

export const RISK_THRESHOLD = {
  FRAUD:     0.9784,   // Model decision threshold (PR-optimal) with LOO toxicity.
  EXTREME:   0.99,     // Ranking cutoff for "極高" tier.
  HIGH:      0.90,
  MID_HIGH:  0.80,
  MID:       0.60,
  LOW:       0.30,
} as const;

export const SHAP_BASE_VALUE = -3.20;  // E[f(x)] on the new LOO-enabled model

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
// Source: final ensemble evaluation on test set (2026-04-21), with LOO
// Toxicity features ported from the BitoGuard 1st-place repo.
// 10,204 test rows, 328 positives.
export const MODEL_METRICS = [
  { key: 'auc_roc', value: '0.9778', color: 'sky'     as const },
  { key: 'auc_pr',  value: '0.8600', color: 'violet'  as const },
  { key: 'recall',  value: '0.7470', color: 'emerald' as const },
  { key: 'f1',      value: '0.8277', color: 'amber'   as const },
];
