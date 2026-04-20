import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import type { DashboardMode } from '../../types/index';

interface Action {
  kind: 'mode' | 'user';
  id: string;
  label: string;
  sub?: string;
  run: () => void;
}

const MODE_LIST: { mode: DashboardMode; i18nKey: string }[] = [
  { mode: 'overview', i18nKey: 'nav.overview' },
  { mode: 'features', i18nKey: 'nav.features' },
  { mode: 'fraud',    i18nKey: 'nav.fraud' },
  { mode: 'fp',       i18nKey: 'nav.fp' },
  { mode: 'fn',       i18nKey: 'nav.fn' },
  { mode: 'predict',  i18nKey: 'nav.predict' },
];

export function CommandPalette() {
  const { t } = useTranslation();
  const { state, dispatch, loadNodeDetail, loadSubgraph } = useDashboard();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isShortcut) {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40);
    else { setQuery(''); setCursor(0); }
  }, [open]);

  const actions: Action[] = useMemo(() => {
    if (!open) return [];
    const q = query.trim().toLowerCase();
    const modes: Action[] = MODE_LIST.map(m => ({
      kind: 'mode',
      id: `mode:${m.mode}`,
      label: t(m.i18nKey),
      sub: `#/${m.mode}`,
      run: () => dispatch({ type: 'SET_DASHBOARD_MODE', mode: m.mode }),
    }));

    let users: Action[] = [];
    if (q) {
      const pool = [
        ...state.fraudNodes,
        ...state.fpNodes,
        ...state.fnNodes,
      ];
      const seen = new Set<number>();
      users = pool
        .filter(n => String(n.user_id).includes(q) && !seen.has(n.user_id) && seen.add(n.user_id))
        .slice(0, 12)
        .map(n => ({
          kind: 'user',
          id: `user:${n.user_id}`,
          label: `User ${n.user_id}`,
          sub: `risk ${n.risk_score.toFixed(3)}`,
          run: () => {
            dispatch({ type: 'SELECT_USER', userId: n.user_id });
            loadNodeDetail(n.user_id);
            if (!state.subgraphCache.has(n.user_id)) loadSubgraph(n.user_id, 2);
          },
        }));
    }

    const filteredModes = q ? modes.filter(m => m.label.toLowerCase().includes(q)) : modes;
    return [...filteredModes, ...users];
  }, [open, query, state.fraudNodes, state.fpNodes, state.fnNodes, state.subgraphCache, dispatch, loadNodeDetail, loadSubgraph, t]);

  useEffect(() => { setCursor(0); }, [query]);

  const execute = (a: Action) => { a.run(); setOpen(false); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(actions.length - 1, c + 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
    if (e.key === 'Enter' && actions[cursor]) { e.preventDefault(); execute(actions[cursor]); }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.title')}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-32 px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-slate-900 ring-1 ring-slate-700 rounded-xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
          <span aria-hidden className="text-slate-500">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('palette.placeholder')}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            aria-label={t('palette.placeholder')}
          />
          <kbd className="text-[10px] text-slate-500 font-mono">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-1">
          {actions.length === 0 ? (
            <p className="px-4 py-6 text-xs text-slate-500 text-center">{t('palette.empty')}</p>
          ) : (
            <ul role="listbox">
              {actions.map((a, i) => (
                <li
                  key={a.id}
                  role="option"
                  aria-selected={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => execute(a)}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors
                    ${i === cursor ? 'bg-sky-500/15 text-sky-200' : 'text-slate-300 hover:bg-slate-800/60'}`}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="text-[10px] text-slate-500 uppercase">
                      {a.kind === 'mode' ? t('palette.kindSection') : t('palette.kindUser')}
                    </span>
                    {a.label}
                  </span>
                  {a.sub && <span className="text-[10px] text-slate-500 font-mono">{a.sub}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-700 flex items-center gap-4 text-[10px] text-slate-500">
          <span><kbd className="font-mono">↑↓</kbd> {t('palette.hintMove')}</span>
          <span><kbd className="font-mono">↵</kbd> {t('palette.hintSelect')}</span>
          <span className="ml-auto">{t('palette.hintShortcut')}</span>
        </div>
      </div>
    </div>
  );
}
