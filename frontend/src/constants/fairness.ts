/**
 * Fairness audit results.
 *
 * Numbers are derived from the model's holdout-set predictions
 * grouped by protected attributes; the raw computation lives in
 * `notebooks/fairness_audit.ipynb` and is summarised here for the
 * dashboard. Samples count reflects the holdout split, not full
 * training data. Source: model run 2026-04-18 (commit hash in
 * project_fairness_audit_results.md).
 */
export const FAIRNESS_SOURCE = {
  notebook: 'notebooks/fairness_audit.ipynb',
  runDate:  '2026-04-18',
  split:    'holdout',
};


export type FairnessStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface FairnessCheck {
  id: string;
  /** i18n key for the attribute name (e.g. fairness.attr.gender) */
  attributeKey: string;
  status: FairnessStatus;
  /** Disparate Impact ratio (min/max group FPR). 1.0 = perfect parity. */
  disparateImpact: number;
  /** Groups with their FPR. */
  groups: { key: string; labelKey: string; fpr: number; fnr: number; count: number }[];
  /** Short summary i18n key. */
  summaryKey: string;
}

export const FAIRNESS_CHECKS: FairnessCheck[] = [
  {
    id: 'gender',
    attributeKey: 'fairness.attr.gender',
    status: 'FAIL',
    disparateImpact: 0.71,
    groups: [
      { key: 'female', labelKey: 'fairness.group.female', fpr: 0.078, fnr: 0.512, count: 23104 },
      { key: 'male',   labelKey: 'fairness.group.male',   fpr: 0.110, fnr: 0.464, count: 27913 },
    ],
    summaryKey: 'fairness.summary.gender',
  },
  {
    id: 'age',
    attributeKey: 'fairness.attr.age',
    status: 'FAIL',
    disparateImpact: 0.62,
    groups: [
      { key: 'under30',  labelKey: 'fairness.group.under30', fpr: 0.148, fnr: 0.421, count: 18650 },
      { key: 'age30_50', labelKey: 'fairness.group.age30_50', fpr: 0.092, fnr: 0.488, count: 22480 },
      { key: 'over50',   labelKey: 'fairness.group.over50',   fpr: 0.091, fnr: 0.544, count: 9887 },
    ],
    summaryKey: 'fairness.summary.age',
  },
  {
    id: 'career',
    attributeKey: 'fairness.attr.career',
    status: 'WARNING',
    disparateImpact: 0.84,
    groups: [
      { key: 'low_risk',  labelKey: 'fairness.group.career_low',  fpr: 0.095, fnr: 0.476, count: 38240 },
      { key: 'high_risk', labelKey: 'fairness.group.career_high', fpr: 0.113, fnr: 0.431, count: 12777 },
    ],
    summaryKey: 'fairness.summary.career',
  },
  {
    id: 'income',
    attributeKey: 'fairness.attr.income',
    status: 'PASS',
    disparateImpact: 0.92,
    groups: [
      { key: 'low',    labelKey: 'fairness.group.income_low',    fpr: 0.097, fnr: 0.472, count: 21050 },
      { key: 'medium', labelKey: 'fairness.group.income_medium', fpr: 0.094, fnr: 0.489, count: 22410 },
      { key: 'high',   labelKey: 'fairness.group.income_high',   fpr: 0.103, fnr: 0.458, count: 7557 },
    ],
    summaryKey: 'fairness.summary.income',
  },
];

export const FAIRNESS_STATUS_STYLE: Record<FairnessStatus, { chip: string; dot: string; text: string }> = {
  PASS:    { chip: 'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/50', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  WARNING: { chip: 'bg-amber-900/60 text-amber-300 ring-1 ring-amber-500/50',       dot: 'bg-amber-400',   text: 'text-amber-400'   },
  FAIL:    { chip: 'bg-red-900/60 text-red-300 ring-1 ring-red-500/50',             dot: 'bg-red-400',     text: 'text-red-400'     },
};
