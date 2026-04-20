import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportRows } from '../utils/exportData';

// Minimal shim — JSDOM lacks Blob.text() and createObjectURL / revokeObjectURL.
beforeEach(() => {
  const captured: Array<{ name: string; mime: string; parts: BlobPart[] }> = [];
  (globalThis as any).__blobs = captured;

  const OriginalBlob = globalThis.Blob;
  // @ts-expect-error spy wrapper
  globalThis.Blob = function (parts: BlobPart[], opts: BlobPropertyBag) {
    captured.push({ name: 'blob', mime: opts?.type ?? '', parts });
    return new OriginalBlob(parts, opts);
  };
  (globalThis.URL as any).createObjectURL = vi.fn(() => 'blob://test');
  (globalThis.URL as any).revokeObjectURL = vi.fn();
});

describe('exportRows', () => {
  it('writes a CSV header from all keys and escapes special chars', () => {
    exportRows([
      { user_id: 1, note: 'hello, world' },
      { user_id: 2, note: 'line\nbreak' },
      { user_id: 3, note: 'has "quote"' },
    ], 'users', 'csv');
    const blobs = (globalThis as any).__blobs as Array<{ parts: BlobPart[]; mime: string }>;
    expect(blobs.length).toBe(1);
    expect(blobs[0].mime).toMatch(/text\/csv/);
    const text = String(blobs[0].parts[0]);
    expect(text.split('\n')[0]).toBe('user_id,note');
    expect(text).toContain('"hello, world"');
    expect(text).toContain('"line\nbreak"');
    expect(text).toContain('"has ""quote"""');
  });

  it('writes valid JSON for empty array', () => {
    exportRows([], 'empty', 'json');
    const blobs = (globalThis as any).__blobs as Array<{ parts: BlobPart[]; mime: string }>;
    const text = String(blobs[0].parts[0]);
    expect(JSON.parse(text)).toEqual([]);
  });

  it('writes JSON preserving numbers and booleans', () => {
    exportRows([{ a: 1, b: true, c: null }], 'typed', 'json');
    const blobs = (globalThis as any).__blobs as Array<{ parts: BlobPart[]; mime: string }>;
    const text = String(blobs[0].parts[0]);
    const parsed = JSON.parse(text);
    expect(parsed[0].a).toBe(1);
    expect(parsed[0].b).toBe(true);
    expect(parsed[0].c).toBeNull();
  });
});
