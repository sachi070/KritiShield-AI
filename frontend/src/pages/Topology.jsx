import { motion } from 'framer-motion';
import { Server, Database, Router, Shield, Wifi, Network } from 'lucide-react';
import { useState, useEffect } from 'react';

const staticNodeConfig = {
  "DMZ-Gateway-01": { x: '50%', y: '25%', icon: Router, type: 'router', label: 'DMZ Router' },
  "Web-Prod-App": { x: '30%', y: '50%', icon: Server, type: 'server', label: 'Web Server' },
  "Core-DB-Primary": { x: '50%', y: '70%', icon: Database, type: 'db', label: 'Core DB' },
  "Auth-Vault-01": { x: '70%', y: '50%', icon: Shield, type: 'server', label: 'Auth Vault' },
  "Workstation-Admin": { x: '20%', y: '80%', icon: Wifi, type: 'sensor', label: 'Admin Workstation' },
};

const Topology = () => {
  const [topology, setTopology] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchTopology = async () => {
    try {
      const res = await fetch('/api/assets/topology');
      const data = await res.json();
      setTopology(data);
      
      // Update selected node state if it's currently open
      if (selectedNode) {
        const updated = data.nodes.find(n => n.id === selectedNode.id);
        if (updated) {
          setSelectedNode(updated);
        }
      }
    } catch (err) {
      console.error("Error fetching topology:", err);
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 4000);
    return () => clearInterval(interval);
  }, [selectedNode]);

  const isolateNode = async (nodeId) => {
    try {
      const res = await fetch(`/api/assets/${nodeId}/isolate`, {
        method: 'POST'
      });
      if (res.ok) {
        alert("Containment engaged. Node isolated from network segment.");
        fetchTopology();
      } else {
        alert("Failed to isolate node.");
      }
    } catch (err) {
      console.error("Error isolating node:", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-neon-green border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.4)]';
      case 'isolated': return 'text-yellow-400 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]';
      case 'compromised': return 'text-neon-red border-neon-red shadow-[0_0_15px_rgba(255,0,60,0.6)] animate-pulse';
      default: return 'text-neon-cyan border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]';
    }
  };

  const getBgColor = (status) => {
    switch(status) {
      case 'active': return 'bg-neon-green/10';
      case 'isolated': return 'bg-yellow-400/10';
      case 'compromised': return 'bg-neon-red/20';
      default: return 'bg-neon-cyan/10';
    }
  };

  // Map backend topology nodes to visual component node representations
  const visualNodes = topology.nodes.map(node => {
    const config = staticNodeConfig[node.label] || { x: '50%', y: '50%', icon: Server, type: 'server', label: node.label };
    return {
      ...node,
      x: config.x,
      y: config.y,
      icon: config.icon,
      displayLabel: config.label
    };
  });

  const getLineCoordinates = (edge) => {
    const fromNode = visualNodes.find(n => n.id === edge.from);
    const toNode = visualNodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return null;
    return {
      x1: fromNode.x,
      y1: fromNode.y,
      x2: toNode.x,
      y2: toNode.y
    };
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full max-w-7xl mx-auto pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Network Topology</h1>
          <p className="text-gray-400 text-sm">Visual asset map and physical infrastructure layer (computed dynamically)</p>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-[500px]">
        {/* Map Area */}
        <div className="glass-panel flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-panel-bg to-bg-dark">
          {/* Background Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          {visualNodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center gap-2 z-10`}
              style={{ left: node.x, top: node.y }}
              onClick={() => setSelectedNode(node)}
              whileHover={{ scale: 1.1 }}
            >
              <div className={`p-4 rounded-full border-2 backdrop-blur-md ${getStatusColor(node.status)} ${getBgColor(node.status)}`}>
                <node.icon size={24} />
              </div>
              <span className="text-xs font-mono font-semibold bg-bg-dark/80 px-2 py-1 rounded border border-panel-border">{node.displayLabel}</span>
            </motion.div>
          ))}

          {/* Dynamically draw NetworkX calculated edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-35">
            {topology.edges.map((edge, idx) => {
              const coords = getLineCoordinates(edge);
              if (!coords) return null;
              return (
                <line 
                  key={idx}
                  x1={coords.x1} 
                  y1={coords.y1} 
                  x2={coords.x2} 
                  y2={coords.y2} 
                  stroke="#00f0ff" 
                  strokeWidth="2" 
                  strokeDasharray="5,5" 
                />
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        {selectedNode ? (
          <div className="w-80 glass-panel p-6 flex flex-col gap-6 animate-fade-in-right">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg border ${getStatusColor(selectedNode.status)} ${getBgColor(selectedNode.status)}`}>
                {(() => {
                  const IconComp = staticNodeConfig[selectedNode.label]?.icon || Server;
                  return <IconComp size={32} />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {staticNodeConfig[selectedNode.label]?.label || selectedNode.label}
                </h3>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{selectedNode.type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Operational Status</p>
                <p className={`font-mono uppercase font-bold text-lg ${
                  selectedNode.status === 'active' ? 'text-neon-green' : selectedNode.status === 'isolated' ? 'text-yellow-400' : 'text-neon-red'
                }`}>
                  {selectedNode.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">IP Address</p>
                <p className="font-mono text-white">{selectedNode.ip || '10.0.0.x'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Zone Segment</p>
                <p className="font-mono text-white">{selectedNode.zone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Vulnerability Score</p>
                <p className="font-mono text-white">{selectedNode.vulnerability_score}</p>
              </div>
            </div>

            <div className="mt-auto space-y-3">
              {selectedNode.status !== 'isolated' ? (
                <button 
                  onClick={() => isolateNode(selectedNode.id)}
                  className="w-full btn-neon-red py-3 text-sm tracking-wide font-bold"
                >
                  ISOLATE NODE
                </button>
              ) : (
                <span className="w-full block text-center py-3 border border-neon-green text-neon-green text-sm font-bold rounded bg-neon-green/10">
                  NODE ISOLATED
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-80 glass-panel p-6 flex flex-col items-center justify-center text-center border-dashed border-gray-600/50">
            <Network className="text-gray-600 mb-4" size={48} />
            <p className="text-gray-400">Select a node on the map to view details and control options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topology;
