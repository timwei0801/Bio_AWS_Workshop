import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language ?? 'en';

  return (
    <div
      role="group"
      aria-label={t('a11y.switchLang')}
      className="inline-flex items-center gap-0.5 rounded-lg bg-slate-800/60 ring-1 ring-slate-700/60 p-0.5"
    >
      {SUPPORTED_LANGUAGES.map(lang => {
        const active = current.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            aria-pressed={active}
            className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              active
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {compact ? lang.short : lang.label}
          </button>
        );
      })}
    </div>
  );
}
