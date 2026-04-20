import { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { getShapTop20AllUsers, getShapTop20Blacklist, getShapTop10FP, getShapTop10FN } from '../../utils/graphDataStore';
import type { ShapTop20Entry } from '../../utils/graphDataStore';

const FEATURE_COLOR: Record<string, string> = {
  swap_sum: '#6366f1', swap_count: '#6366f1',
  tx_interval_median: '#06b6d4', tx_interval_mean: '#06b6d4', tx_interval_min: '#06b6d4', tx_interval_std: '#06b6d4',
  account_age_days: '#3b82f6',
  crypto_wit_sum: '#eab308', crypto_wit_max: '#eab308', crypto_wit_mean: '#eab308', crypto_wit_count: '#eab308',
  crypto_dep_sum: '#f59e0b', crypto_dep_count: '#f59e0b', crypto_dep_mean: '#f59e0b', crypto_dep_max: '#f59e0b',
  twd_dep_sum: '#10b981', twd_dep_count: '#10b981', twd_net_flow: '#10b981',
  ip_night_ratio: '#f97316', ip_unique_count: '#f97316',
  career_freq: '#a855f7',
  weekend_tx_ratio: '#14b8a6',
  reg_hour: '#3b82f6',
  kyc_speed_sec: '#3b82f6',
  is_app_user: '#3b82f6',
  trading_market_order_ratio: '#8b5cf6',
  total_tx_count: '#14b8a6', first_to_last_tx_days: '#14b8a6', velocity_ratio_7d_vs_30d: '#14b8a6', composite_risk_score: '#14b8a6',
  fund_stay_sec: '#06b6d4',
  dep_to_first_wit_hours: '#ef4444', twd_to_crypto_out_ratio: '#ef4444', tx_amount_cv: '#ef4444',
  rapid_kyc_then_trade: '#ef4444', crypto_out_in_ratio: '#ef4444', same_day_in_out_count: '#ef4444',
  if_score: '#f59e0b', hbos_score: '#f59e0b', lof_score: '#f59e0b',
};

const DEFAULT_COLOR = '#64748b';
const barColor = (f: string) => FEATURE_COLOR[f] ?? DEFAULT_COLOR;

function ShapTooltip({ active, payload }: { active?: boolean; payload?: { payload: ShapTop20Entry }[] }) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
      <div className="font-semibold text-white mb-1">#{d.rank} {d.label}</div>
      <div className="text-slate-400 font-mono mb-2">{d.feature}</div>
      <div className="space-y-1">
        <div className="flex justify-between gap-4"><span className="text-slate-400">{t('features.tooltip.meanShap')}</span><span className="text-sky-300 font-semibold">{d.shap.toFixed(4)}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">{t('features.tooltip.percent')}</span><span className="text-purple-300">{d.pct}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">{t('features.tooltip.frequency')}</span><span className="text-emerald-300">{t('features.tooltip.frequencyUnit', { count: d.freq })}</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400">{t('features.tooltip.cumulative')}</span><span className="text-amber-300">{d.cumPct}</span></div>
      </div>
    </div>
  );
}

function ShapBarChart({ data, title, color }: { data: ShapTop20Entry[]; title: string; color: string }) {
  const { t } = useTranslation();
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-slate-500">
        <span className="w-3 h-3 rounded-full animate-pulse mr-2" style={{ background: color }} aria-hidden />
        {t('common.loading')}
      </div>
    );
  }

  const chartData = [...data];

  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-200">{title}</div>
      </div>
      <ResponsiveContainer width="100%" height={520}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 130 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => v.toFixed(3)} axisLine={{ stroke: '#475569' }} tickLine={false} />
          <YAxis type="category" dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={125} />
          <Tooltip content={<ShapTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
          <ReferenceLine x={0} stroke="#475569" />
          <Bar dataKey="shap" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {chartData.map(entry => (<Cell key={entry.feature} fill={barColor(entry.feature)} fillOpacity={0.85} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <span>{t('features.chart.cumulative')}</span>
        <span className="text-slate-300 font-semibold">{data[data.length - 1]?.cumPct ?? '—'}</span>
      </div>
    </div>
  );
}

function CompareChart({ allData, blacklistData }: { allData: ShapTop20Entry[]; blacklistData: ShapTop20Entry[] }) {
  const { t } = useTranslation();
  if (!allData.length || !blacklistData.length) {
    return <div className="text-xs text-slate-500 text-center py-8">{t('common.loading')}</div>;
  }

  const featureSet = new Set([...allData.map(d => d.feature), ...blacklistData.map(d => d.feature)]);
  const allMap = new Map(allData.map(d => [d.feature, d]));
  const blMap  = new Map(blacklistData.map(d => [d.feature, d]));

  const merged = Array.from(featureSet).map(f => {
    const a = allMap.get(f); const b = blMap.get(f);
    return {
      feature: f, label: a?.label ?? b?.label ?? f,
      all: a?.shap ?? 0, blacklist: b?.shap ?? 0,
      diff: (b?.shap ?? 0) - (a?.shap ?? 0),
    };
  }).sort((x, y) => Math.max(y.all, y.blacklist) - Math.max(x.all, x.blacklist));

  const chartData = [...merged];

  return (
    <div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-200">{t('features.chart.compareTitle')}</div>
        <div className="text-xs text-slate-500 mt-0.5">{t('features.chart.compareSub')}</div>
      </div>

      <div className="flex gap-4 mb-3 text-xs flex-wrap">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" aria-hidden />{t('features.chart.legendAll')}</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" aria-hidden />{t('features.chart.legendBlacklist')}</div>
      </div>

      <ResponsiveContainer width="100%" height={620}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 130 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => v.toFixed(3)} axisLine={{ stroke: '#475569' }} tickLine={false} />
          <YAxis type="category" dataKey="label" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={125} />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as typeof merged[0];
              return (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
                  <div className="font-semibold text-white mb-2">{d.label}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between gap-4"><span className="text-sky-400">{t('features.chart.legendAll')}</span><span className="font-mono text-white">{d.all.toFixed(4)}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-red-400">{t('features.chart.legendBlacklist')}</span><span className="font-mono text-white">{d.blacklist.toFixed(4)}</span></div>
                    <div className={`flex justify-between gap-4 border-t border-slate-700 pt-1 ${d.diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      <span>{t('features.tooltip.diff')}</span><span className="font-mono">{d.diff > 0 ? '+' : ''}{d.diff.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="all"       name={t('features.chart.legendAll')}       fill="#38bdf8" fillOpacity={0.75} radius={[0,2,2,0]} maxBarSize={10} />
          <Bar dataKey="blacklist" name={t('features.chart.legendBlacklist')} fill="#f87171" fillOpacity={0.85} radius={[0,2,2,0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type Tab = 'all' | 'blacklist' | 'fp' | 'fn' | 'compare' | 'categories';

interface FeatureCategory {
  icon: string;
  nameKey: string;
  descKey: string;
  accent: string;
  count: number;
}

const FEATURE_CATEGORIES_META: FeatureCategory[] = [
  { icon: '👤', nameKey: 'featureCat.user',       descKey: 'featureCat.userDesc',       accent: 'sky',     count: 15 },
  { icon: '💵', nameKey: 'featureCat.fiat',       descKey: 'featureCat.fiatDesc',       accent: 'emerald', count: 14 },
  { icon: '🪙', nameKey: 'featureCat.crypto',     descKey: 'featureCat.cryptoDesc',     accent: 'yellow',  count: 15 },
  { icon: '📊', nameKey: 'featureCat.trading',    descKey: 'featureCat.tradingDesc',    accent: 'violet',  count: 9  },
  { icon: '🌐', nameKey: 'featureCat.ipFlow',     descKey: 'featureCat.ipFlowDesc',     accent: 'orange',  count: 5  },
  { icon: '🕸', nameKey: 'featureCat.topology',   descKey: 'featureCat.topologyDesc',   accent: 'pink',    count: 5  },
  { icon: '🔗', nameKey: 'featureCat.derived',    descKey: 'featureCat.derivedDesc',    accent: 'teal',    count: 4  },
  { icon: '🚩', nameKey: 'featureCat.aml',        descKey: 'featureCat.amlDesc',        accent: 'red',     count: 6  },
  { icon: '⏱', nameKey: 'featureCat.temporal',   descKey: 'featureCat.temporalDesc',   accent: 'cyan',    count: 7  },
  { icon: '🎯', nameKey: 'featureCat.composite',  descKey: 'featureCat.compositeDesc',  accent: 'rose',    count: 1  },
  { icon: '🔬', nameKey: 'featureCat.anomaly',    descKey: 'featureCat.anomalyDesc',    accent: 'amber',   count: 3  },
  { icon: '🧠', nameKey: 'featureCat.gnn',        descKey: 'featureCat.gnnDesc',        accent: 'indigo',  count: 16 },
];

const ACCENT: Record<string, { border: string; bg: string; badge: string; title: string }> = {
  sky:     { border: 'border-sky-500/30',     bg: 'bg-sky-500/5',     badge: 'bg-sky-500/15 text-sky-300',     title: 'text-sky-300'     },
  emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', badge: 'bg-emerald-500/15 text-emerald-300', title: 'text-emerald-300' },
  yellow:  { border: 'border-yellow-500/30',  bg: 'bg-yellow-500/5',  badge: 'bg-yellow-500/15 text-yellow-300',  title: 'text-yellow-300'  },
  violet:  { border: 'border-violet-500/30',  bg: 'bg-violet-500/5',  badge: 'bg-violet-500/15 text-violet-300',  title: 'text-violet-300'  },
  orange:  { border: 'border-orange-500/30',  bg: 'bg-orange-500/5',  badge: 'bg-orange-500/15 text-orange-300',  title: 'text-orange-300'  },
  pink:    { border: 'border-pink-500/30',    bg: 'bg-pink-500/5',    badge: 'bg-pink-500/15 text-pink-300',      title: 'text-pink-300'    },
  cyan:    { border: 'border-cyan-500/30',    bg: 'bg-cyan-500/5',    badge: 'bg-cyan-500/15 text-cyan-300',      title: 'text-cyan-300'    },
  red:     { border: 'border-red-500/30',     bg: 'bg-red-500/5',     badge: 'bg-red-500/15 text-red-300',        title: 'text-red-300'     },
  teal:    { border: 'border-teal-500/30',    bg: 'bg-teal-500/5',    badge: 'bg-teal-500/15 text-teal-300',      title: 'text-teal-300'    },
  amber:   { border: 'border-amber-500/30',   bg: 'bg-amber-500/5',   badge: 'bg-amber-500/15 text-amber-300',    title: 'text-amber-300'   },
  indigo:  { border: 'border-indigo-500/30',  bg: 'bg-indigo-500/5',  badge: 'bg-indigo-500/15 text-indigo-300',  title: 'text-indigo-300'  },
  rose:    { border: 'border-rose-500/30',    bg: 'bg-rose-500/5',    badge: 'bg-rose-500/15 text-rose-300',      title: 'text-rose-300'    },
};

export function FeatureInfoPanel() {
  const { t } = useTranslation();
  const [allData,       setAllData]       = useState<ShapTop20Entry[]>([]);
  const [blacklistData, setBlacklistData] = useState<ShapTop20Entry[]>([]);
  const [fpData,        setFpData]        = useState<ShapTop20Entry[]>([]);
  const [fnData,        setFnData]        = useState<ShapTop20Entry[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState<Tab>('all');

  useEffect(() => {
    let cancelled = false;
    const fetch = () => {
      setLoading(true);
      Promise.all([getShapTop20AllUsers(), getShapTop20Blacklist(), getShapTop10FP(), getShapTop10FN()])
        .then(([a, b, fp, fn]) => {
          if (cancelled) return;
          setAllData(a); setBlacklistData(b); setFpData(fp); setFnData(fn);
          setLoading(false);
        });
    };
    fetch();
    window.addEventListener('bitoguard:localeChanged', fetch);
    return () => {
      cancelled = true;
      window.removeEventListener('bitoguard:localeChanged', fetch);
    };
  }, []);

  const TABS: { id: Tab; icon: string; labelKey: string }[] = [
    { id: 'all',        icon: '📈', labelKey: 'features.tab.all' },
    { id: 'blacklist',  icon: '🚫', labelKey: 'features.tab.blacklist' },
    { id: 'fp',         icon: '⚠',  labelKey: 'features.tab.fp' },
    { id: 'fn',         icon: '🔍', labelKey: 'features.tab.fn' },
    { id: 'compare',    icon: '🔄', labelKey: 'features.tab.compare' },
    { id: 'categories', icon: '🗂', labelKey: 'features.tab.categories' },
  ];

  const pipeline = [1,2,3,4,5,6,7,8].map(n => t(`features.pipeline.step${n}`));
  const pipelineCls = [
    'bg-sky-500/20 text-sky-300 border-sky-500/30',
    'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'bg-red-500/20 text-red-300 border-red-500/30',
    'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  ];

  return (
    <main className="flex-1 overflow-y-auto min-w-0 min-h-0 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm ring-1 ring-purple-500/30 rounded-xl shadow-2xl p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 text-2xl flex-shrink-0" aria-hidden>📋</div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-base font-bold text-purple-300 mb-1">{t('features.heroTitle')}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                <Trans
                  i18nKey="features.heroBody"
                  components={{ strong: <span className="text-white font-semibold" /> }}
                />
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { labelKey: 'features.stats.categories', value: 10, unitKey: 'features.unit.category' },
              { labelKey: 'features.stats.baseCount',  value: 81, unitKey: 'features.unit.dim' },
              { labelKey: 'features.stats.afterFilter',value: 65, unitKey: 'features.unit.dim' },
              { labelKey: 'features.stats.finalDim',   value: 82, unitKey: 'features.unit.dim' },
            ].map(({ labelKey, value, unitKey }) => (
              <div key={labelKey} className="bg-slate-900/60 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{value}<span className="text-xs text-slate-400 ml-0.5">{t(unitKey)}</span></div>
                <div className="text-xs text-slate-500 mt-0.5">{t(labelKey)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={activeTab === tab.id}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
                  ${activeTab === tab.id ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40' : 'bg-slate-700/40 text-slate-400 hover:text-slate-300'}`}
              >
                {tab.icon} {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-700/60 rounded-xl shadow-2xl p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-16">
              <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" aria-hidden />
              {t('common.loading')}
            </div>
          ) : (
            <>
              {activeTab === 'all'        && <ShapBarChart data={allData}           title={t('features.chart.allTitle')}       color="#38bdf8" />}
              {activeTab === 'blacklist'  && <ShapBarChart data={blacklistData}     title={t('features.chart.blacklistTitle')} color="#f87171" />}
              {activeTab === 'fp'         && <ShapBarChart data={fpData.slice(0,3)} title={t('features.chart.fpTitle')}         color="#fb923c" />}
              {activeTab === 'fn'         && <ShapBarChart data={fnData.slice(0,3)} title={t('features.chart.fnTitle')}         color="#a78bfa" />}
              {activeTab === 'compare'    && <CompareChart allData={allData} blacklistData={blacklistData} />}
              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {FEATURE_CATEGORIES_META.map(cat => {
                    const c = ACCENT[cat.accent];
                    return (
                      <div key={cat.nameKey} className={`ring-1 ${c.border} rounded-xl p-4 flex items-start gap-3 ${c.bg}`}>
                        <div className={`flex items-center justify-center w-9 h-9 rounded-lg border ${c.border} text-lg flex-shrink-0`} aria-hidden>{cat.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-sm font-semibold ${c.title}`}>{t(cat.nameKey)}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.badge}`}>{cat.count} {t('features.unit.dim')}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-snug">{t(cat.descKey)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-700/60 rounded-xl shadow-2xl p-5 mb-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('features.pipeline.title')}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {pipeline.reduce<React.ReactNode[]>((acc, step, i) => {
              if (i > 0) acc.push(<span key={`arr-${i}`} className="text-slate-500" aria-hidden>→</span>);
              acc.push(
                <span key={step + i} className={`px-2 py-1 rounded-md border font-medium ${pipelineCls[i]}`}>{step}</span>
              );
              return acc;
            }, [])}
          </div>
        </div>
      </div>
    </main>
  );
}
