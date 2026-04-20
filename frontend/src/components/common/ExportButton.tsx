import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportRows } from '../../utils/exportData';

interface ExportButtonProps {
  /** Rows to export. Receive an array of plain objects. */
  rows: readonly Record<string, unknown>[];
  /** Base filename (no extension). */
  filename: string;
  /** Disable the button. */
  disabled?: boolean;
  /** Size preset — defaults to sm. */
  size?: 'xs' | 'sm';
}

export function ExportButton({
  rows, filename, disabled = false, size = 'sm',
}: ExportButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const paddingClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        disabled={disabled || rows.length === 0}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${paddingClass} font-semibold rounded-md bg-slate-700/60 text-slate-200 ring-1 ring-slate-600 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1`}
      >
        <span aria-hidden>⬇</span>
        {t('export.label')} ({rows.length})
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-36 bg-slate-900 ring-1 ring-slate-700 rounded-lg shadow-xl z-30 overflow-hidden">
          <button
            role="menuitem"
            className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:bg-slate-800"
            onClick={() => { exportRows(rows as Record<string, unknown>[], filename, 'csv'); setOpen(false); }}
          >
            {t('export.csv')}
          </button>
          <button
            role="menuitem"
            className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:bg-slate-800"
            onClick={() => { exportRows(rows as Record<string, unknown>[], filename, 'json'); setOpen(false); }}
          >
            {t('export.json')}
          </button>

        </div>
      )}
    </div>
  );
}
