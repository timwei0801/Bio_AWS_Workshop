import { describe, it, expect } from 'vitest';
import { classifyRisk, RISK_TIERS, RISK_THRESHOLD } from '../constants/risk';

describe('classifyRisk', () => {
  it('returns critical tier at and above FRAUD threshold', () => {
    expect(classifyRisk(RISK_THRESHOLD.FRAUD).id).toBe('critical');
    expect(classifyRisk(0.95).id).toBe('critical');
    expect(classifyRisk(1.0).id).toBe('critical');
  });

  it('returns high tier between HIGH and FRAUD thresholds', () => {
    expect(classifyRisk(RISK_THRESHOLD.HIGH).id).toBe('high');
    expect(classifyRisk(0.80).id).toBe('high');
    expect(classifyRisk(RISK_THRESHOLD.FRAUD - 0.001).id).toBe('high');
  });

  it('returns mid tier between MID and HIGH thresholds', () => {
    expect(classifyRisk(RISK_THRESHOLD.MID).id).toBe('mid');
    expect(classifyRisk(0.60).id).toBe('mid');
  });

  it('returns midlow tier between LOW and MID thresholds', () => {
    expect(classifyRisk(RISK_THRESHOLD.LOW).id).toBe('midlow');
    expect(classifyRisk(0.30).id).toBe('midlow');
  });

  it('returns low tier below LOW threshold', () => {
    expect(classifyRisk(0).id).toBe('low');
    expect(classifyRisk(0.1).id).toBe('low');
  });

  it('tiers are ordered from highest to lowest minScore', () => {
    for (let i = 1; i < RISK_TIERS.length; i++) {
      expect(RISK_TIERS[i].minScore).toBeLessThanOrEqual(RISK_TIERS[i - 1].minScore);
    }
  });

  it('each tier exposes chip + text class names', () => {
    for (const t of RISK_TIERS) {
      expect(t.chipClass.length).toBeGreaterThan(0);
      expect(t.textClass.length).toBeGreaterThan(0);
    }
  });
});
