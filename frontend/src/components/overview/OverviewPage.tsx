import { useTranslation } from 'react-i18next';
import { GlassCard } from '../common/GlassCard';
import { KpiGrid } from './KpiGrid';
import { FairnessDashboard } from './FairnessDashboard';
import { ConfusionMatrix } from '../stats/ConfusionMatrix';
import { RiskBarChart } from '../stats/RiskBarChart';
import { useStats } from '../../hooks/useStats';
import { RelationStats } from '../stats/RelationStats';

export function OverviewPage() {
  const { t } = useTranslation();
  const { stats } = useStats();

  return (
    <main className="flex-1 overflow-y-auto min-w-0 min-h-0">
      <div className="flex flex-col gap-4 animate-fade-in">
        <GlassCard padding="lg" tone="sky">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 text-2xl flex-shrink-0" aria-hidden>🛡</div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-base font-bold text-sky-300 mb-1">{t('overview.heroTitle')}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{t('overview.heroSubtitle')}</p>
            </div>
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
