import { useDashboard } from '../../context/DashboardContext';
import { StatsPanel } from '../stats/StatsPanel';
import { NodeSelector } from '../graph/NodeSelector';
import { GraphViewer } from '../graph/GraphViewer';
import { NodeDetailPanel } from '../graph/NodeDetailPanel';
import { FpFnStatsPanel } from '../fpfn/FpFnStatsPanel';
import { FpFnNodeSelector } from '../fpfn/FpFnNodeSelector';
import { ShapPanel } from '../fpfn/ShapPanel';
import { PredictStatsPanel } from '../predict/PredictStatsPanel';
import { PredictNodeSelector } from '../predict/PredictNodeSelector';
import { PredictDetailPanel } from '../predict/PredictDetailPanel';
import { FeatureInfoPanel } from '../features/FeatureInfoPanel';
import { FeaturesStatsPanel } from '../features/FeaturesStatsPanel';
import { OverviewPage } from '../overview/OverviewPage';
import { DashboardHeader } from './DashboardHeader';
import { ModeNav } from './ModeNav';
import { GlassCard } from '../common/GlassCard';
import { useUrlState } from '../../hooks/useUrlState';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function Dashboard() {
  useUrlState();
  useKeyboardShortcuts();

  const { state } = useDashboard();
  const { dashboardMode } = state;

  const isFpFnMode = dashboardMode === 'fp' || dashboardMode === 'fn';
  const isPredictMode = dashboardMode === 'predict';
  const isFeaturesMode = dashboardMode === 'features';
  const isOverviewMode = dashboardMode === 'overview';

  const showLeftPanel = !isOverviewMode;

  const renderLeftPanel = () => {
    if (isOverviewMode) return null;
    if (isFeaturesMode) return <FeaturesStatsPanel />;
    if (isPredictMode) return <PredictStatsPanel />;
    if (isFpFnMode) return <FpFnStatsPanel />;
    return <StatsPanel />;
  };

  const renderRightContent = () => {
    if (isOverviewMode) return <OverviewPage />;
    if (isFeaturesMode) return <FeatureInfoPanel />;

    if (isPredictMode) {
      return (
        <main className="flex-1 overflow-y-auto min-w-0 min-h-0 animate-fade-in">
          <div className="flex flex-col gap-4">
            <GlassCard padding="md">
              <PredictNodeSelector />
            </GlassCard>
            <GlassCard padding="sm">
              <PredictDetailPanel />
            </GlassCard>
          </div>
        </main>
      );
    }

    if (isFpFnMode) {
      return (
        <main className="flex-1 overflow-y-auto min-w-0 min-h-0 animate-fade-in">
          <div className="flex flex-col gap-4">
            <GlassCard padding="md" className="flex flex-col">
              <FpFnNodeSelector />
              <div className="mt-3 h-[420px] lg:h-[500px]" onWheel={e => e.stopPropagation()}>
                <GraphViewer />
              </div>
            </GlassCard>
            <GlassCard padding="sm">
              <ShapPanel />
            </GlassCard>
          </div>
        </main>
      );
    }

    // Fraud mode
    return (
      <main className="flex-1 overflow-y-auto min-w-0 min-h-0 animate-fade-in">
        <div className="flex flex-col gap-4">
          <GlassCard padding="md" className="flex flex-col">
            <NodeSelector />
            <div className="mt-3 h-[420px] lg:h-[500px]" onWheel={e => e.stopPropagation()}>
              <GraphViewer />
            </div>
          </GlassCard>
          <GlassCard padding="sm">
            <NodeDetailPanel />
          </GlassCard>
        </div>
      </main>
    );
  };

  return (
    <div className="flex flex-col min-h-screen xl:h-screen text-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <DashboardHeader />

      {/* Top nav (tabs) */}
      <div className="bg-slate-900/60 backdrop-blur-md border-b border-slate-700/50 px-3 sm:px-6 py-2 flex-shrink-0">
        <ModeNav orientation="horizontal" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-3 sm:p-4 min-h-0">
        {showLeftPanel && (
          <aside
            className="w-full lg:w-80 xl:w-96 card-glass overflow-y-auto flex-shrink-0"
            aria-label="Sidebar stats"
          >
            <div className="p-4 space-y-4">
              {renderLeftPanel()}
            </div>
          </aside>
        )}
        {renderRightContent()}
      </div>
    </div>
  );
}
