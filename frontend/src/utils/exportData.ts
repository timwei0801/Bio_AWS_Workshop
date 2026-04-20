/**
 * Trigger a download of data as CSV or JSON.
 * Small helper — no external dependency.
 */

type Row = Record<string, unknown>;

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const headers = Array.from(rows.reduce<Set<string>>((acc, r) => {
    Object.keys(r).forEach(k => acc.add(k));
    return acc;
  }, new Set()));
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
  return `${headers.join(',')}\n${body}`;
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRows(rows: Row[], filename: string, format: 'csv' | 'json') {
  if (format === 'csv') {
    triggerDownload(`${filename}.csv`, toCsv(rows), 'text/csv');
  } else {
    triggerDownload(`${filename}.json`, JSON.stringify(rows, null, 2), 'application/json');
  }
}
