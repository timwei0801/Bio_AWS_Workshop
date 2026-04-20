import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardMode } from '../../types/index';

interface ModeDef {
  mode: DashboardMode;
  i18nKey: string;
  icon: string;
  accent: 'sky' | 'purple' | 'amber' | 'red' | 'emerald' | 'violet';
  kbd: string;
}

const MODES: ModeDef[] = [
  { mode: 'overview', i18nKey: 'nav.overview', icon: '📊', accent: 'sky',     kbd: '1' },
  { mode: 'features', i18nKey: 'nav.features', icon: '📋', accent: 'purple',  kbd: '2' },
  { mode: 'fraud',    i18nKey: 'nav.fraud',    icon: '🛡',  accent: 'red',     kbd: '3' },
  { mode: 'fp',       i18nKey: 'nav.fp',       icon: '⚠',  accent: 'amber',   kbd: '4' },
  { mode: 'fn',       i18nKey: 'nav.fn',       icon: '🔍', accent: 'emerald', kbd: '5' },
  { mode: 'predict',  i18nKey: 'nav.predict',  icon: '🎯', accent: 'violet',  kbd: '6' },
];

const ACTIVE: Record<ModeDef['accent'], string> = {
  sky:     'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50',
  purple:  'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50',
  amber:   'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50',
  red:     'bg-red-500/20 text-red-300 ring-1 ring-red-500/50',
  emerald: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50',
  violet:  'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50',
};

const FOCUS: Record<ModeDef['accent'], string> = {
  sky: 'focus-visible:ring-sky-500', purple: 'focus-visible:ring-purple-500',
  amber: 'focus-visible:ring-amber-500', red: 'focus-visible:ring-red-500',
  emerald: 'focus-visible:ring-emerald-500', violet: 'focus-visible:ring-violet-500',
};

export function ModeNav({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
  const { t } = useTranslation();
  const { state, dispatch } = useDashboard();

  const containerClass = orientation === 'vertical'
    ? 'flex flex-col gap-1'
    : 'flex gap-1.5 overflow-x-auto scrollbar-thin pb-1 snap-x';

  return (
    <nav aria-label="Dashboard sections" className={containerClass}>
      {MODES.map(m => {
        const active = state.dashboardMode === m.mode;
        return (
          <button
            key={m.mode}
            onClick={() => dispatch({ type: 'SET_DASHBOARD_MODE', mode: m.mode })}
            aria-pressed={active}
            title={`${t(m.i18nKey)} (${m.kbd})`}
            className={`group relative snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${FOCUS[m.accent]}
              ${active
                ? ACTIVE[m.accent]
                : 'bg-slate-700/40 text-slate-400 hover:bg-slate-700/70 hover:text-slate-200'}
              ${orientation === 'horizontal' ? 'min-w-max' : ''}`}
          >
            <span aria-hidden>{m.icon}</span>
            <span className="whitespace-nowrap">{t(m.i18nKey)}</span>
            <kbd className="hidden xl:inline-block ml-1 px-1 text-[9px] font-mono bg-slate-900/50 rounded text-slate-500 group-aria-pressed:text-slate-300">{m.kbd}</kbd>
          </button>
        );
      })}
    </nav>
  );
}
