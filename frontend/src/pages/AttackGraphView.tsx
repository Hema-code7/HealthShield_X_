import React, { useState } from 'react';
import { ReactFlow, Controls, Background } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CustomCyberNode } from '../components/attack_graph/CustomCyberNode';
import { NodeDetailDrawer } from '../components/attack_graph/NodeDetailDrawer';
import type { AttackGraphData, AttackNodeData } from '../types';
import { GitGraph } from 'lucide-react';

const nodeTypes = {
  cyberNode: CustomCyberNode,
};

interface AttackGraphViewProps {
  graphData: AttackGraphData | null;
}

export const AttackGraphView: React.FC<AttackGraphViewProps> = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState<AttackNodeData | null>(null);

  if (!graphData) return <div className="p-6 text-slate-400">Loading attack graph data...</div>;

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node.data as unknown as AttackNodeData);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* View Header */}
      <div className="p-4 bg-[#111827] border-b border-[#1e293b] flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-100 text-sm tracking-wide flex items-center gap-2">
            <GitGraph className="w-4 h-4 text-indigo-400" /> RECONSTRUCTED FORENSIC ATTACK GRAPH
          </h2>
          <p className="text-xs text-slate-400">
            Entity relationships and missing telemetry gaps mapped across the Shadow Hospital topology.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Compromised ({graphData.summary.compromised_nodes.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Suspicious ({graphData.summary.suspicious_nodes.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-300">Normal</span>
          </div>
        </div>
      </div>

      {/* Canvas & Drawer Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 bg-[#0b0f19]">
          <ReactFlow
            nodes={graphData.nodes as unknown as Node[]}
            edges={graphData.edges as unknown as Edge[]}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            className="bg-[#0b0f19]"
          >
            <Background color="#1e293b" gap={24} size={1} />
            <Controls className="bg-[#111827] border border-[#1e293b] text-slate-300 fill-slate-300" />
          </ReactFlow>
        </div>

        {/* Sliding Detail Inspector Drawer */}
        <NodeDetailDrawer
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>
    </div>
  );
};
