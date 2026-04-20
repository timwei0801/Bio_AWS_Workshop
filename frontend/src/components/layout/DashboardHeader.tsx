import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export function DashboardHeader() {
  const { t } = useTranslation();
  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-xl px-4 sm:px-6 py-3 z-20 border-b border-slate-700/60 flex-shrink-0">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 text-lg flex-shrink-0"
            aria-hidden
          >
            🛡
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-sky-400 leading-tight truncate">
              {t('app.title')}
            </h1>
            <p className="text-[11px] text-slate-500 leading-tight truncate hidden sm:block">
              {t('app.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" aria-hidden />
            {t('app.status.online')}
          </div>
          <LanguageSwitcher compact />
        </div>
      </div>
    </header>
  );
}
