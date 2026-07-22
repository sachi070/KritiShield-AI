import { useState, useEffect } from 'react';
import RadarScanner from '../components/RadarScanner';
import { ShieldAlert, Server, Activity, ArrowRight, Play, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { time: '10:00', load: 45 },
  { time: '10:05', load: 52 },
  { time: '10:10', load: 38 },
  { time: '10:15', load: 65 },
  { time: '10:20', load: 48 },
  { time: '10:25', load: 75 },
  { time: '10:30', load: 55 },
];

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_assets: 0,
    isolated_assets: 0,
    active_incidents: 0,
    total_vulnerabilities: 0,
    system_health: 'Optimal'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/alerts/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerTelemetry = async (frequency, isCrossZone, context) => {
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/alerts/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_frequency: frequency,
          is_cross_zone: isCrossZone,
          structural_context: context,
          source_ip: "10.0.1.10"
        })
      });
      const data = await res.json();
      setSimResult(data);
      fetchMetrics();
    } catch (err) {
      console.error("Error processing telemetry:", err);
      setSimResult({ error: "Failed to communicate with AI security engine." });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Command Center</h1>
          <p className="text-gray-400 text-sm">Real-time surveillance & anomaly detection</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchMetrics}
            className="glass-panel px-3 py-2 flex items-center gap-2 hover:bg-panel-border/20 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={isSimulating ? "animate-spin" : ""} />
            <span className="text-xs font-semibold">REFRESH</span>
          </button>
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-neon-green">AI AGENTS ACTIVE</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Cards */}
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-semibold uppercase text-sm">Monitored Assets</h3>
            <Server className="text-neon-cyan" size={20} />
          </div>
          <p className="text-4xl font-bold neon-text-cyan">{metrics.total_assets || 5}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-neon-green">{metrics.isolated_assets} Isolated</span>
            <Link to="/topology" className="text-xs flex items-center gap-1 text-neon-cyan hover:underline">
              View Map <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className={`glass-panel p-6 flex flex-col gap-4 transition-all duration-300 ${metrics.active_incidents > 0 ? 'border-neon-red/50 bg-neon-red/5' : ''}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-semibold uppercase text-sm">Critical Anomalies</h3>
            <ShieldAlert className={metrics.active_incidents > 0 ? 'text-neon-red animate-pulse' : 'text-gray-500'} size={20} />
          </div>
          <p className={`text-4xl font-bold ${metrics.active_incidents > 0 ? 'neon-text-red' : 'text-gray-500'}`}>
            {metrics.active_incidents}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {metrics.active_incidents > 0 ? "Requires operator action" : "All assets clean"}
            </span>
            <Link to="/alerts" className="text-xs flex items-center gap-1 text-neon-red hover:underline">
              Resolve <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-400 font-semibold uppercase text-sm">System Health</h3>
            <Activity className="text-neon-cyan" size={20} />
          </div>
          <p className={`text-4xl font-bold uppercase ${metrics.system_health === 'Optimal' ? 'text-neon-green' : 'text-neon-red'}`}>
            {metrics.system_health}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">Continuous scans running</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Radar & Simulation Controls */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="glass-panel p-6 relative overflow-hidden flex flex-col items-center">
            <h2 className="text-lg font-semibold text-white mb-2 self-start">Area Scan</h2>
            <p className="text-xs text-gray-400 mb-4 self-start">Searching for unauthorized signatures...</p>
            <div className="w-full max-w-[280px]">
              <RadarScanner />
            </div>
          </div>

          {/* Simulation Console */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Threat Simulation Console</h2>
            <p className="text-xs text-gray-400">Send simulated network activity logs to the AI security engine.</p>
            
            <div className="flex flex-col gap-3 mt-2">
              <button
                disabled={isSimulating}
                onClick={() => triggerTelemetry(15.0, false, "Standard encrypted HTTPS access to Web Server")}
                className="w-full text-left p-3 rounded border border-panel-border hover:bg-panel-border/20 transition-all text-sm flex justify-between items-center group disabled:opacity-50"
              >
                <div>
                  <span className="font-semibold text-neon-green block">1. Normal Traffic</span>
                  <span className="text-xs text-gray-400 font-mono">Freq: 15.0Hz | Cross-Zone: No</span>
                </div>
                <Play size={16} className="text-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                disabled={isSimulating}
                onClick={() => triggerTelemetry(38.0, true, "Unauthorized traversal from DMZ Web Server to Core Database Zone")}
                className="w-full text-left p-3 rounded border border-neon-red/30 hover:bg-neon-red/5 transition-all text-sm flex justify-between items-center group disabled:opacity-50"
              >
                <div>
                  <span className="font-semibold text-neon-red block">2. Intrusion Traversal (Ds &gt; 0.7)</span>
                  <span className="text-xs text-gray-400 font-mono">Freq: 38.0Hz | Cross-Zone: Yes</span>
                </div>
                <Play size={16} className="text-neon-red opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>

        {/* Charts & Interactive Simulation Feedback */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Simulation Output Result */}
          {simResult && (
            <div className={`glass-panel p-6 animate-fade-in border-l-4 ${simResult.threshold_crossed ? 'border-l-neon-red bg-neon-red/5' : 'border-l-neon-green bg-neon-green/5'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">Simulation Telemetry Received</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Calculated Deviation Score: <span className={simResult.threshold_crossed ? "text-neon-red font-bold" : "text-neon-green font-bold"}>
                      {(simResult.deviation_score * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {simResult.threshold_crossed ? (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-neon-red/10 border border-neon-red text-neon-red flex items-center gap-1.5">
                      <AlertTriangle size={12} /> THRESHOLD BREACHED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-neon-green/10 border border-neon-green text-neon-green flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> STATUS OK
                    </span>
                  )}
                </div>
              </div>

              {simResult.threshold_crossed && simResult.incident_data ? (
                <div className="border-t border-panel-border/50 pt-4 mt-2 space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">AI Triage Assessment</span>
                    <span className="text-sm font-semibold text-white font-mono">{simResult.incident_data.hack_methodology}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Predicted Next Target</span>
                    <span className="text-sm font-semibold text-neon-cyan font-mono">{simResult.incident_data.predicted_target}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Explainable Narrative & Precautions</span>
                    <p className="text-sm text-gray-300 mt-1 leading-relaxed bg-black/45 p-3 rounded border border-panel-border/30 font-sans">
                      {simResult.incident_data.explainable_narrative}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-t border-panel-border/50 pt-3 text-sm text-gray-400">
                  Telemetry did not breach the alert threshold of <span className="text-white">0.70</span>. No autonomous action was required.
                </div>
              )}
            </div>
          )}

          {/* Telemetry Chart */}
          <div className="glass-panel flex-1 p-6 flex flex-col justify-between min-h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-6">Telemetry (Last 30 Mins)</h2>
            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e303a" />
                  <XAxis dataKey="time" stroke="#6b6375" fontSize={12} />
                  <YAxis stroke="#6b6375" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16171d', border: '1px solid #00f0ff', borderRadius: '8px' }}
                    itemStyle={{ color: '#00f0ff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#00f0ff" 
                    strokeWidth={2}
                    dot={{ fill: '#00f0ff', r: 4 }}
                    activeDot={{ r: 6, fill: '#fff' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
