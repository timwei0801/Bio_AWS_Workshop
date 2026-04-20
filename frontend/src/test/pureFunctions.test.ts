import { describe, it, expect } from 'vitest';
import { getNodeColor, getLinkDash } from '../components/graph/GraphViewer';

import { getFilteredNodes } from '../components/graph/NodeSelector';
import type { SubgraphNode, SubgraphEdge, FraudNode } from '../types/index';

// ── getNodeColor ──────────────────────────────────────────────────────────────

describe('getNodeColor', () => {
  it('returns violet for wallet nodes', () => {
    const node: SubgraphNode = { user_id: 0, risk_score: 0.1, status: 0, node_type: 'wallet' };
    expect(getNodeColor(node)).toBe('#8b5cf6');
  });

  it('returns red for fraud users (status=1)', () => {
    const node: SubgraphNode = { user_id: 1, risk_score: 0.9, status: 1 };
    expect(getNodeColor(node)).toBe('#ef4444');
  });

  it('returns red for status=1 even when risk_score < 0.5', () => {
    const node: SubgraphNode = { user_id: 2, risk_score: 0.1, status: 1 };
    expect(getNodeColor(node)).toBe('#ef4444');
  });

  it('returns orange for high-risk non-fraud users (status=0, risk >= 0.5)', () => {
    const node: SubgraphNode = { user_id: 3, risk_score: 0.5, status: 0 };
    expect(getNodeColor(node)).toBe('#f97316');
  });

  it('returns indigo for normal users below 0.5', () => {
    const node: SubgraphNode = { user_id: 5, risk_score: 0.49, status: 0 };
    expect(getNodeColor(node)).toBe('#4f46e5');
  });

  it('returns indigo for zero-risk users', () => {
    const node: SubgraphNode = { user_id: 6, risk_score: 0, status: 0 };
    expect(getNodeColor(node)).toBe('#4f46e5');
  });
});

// ── getLinkDash (3D graph does not use dashes) ────────────────────────────────

describe('getLinkDash', () => {
  it('returns null for every relation type (3D graph ignores dashes)', () => {
    for (const r of ['R1', 'R2', 'R3'] as const) {
      const edge: SubgraphEdge = { source: 1, target: 2, relation_type: r };
      expect(getLinkDash(edge)).toBeNull();
    }
  });
});

// ── getFilteredNodes ──────────────────────────────────────────────────────────

describe('getFilteredNodes', () => {
  const nodes: FraudNode[] = [
    { user_id: 1042, risk_score: 0.987 },
    { user_id: 1187, risk_score: 0.5 },
    { user_id: 2001, risk_score: 0.39 },  // below 0.4 threshold — excluded
    { user_id: 3000, risk_score: 0.8 },
  ];

  it('filters out nodes with risk_score < 0.4', () => {
    const result = getFilteredNodes(nodes, '');
    expect(result.find(n => n.user_id === 2001)).toBeUndefined();
  });

  it('includes nodes with risk_score >= 0.4', () => {
    const result = getFilteredNodes(nodes, '');
    expect(result.map(n => n.user_id)).toContain(1042);
    expect(result.map(n => n.user_id)).toContain(1187);
    expect(result.map(n => n.user_id)).toContain(3000);
  });

  it('filters by keyword matching user_id', () => {
    const result = getFilteredNodes(nodes, '104');
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe(1042);
  });

  it('returns empty array when no nodes match keyword', () => {
    const result = getFilteredNodes(nodes, '9999');
    expect(result).toHaveLength(0);
  });

  it('trims whitespace from keyword', () => {
    const result = getFilteredNodes(nodes, '  1042  ');
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe(1042);
  });

  it('returns all qualifying nodes when keyword is empty', () => {
    const result = getFilteredNodes(nodes, '');
    expect(result).toHaveLength(3);
  });
});
