import { useTranslation } from 'react-i18next';
import { useStats } from '../../hooks/useStats';
import { useDashboard } from '../../context/DashboardContext';
import { Spinner } from '../common/Spinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { StatCard } from '../stats/StatCard';
import { RiskBarChart } from '../stats/RiskBarChart';
import { ConfusionMatrix } from '../stats/ConfusionMatrix';

export function FeaturesStatsPanel() {
  const { t } = useTranslation();
  const { stats, loading, error } = useStats();
  const { loadStats } = useDashboard();

  if (loading && !stats) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadStats} />;
  if (!stats) return null;

  const fraudRatio = `${(stats.fraud_ratio * 100).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-700">
        <span className="w-1 h-5 bg-sky-500 rounded-full" aria-hidden />
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          {t('featuresStats.title')}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatCard title={t('featuresStats.totalNodes')} value={stats.total_nodes}  accentColor="sky"     icon="●" />
        <StatCard title={t('featuresStats.fraudNodes')} value={stats.fraud_nodes}  accentColor="red"     icon="⚠" />
        <StatCard title={t('featuresStats.normalNodes')} value={stats.normal_nodes} accentColor="emerald" icon="✓" />
        <StatCard title={t('featuresStats.fraudRatio')}  value={fraudRatio}        accentColor="orange"  icon="●" />
      </div>

      <div className="bg-slate-800/40 rounded-lg p-3 ring-1 ring-slate-700/50">
        <RiskBarChart data={stats.risk_distribution} />
      </div>

      <div className="bg-slate-800/40 rounded-lg p-3 ring-1 ring-slate-700/50">
        <ConfusionMatrix />
      </div>
    </div>
  );
}
