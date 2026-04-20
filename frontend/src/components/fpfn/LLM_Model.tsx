/**
 * LLM-powered misclassification analysis panel.
 * Sends SHAP data to Groq API and renders a structured XAI explanation.
 */

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '../../context/DashboardContext';
import { analyzeMisclassification } from '../../api/llmApi';

function renderAnalysis(text: string) {
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    if (/^#{1,3}\s/.test(line)) {
      return <p key={idx} className="text-[11px] font-bold text-sky-300 mt-3 mb-0.5">{line.replace(/^#{1,3}\s/, '')}</p>;
    }
    if (/^\d+\.\s\*\*/.test(line) || /^[-•]\s/.test(line)) {
      const cleaned = line.replace(/^[-•\d.]+\s/, '');
      const parts = cleaned.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={idx} className="text-[11px] text-slate-300 leading-relaxed ml-2 mt-1">
          {'• '}
          {parts.map((part, pi) => pi % 2 === 1 ? <span key={pi} className="font-semibold text-slate-100">{part}</span> : part)}
        </p>
      );
    }
    if (line.includes('**')) {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={idx} className="text-[11px] text-slate-300 leading-relaxed mt-0.5">
          {parts.map((part, pi) => pi % 2 === 1 ? <span key={pi} className="font-semibold text-slate-100">{part}</span> : part)}
        </p>
      );
    }
    if (/^---+$/.test(line.trim())) return <hr key={idx} className="border-slate-700 my-2" />;
    if (!line.trim()) return <div key={idx} className="h-1" />;
    return <p key={idx} className="text-[11px] text-slate-300 leading-relaxed">{line}</p>;
  });
}

export function LLM_Model() {
  const { t } = useTranslation();
  const { state } = useDashboard();
  const { shapWaterfall, selectedUserId, dashboardMode } = state;
  const fpFnMode = dashboardMode === 'fn' ? 'fn' : dashboardMode === 'fp' ? 'fp' : state.fpFnMode;

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  if (selectedUserId == null || !shapWaterfall?.features?.length) return null;

  const nodes = fpFnMode === 'fp' ? state.fpNodes : state.fnNodes;
  const node = nodes.find(n => n.user_id === selectedUserId);
  const riskScore = node?.risk_score ?? shapWaterfall.base_value;

  const handleAnalyze = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true); setError(null); setAnalysis(null);
    try {
      const result = await analyzeMisclassification(
        { mode: fpFnMode, userId: selectedUserId, riskScore, features: shapWaterfall.features, baseValue: shapWaterfall.base_value },
        abortRef.current.signal,
      );
      setAnalysis(result);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setAnalysis(null); setError(null); setLoading(false);
  };

  const isFp = fpFnMode === 'fp';
  const modeTag = isFp ? t('fpfn.llm.modeFP') : t('fpfn.llm.modeFN');
  const accentColor = isFp ? 'text-amber-400' : 'text-red-400';
  const btnColor = isFp
    ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700'
    : 'bg-red-700 hover:bg-red-600 active:bg-red-800';

  return (
    <div className="mt-3 border-t border-slate-700/60 pt-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="w-0.5 h-4 bg-violet-500 rounded-full inline-block flex-shrink-0" aria-hidden />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">🤖 {t('fpfn.llm.title')}</h3>
        <span className={`ml-auto text-[10px] font-mono font-semibold ${accentColor}`}>
          {modeTag} · User {selectedUserId}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`px-3 py-1 rounded text-[11px] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${btnColor}`}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              {t('fpfn.llm.loading')}
            </span>
          ) : analysis ? t('fpfn.llm.rerun') : t('fpfn.llm.run')}
        </button>
        {(analysis || error) && !loading && (
          <button onClick={handleClear} className="px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400">
            {t('fpfn.llm.clear')}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-950/40 ring-1 ring-red-800/50 rounded-lg p-2.5">
          <p className="text-[11px] text-red-400">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-slate-900/60 ring-1 ring-violet-700/30 rounded-lg p-3 space-y-0.5 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-slate-700/50 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold">{t('fpfn.llm.modelTag')}</span>
            <span className="ml-auto text-[10px] text-slate-600 font-mono">Groq</span>
          </div>
          {renderAnalysis(analysis)}
        </div>
      )}
    </div>
  );
}
