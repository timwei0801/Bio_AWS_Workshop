import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../common/GlassCard';
import { ShapWaterfall } from '../common/ShapWaterfall';
import { Skeleton } from '../common/Skeleton';
import { RiskBadge } from '../common/RiskBadge';
import { useDashboard } from '../../context/DashboardContext';
import { getShapForUser } from '../../utils/graphDataStore';
import { SHAP_BASE_VALUE } from '../../constants/risk';
import type { ShapWaterfallResponse } from '../../types/index';

interface UserPickerProps {
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder: string;
  options: { user_id: number; risk_score: number }[];
}

function UserPicker({ value, onChange, placeholder, options }: UserPickerProps) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options.slice(0, 80);
    return options.filter(n => String(n.user_id).includes(q)).slice(0, 80);
  }, [query, options]);

  return (
    <div>
      <input
        type="text"
        value={value != null ? String(value) : query}
        onChange={e => { setQuery(e.target.value); onChange(null); }}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm placeholder-slate-500 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-2"
      />
      <div className="max-h-40 overflow-y-auto ring-1 ring-slate-700 rounded-lg">
        <ul className="divide-y divide-slate-700/40">
          {filtered.map(n => {
            const selected = n.user_id === value;
            return (
              <li key={n.user_id}>
                <button
                  onClick={() => { onChange(n.user_id); setQuery(''); }}
                  aria-pressed={selected}
                  className={`w-full text-left px-3 py-1.5 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500 transition-colors
                    ${selected ? 'bg-indigo-500/25 border-l-2 border-indigo-400' : 'border-l-2 border-transparent hover:bg-slate-700/40'}`}
                >
                  <span className="text-sky-400 font-semibold">ID: {n.user_id}</span>
                  <span className="text-slate-500 ml-2">{n.risk_score.toFixed(3)}</span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <li className="px-3 py-4 text-xs text-slate-500 text-center">—</li>}
        </ul>
      </div>
    </div>
  );
}

export function CompareUsersPage() {
  const { t } = useTranslation();
  const { state } = useDashboard();

  const [leftId, setLeftId] = useState<number | null>(null);
  const [rightId, setRightId] = useState<number | null>(null);
  const [leftShap, setLeftShap] = useState<ShapWaterfallResponse | null>(null);
  const [rightShap, setRightShap] = useState<ShapWaterfallResponse | null>(null);
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

  useEffect(() => {
    if (leftId == null) { setLeftShap(null); return; }
    setLeftLoading(true);
    getShapForUser('fp', leftId).then(setLeftShap).finally(() => setLeftLoading(false));
  }, [leftId]);

  useEffect(() => {
    if (rightId == null) { setRightShap(null); return; }
    setRightLoading(true);
    getShapForUser('fp', rightId).then(setRightShap).finally(() => setRightLoading(false));
  }, [rightId]);

  const options = useMemo(() => {
    const merged = new Map<number, { user_id: number; risk_score: number }>();
    for (const n of [...state.fraudNodes, ...state.fpNodes, ...state.fnNodes]) {
      if (!merged.has(n.user_id)) merged.set(n.user_id, { user_id: n.user_id, risk_score: n.risk_score });
    }
    return Array.from(merged.values()).sort((a, b) => b.risk_score - a.risk_score);
  }, [state.fraudNodes, state.fpNodes, state.fnNodes]);

  const leftNode  = leftId  != null ? options.find(o => o.user_id === leftId)  : null;
  const rightNode = rightId != null ? options.find(o => o.user_id === rightId) : null;

  // Compute shared-vs-distinct features for narrative below the chart.
  const insight = useMemo(() => {
    if (!leftShap || !rightShap) return null;
    const leftSet  = new Set(leftShap.features.map(f => f.feature_name));
    const rightSet = new Set(rightShap.features.map(f => f.feature_name));
    const shared   = leftShap.features.filter(f => rightSet.has(f.feature_name)).map(f => f.feature_name).slice(0, 5);
    const leftOnly = leftShap.features.filter(f => !rightSet.has(f.feature_name)).map(f => f.feature_name).slice(0, 4);
    const rightOnly= rightShap.features.filter(f => !leftSet.has(f.feature_name)).map(f => f.feature_name).slice(0, 4);
    return { shared, leftOnly, rightOnly };
  }, [leftShap, rightShap]);

  return (
    <main className="flex-1 overflow-y-auto min-w-0 min-h-0 animate-fade-in">
      <div className="flex flex-col gap-4">
        <GlassCard padding="lg" tone="violet">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-2xl flex-shrink-0" aria-hidden>⚖️</div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-base font-bold text-violet-300 mb-1">{t('compare.title')}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{t('compare.subtitle')}</p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('compare.leftLabel')}</h3>
              {leftNode && <RiskBadge score={leftNode.risk_score} showPercent />}
            </div>
            <UserPicker value={leftId} onChange={setLeftId} placeholder={t('compare.pickPlaceholder')} options={options} />
            <div className="mt-3 bg-slate-900/40 rounded-lg px-2 py-1.5 ring-1 ring-slate-700/40 min-h-[120px]">
              {leftLoading ? <Skeleton variant="list" rows={6} />
                : leftShap ? <ShapWaterfall features={leftShap.features} baseValue={leftShap.base_value ?? SHAP_BASE_VALUE} sort={false} />
                : <p className="text-xs text-slate-500 text-center py-6">{t('compare.pickPrompt')}</p>}
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{t('compare.rightLabel')}</h3>
              {rightNode && <RiskBadge score={rightNode.risk_score} showPercent />}
            </div>
            <UserPicker value={rightId} onChange={setRightId} placeholder={t('compare.pickPlaceholder')} options={options} />
            <div className="mt-3 bg-slate-900/40 rounded-lg px-2 py-1.5 ring-1 ring-slate-700/40 min-h-[120px]">
              {rightLoading ? <Skeleton variant="list" rows={6} />
                : rightShap ? <ShapWaterfall features={rightShap.features} baseValue={rightShap.base_value ?? SHAP_BASE_VALUE} sort={false} />
                : <p className="text-xs text-slate-500 text-center py-6">{t('compare.pickPrompt')}</p>}
            </div>
          </GlassCard>
        </div>

        {insight && (
          <GlassCard padding="md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-violet-400 rounded-full" aria-hidden />
              {t('compare.insightTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/40 rounded-lg p-3 ring-1 ring-slate-700/40">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold mb-1.5">{t('compare.sharedFeatures')}</p>
                <p className="text-slate-300 leading-relaxed break-words">{insight.shared.length ? insight.shared.join(', ') : '—'}</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3 ring-1 ring-slate-700/40">
                <p className="text-[10px] uppercase tracking-wider text-sky-300 font-semibold mb-1.5">{t('compare.leftOnly')}</p>
                <p className="text-slate-300 leading-relaxed break-words">{insight.leftOnly.length ? insight.leftOnly.join(', ') : '—'}</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3 ring-1 ring-slate-700/40">
                <p className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-1.5">{t('compare.rightOnly')}</p>
                <p className="text-slate-300 leading-relaxed break-words">{insight.rightOnly.length ? insight.rightOnly.join(', ') : '—'}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </main>
  );
}
