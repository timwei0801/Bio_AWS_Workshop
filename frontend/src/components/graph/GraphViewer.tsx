import { useRef, useCallback, useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useDashboard } from '../../context/DashboardContext';
import { useSubgraph } from '../../hooks/useSubgraph';
import { Spinner } from '../common/Spinner';
import { ErrorMessage } from '../common/ErrorMessage';
import type { SubgraphNode, SubgraphEdge } from '../../types/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ForceGraph3D = lazy(() => import('react-force-graph-3d').then(m => ({ default: m.default as any })));

export function getNodeColor(node: SubgraphNode): string {
  if (node.node_type === 'wallet') return '#8b5cf6';
  if (node.status === 1) return '#ef4444';
  if (node.risk_score >= 0.5) return '#f97316';
  return '#4f46e5';
}

export function getLinkColor(edge: SubgraphEdge): string {
  if (edge.relation_type === 'R1') return '#0ea5e9';
  if (edge.relation_type === 'R2') return '#f59e0b';
  if (edge.relation_type === 'R3') return '#10b981';
  return '#94a3b8';
}

export function getLinkDash(_edge: SubgraphEdge): number[] | null { return null; }

function GraphLegend() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 bg-slate-800/70 rounded-lg border border-slate-700/50 text-xs flex-shrink-0">
      <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">{t('graph.legend')}</span>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" aria-hidden /><span className="text-slate-300">{t('graph.fraudNode')}</span></div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" aria-hidden /><span className="text-slate-300">{t('graph.highRisk')}</span></div>
      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" aria-hidden /><span className="text-slate-300">{t('graph.normal')}</span></div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 flex-shrink-0 inline-block bg-violet-500" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} aria-hidden />
        <span className="text-slate-300">{t('graph.wallet')}</span>
      </div>
      <div className="hidden lg:flex items-center gap-x-3 border-l border-slate-700/60 pl-3">
        <div className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-sky-500" aria-hidden /><span className="text-slate-300">{t('graph.relation.r1')}</span></div>
        <div className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-amber-500" aria-hidden /><span className="text-slate-300">{t('graph.relation.r2')}</span></div>
        <div className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-emerald-500" aria-hidden /><span className="text-slate-300">{t('graph.relation.r3')}</span></div>
      </div>
    </div>
  );
}

export function GraphViewer() {
  const { t } = useTranslation();
  const { state, dispatch, loadNodeDetail, loadSubgraph } = useDashboard();
  const { subgraph, loading, error, isLargeGraph } = useSubgraph();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const selectedWalletIdRef = useRef(state.selectedWalletId);
  const selectedUserIdRef = useRef(state.selectedUserId);
  const subgraphRef = useRef(subgraph);
  useEffect(() => { selectedWalletIdRef.current = state.selectedWalletId; }, [state.selectedWalletId]);
  useEffect(() => { selectedUserIdRef.current = state.selectedUserId; }, [state.selectedUserId]);
  useEffect(() => { subgraphRef.current = subgraph; }, [subgraph]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDimensions({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleEngineStop = useCallback(() => {
    const walletId = selectedWalletIdRef.current;
    const sg = subgraphRef.current;
    if (walletId && sg) {
      const walletNode = sg.nodes.find(n => n.node_type === 'wallet' && (n.node_label === walletId || String(n.user_id) === walletId));
      if (walletNode) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graphNode = (graphRef.current?.graphData()?.nodes ?? []).find((n: any) => n.user_id === walletNode.user_id);
        if (graphNode) {
          const { x = 0, y = 0, z = 0 } = graphNode;
          const distance = 120;
          graphRef.current?.cameraPosition({ x: x + distance, y: y + distance / 2, z: z + distance }, { x, y, z }, 800);
          return;
        }
      }
    }
    graphRef.current?.zoomToFit(600, 80);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((node: any) => {
    const n = node as SubgraphNode;
    if (n.node_type === 'wallet') {
      const edges = subgraph?.edges ?? [];
      const connectedUserIds = edges
        .filter(e => e.source === n.user_id || e.target === n.user_id)
        .map(e => e.source === n.user_id ? e.target : e.source);
      const connectedUsers = (subgraph?.nodes ?? [])
        .filter(nd => connectedUserIds.includes(nd.user_id) && nd.node_type === 'user')
        .sort((a, b) => b.risk_score - a.risk_score);
      if (connectedUsers.length > 0) loadNodeDetail(connectedUsers[0].user_id);
    } else {
      loadNodeDetail(n.user_id);
    }
    const distance = 120;
    const { x = 0, y = 0, z = 0 } = node;
    graphRef.current?.cameraPosition({ x: x + distance, y: y + distance / 2, z: z + distance }, { x, y, z }, 800);
  }, [loadNodeDetail, subgraph]);

  const handleZoomIn = useCallback(() => {
    const cam = graphRef.current?.camera();
    if (!cam) return;
    const f = 0.65;
    graphRef.current.cameraPosition({ x: cam.position.x * f, y: cam.position.y * f, z: cam.position.z * f }, undefined, 200);
  }, []);
  const handleZoomOut = useCallback(() => {
    const cam = graphRef.current?.camera();
    if (!cam) return;
    const f = 1.5;
    graphRef.current.cameraPosition({ x: cam.position.x * f, y: cam.position.y * f, z: cam.position.z * f }, undefined, 200);
  }, []);
  const handleResetView = useCallback(() => graphRef.current?.zoomToFit(500, 80), []);

  const graphData = useMemo(() => ({
    nodes: subgraph?.nodes.map(n => ({ ...n, id: n.user_id })) ?? [],
    links: subgraph?.edges.map(e => ({ ...e })) ?? [],
  }), [subgraph]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeColor = useCallback((node: any) => getNodeColor(node as SubgraphNode), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeVal = useCallback((node: any) => {
    const n = node as SubgraphNode;
    const walletId = selectedWalletIdRef.current;
    const isSelectedWallet = n.node_type === 'wallet' && walletId !== null && (n.node_label === walletId || String(n.user_id) === walletId);
    if (isSelectedWallet) return 4;
    if (n.user_id === selectedUserIdRef.current && !walletId) return 4;
    return n.node_type === 'wallet' ? 1.2 : 1;
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkColor = useCallback((link: any) => getLinkColor(link as SubgraphEdge), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkArrowColor = useCallback((link: any) => getLinkColor(link as SubgraphEdge), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeLabel = useCallback((node: any) => {
    const n = node as SubgraphNode;
    if (n.node_type === 'wallet') return `Wallet: ${n.node_label ?? n.user_id}`;
    return `User ${n.node_label?.replace('user_', '') ?? n.user_id} | Risk: ${n.risk_score.toFixed(2)}`;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeThreeObject = useCallback((node: any): any => {
    const n = node as SubgraphNode;
    const walletId = selectedWalletIdRef.current;
    const userId = selectedUserIdRef.current;
    const isSelectedWallet = n.node_type === 'wallet' && walletId !== null && (n.node_label === walletId || String(n.user_id) === walletId);
    if (isSelectedWallet || (n.user_id === userId && !walletId && n.node_type !== 'wallet')) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), new THREE.MeshLambertMaterial({ color: 0xfbbf24 })));
      group.add(new THREE.Mesh(new THREE.TorusGeometry(9, 1.2, 8, 32), new THREE.MeshLambertMaterial({ color: 0xfde68a })));
      return group;
    }
    if (n.node_type === 'wallet') {
      return new THREE.Mesh(new THREE.OctahedronGeometry(4), new THREE.MeshLambertMaterial({ color: 0x8b5cf6 }));
    }
    return undefined;
  }, []);

  const isSparse = (subgraph?.nodes?.length ?? 0) > 0 && (subgraph?.nodes?.length ?? 0) < 3;

  return (
    <div className="flex flex-col h-full gap-2">
      <GraphLegend />

      <div
        ref={containerRef}
        className="flex-1 relative rounded-lg overflow-hidden min-h-0 border border-slate-700 bg-slate-900/30"
      >
        {isLargeGraph && (
          <div className="absolute top-3 left-3 z-10 bg-amber-900/70 text-amber-300 border border-amber-700/50 text-xs px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm">
            ⚠ {t('graph.downgraded')}
          </div>
        )}

        {isSparse && (
          <div className="absolute top-3 left-3 z-10 bg-sky-900/70 text-sky-200 border border-sky-600/50 text-xs px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm max-w-[300px]">
            ⓘ {t('graph.sparseHint')}
          </div>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button onClick={handleZoomIn} aria-label={t('a11y.zoomIn')} title={t('graph.controls.zoomIn')}
            className="w-9 h-9 font-bold flex items-center justify-center bg-slate-800/90 border border-slate-600/70 rounded-lg shadow hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-300 backdrop-blur-sm">
            +
          </button>
          <button onClick={handleZoomOut} aria-label={t('a11y.zoomOut')} title={t('graph.controls.zoomOut')}
            className="w-9 h-9 font-bold flex items-center justify-center bg-slate-800/90 border border-slate-600/70 rounded-lg shadow hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-300 backdrop-blur-sm">
            −
          </button>
          <button onClick={handleResetView} aria-label={t('a11y.resetView')} title={t('graph.controls.reset')}
            className="w-9 h-9 font-bold flex items-center justify-center bg-slate-800/90 border border-slate-600/70 rounded-lg shadow hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 text-slate-300 backdrop-blur-sm">
            ↻
          </button>
          {state.selectedNode && (
            <button
              aria-label={t('a11y.centerNode')}
              title={t('graph.controls.center')}
              onClick={() => {
                const uid = state.selectedNode!.user_id;
                dispatch({ type: 'SELECT_USER', userId: uid });
                if (!state.subgraphCache.has(uid)) loadSubgraph(uid, 2);
              }}
              className="w-9 h-9 text-xs font-bold flex items-center justify-center bg-indigo-700/80 border border-indigo-500/70 rounded-lg shadow hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 text-indigo-200 backdrop-blur-sm"
            >
              ⊙
            </button>
          )}
        </div>

        {!state.selectedUserId ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-5xl text-slate-600 mb-3" aria-hidden>📊</span>
            <p className="text-slate-300 font-medium text-sm">{t('graph.placeholder')}</p>
            <p className="text-slate-500 text-xs mt-1">{t('graph.placeholderHint')}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full"><Spinner /></div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <ErrorMessage message={error} onRetry={() => loadSubgraph(state.selectedUserId!, 2)} />
          </div>
        ) : subgraph && subgraph.nodes.length > 0 ? (
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner /></div>}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ForceGraph3D
              {...({ ref: graphRef } as any)}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeColor={nodeColor}
              nodeVal={nodeVal}
              nodeThreeObject={nodeThreeObject}
              linkColor={linkColor}
              linkWidth={1.2}
              linkOpacity={0.7}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={linkArrowColor}
              onNodeClick={handleNodeClick}
              onEngineStop={handleEngineStop}
              nodeLabel={nodeLabel}
              backgroundColor="rgba(0,0,0,0)"
              showNavInfo={false}
            />
          </Suspense>
        ) : subgraph !== null ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
            <span className="text-3xl text-slate-600" aria-hidden>📊</span>
            <p className="text-slate-300 text-sm font-medium">{t('graph.empty')}</p>
            <p className="text-slate-500 text-xs leading-relaxed">{t('graph.emptyHint')}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
