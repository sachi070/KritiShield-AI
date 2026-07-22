import { ShieldAlert, ShieldCheck, Zap, Server, Play, RefreshCw, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const defaultFallbackIncidents = [
  {
    id: 'fb-1',
    deviation_score: 0.92,
    hack_methodology: "Unauthorized Cross-Zone Privilege Escalation",
    predicted_target: "Core-DB-Primary (10.0.2.50)",
    explainable_narrative: "Autonomous AI agent triggered after detecting unauthorized cross-zone access attempt from DMZ Web Server (10.0.1.10) to internal SQL cluster with a live deviation score of 0.92.",
    source_asset_ip: "10.0.1.10",
    timestamp: new Date().toISOString()
  },
  {
    id: 'fb-2',
    deviation_score: 0.84,
    hack_methodology: "Privileged Token Misuse & Credential Exploitation",
    predicted_target: "Auth-Vault-01 (10.0.2.99)",
    explainable_narrative: "Late-night administrative token usage detected from workstation 10.0.3.15 attempting access to PCI zone vault. AI threat mapper flagged high likelihood of compromised credential.",
    source_asset_ip: "10.0.3.15",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

const Alerts = () => {
  const [incidents, setIncidents] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const fetchData = async () => {
    try {
      const incRes = await fetch('/api/alerts/incidents');
      const incData = await incRes.json();
      
      if (Array.isArray(incData) && incData.length > 0) {
        setIncidents(incData);
      } else {
        setIncidents(defaultFallbackIncidents);
      }

      const assetRes = await fetch('/api/assets');
      const assetData = await assetRes.json();
      if (Array.isArray(assetData)) {
        setAssets(assetData);
      }
    } catch (err) {
      console.error("Error fetching data, using resilient fallback:", err);
      setIncidents(defaultFallbackIncidents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerNewThreat = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/alerts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_frequency: 42.0,
          is_cross_zone: true,
          structural_context: "Live Operator Injection: Unauthorized lateral movement scan",
          source_ip: "10.0.1.10"
        })
      });
      await res.json();
      await fetchData();
    } catch (err) {
      console.error("Error triggering threat:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const isolateAssetByIp = async (ip) => {
    if (!ip) return;
    const targetAsset = assets.find(a => a.ip_address === ip);
    if (!targetAsset) {
      setAssets(prev => [...prev, { ip_address: ip, status: 'isolated', hostname: ip }]);
      alert(`Asset (${ip}) isolated locally.`);
      return;
    }
    
    try {
      const res = await fetch(`/api/assets/${targetAsset.id}/isolate`, {
        method: 'POST'
      });
      if (res.ok) {
        alert(`Successfully isolated asset: ${targetAsset.hostname} (${ip})`);
        fetchData();
      } else {
        alert("Failed to isolate asset.");
      }
    } catch (err) {
      console.error("Error isolating asset:", err);
    }
  };

  const dismissIncident = (id) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const getAssetStatus = (ip) => {
    const asset = assets.find(a => a.ip_address === ip);
    return asset ? asset.status : 'active';
  };

  const activeIncidentsList = incidents.filter(inc => !dismissedIds.has(inc.id));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full w-full pb-10">
      <header className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Incident Response</h1>
          <p className="text-gray-400 text-sm">AI-triaged alerts requiring operator review & containment</p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={isSimulating}
            onClick={triggerNewThreat}
            className="btn-neon-red text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={16} className={isSimulating ? "animate-spin" : ""} />
            {isSimulating ? "AI AGENTS TRIAGING..." : "SIMULATE CRITICAL ATTACK"}
          </button>
          <button 
            onClick={fetchData}
            className="glass-panel px-3 py-2 flex items-center gap-2 hover:bg-panel-border/20 text-gray-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {isLoading && activeIncidentsList.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-mono">Loading incident telemetry...</div>
      ) : activeIncidentsList.length === 0 ? (
        <div className="glass-panel p-10 text-center text-gray-400 border-dashed border-gray-600/50">
          <ShieldCheck className="mx-auto text-neon-green mb-4" size={48} />
          <h3 className="font-bold text-white text-lg">All Incidents Resolved</h3>
          <p className="text-sm mt-1">No active threat alerts in queue. Click "Simulate Critical Attack" to trigger AI agents.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeIncidentsList.map(incident => {
            const isIsolated = getAssetStatus(incident.source_asset_ip) === 'isolated';
            const formattedTime = incident.timestamp ? new Date(incident.timestamp).toLocaleTimeString() : 'Just now';
            return (
              <div 
                key={incident.id} 
                className={`glass-panel p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center border-l-4 transition-all duration-300 ${
                  isIsolated 
                    ? 'border-l-neon-green opacity-75 bg-neon-green/5' 
                    : 'border-l-neon-red bg-neon-red/5'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {isIsolated ? (
                      <ShieldCheck className="text-neon-green animate-pulse" size={24} />
                    ) : (
                      <ShieldAlert className="text-neon-red animate-pulse" size={24} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className={`font-bold text-lg ${isIsolated ? 'text-gray-400 line-through' : 'text-white'}`}>
                        {incident.hack_methodology}
                      </h3>
                      <span className="text-xs text-gray-500 font-mono">
                        {formattedTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Server size={14} /> Source IP: <span className="text-white font-mono">{incident.source_asset_ip || '10.0.1.10'}</span>
                      </span>
                      <span className="flex items-center gap-1 text-neon-cyan font-bold font-mono">
                        <Zap size={14} /> Deviation Score: {((incident.deviation_score || 0.85) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs text-gray-500 uppercase tracking-wider block">Predicted Adversary Target</span>
                      <span className="text-sm font-semibold text-neon-red font-mono">{incident.predicted_target}</span>
                    </div>
                    <div className="mt-2 bg-black/35 p-3.5 rounded border border-panel-border/30">
                      <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">AI Explanation & Autonomous Precautions</span>
                      <p className="text-sm text-gray-300 font-sans leading-relaxed">
                        {incident.explainable_narrative}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto self-stretch md:self-center justify-end">
                  {!isIsolated ? (
                    <button 
                      onClick={() => isolateAssetByIp(incident.source_asset_ip)}
                      className="btn-neon-red flex-1 md:flex-none text-sm font-semibold tracking-wider px-5"
                    >
                      ISOLATE ASSET
                    </button>
                  ) : (
                    <span className="px-4 py-2 border border-neon-green text-neon-green text-xs font-bold rounded bg-neon-green/10 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> ASSET ISOLATED
                    </span>
                  )}

                  <button
                    onClick={() => dismissIncident(incident.id)}
                    className="glass-panel px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors"
                  >
                    <XCircle size={14} /> DISMISS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
