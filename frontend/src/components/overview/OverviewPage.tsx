import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../common/GlassCard';
import { KpiGrid } from './KpiGrid';
import { FairnessDashboard } from './FairnessDashboard';
import { ConfusionMatrix } from '../stats/ConfusionMatrix';
import { RiskBarChart } from '../stats/RiskBarChart';
import { useStats } from '../../hooks/useStats';
import { RelationStats } from '../stats/RelationStats';
import { RISK_THRESHOLD } from '../../constants/risk';

export function OverviewPage() {
  const { t, i18n } = useTranslation();
  const { stats } = useStats();

  // Render a locale-appropriate "updated at" clock. Tick every minute.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const clock = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-TW' : 'en-US', {
        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).format(now);
    } catch {
      return now.toISOString().slice(0, 16).replace('T', ' ');
    }
  }, [now, i18n.language]);

  const edgeCount = stats ? (stats.relation_counts.r1 + stats.relation_counts.r2 + stats.relation_counts.r3) : 0;
  const fraudPct  = stats ? (stats.fraud_ratio * 100).toFixed(1) + '%' : '—';

  return (
    <main className="flex-1 overflow-y-auto min-w-0 min-h-0">
      <div className="flex flex-col gap-4 animate-fade-in">
        <GlassCard padding="lg" tone="sky">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 text-2xl flex-shrink-0" aria-hidden>🛡</div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-sky-300">{t('overview.heroTitle')}</h2>
                <span className="text-[10px] text-slate-500 font-mono">{t('overview.lastUpdated', { time: clock })}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{t('overview.heroSubtitle')}</p>
              <p className="text-[11px] text-slate-500 mt-1 italic">{t('overview.architecture')}</p>
            </div>
          </div>

          {/* Dataset ticker */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
            <TickerTile label={t('overview.tickerUsers')}     value={stats ? stats.total_nodes.toLocaleString() : '—'} />
            <TickerTile label={t('overview.tickerFraud')}     value={stats ? stats.fraud_nodes.toLocaleString() : '—'} tone="red" />
            <TickerTile label={t('overview.tickerFraudPct')}  value={fraudPct} tone="amber" />
            <TickerTile label={t('overview.tickerEdges')}     value={edgeCount ? edgeCount.toLocaleString() : '—'} tone="emerald" />
            <TickerTile label={t('overview.tickerThreshold')} value={String(RISK_THRESHOLD.FRAUD)} tone="violet" />
          </div>

          <div className="mt-4">
            <KpiGrid />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <GlassCard padding="md" className="lg:col-span-3">
            {stats && <RiskBarChart data={stats.risk_distribution} />}
          </GlassCard>
          <GlassCard padding="md" className="lg:col-span-2">
            <ConfusionMatrix />
          </GlassCard>
        </div>

        <GlassCard padding="lg">
          <FairnessDashboard />
        </GlassCard>

        {stats && (
          <GlassCard padding="md">
            <RelationStats counts={stats.relation_counts} />
          </GlassCard>
        )}
      </div>
    </main>
  );
}

function TickerTile({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'red' | 'amber' | 'emerald' | 'violet' }) {
  const toneMap = {
    slate:   'text-slate-100',
    red:     'text-red-300',
    amber:   'text-amber-300',
    emerald: 'text-emerald-300',
    violet:  'text-violet-300',
  };
  return (
    <div className="bg-slate-900/40 ring-1 ring-slate-700/50 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${toneMap[tone]} mt-0.5`}>{value}</p>
    </div>
  );
}
