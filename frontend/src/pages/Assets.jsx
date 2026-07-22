import { useState, useEffect } from 'react';
import { Server, ShieldCheck, ShieldAlert, Cpu, Network, Search, AlertCircle } from 'lucide-react';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error("Error fetching assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleIsolate = async (id, hostname) => {
    if (!confirm(`Are you sure you want to isolate the asset: ${hostname}?`)) return;
    try {
      const res = await fetch(`/api/assets/${id}/isolate`, {
        method: 'POST'
      });
      if (res.ok) {
        alert(`${hostname} isolated successfully.`);
        fetchAssets();
      } else {
        alert("Failed to isolate asset.");
      }
    } catch (err) {
      console.error("Error isolating asset:", err);
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.ip_address.includes(searchTerm) ||
    asset.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full w-full pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Asset Directory</h1>
          <p className="text-gray-400 text-sm">Monitored infrastructure nodes and current operational state</p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="glass-panel p-4 flex items-center gap-3">
        <Search className="text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search by hostname, IP address, or network zone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 outline-0 text-white placeholder-gray-500 w-full text-sm font-sans"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-mono">Querying asset registry...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="glass-panel p-10 text-center text-gray-400 border-dashed border-gray-600/50">
          <AlertCircle className="mx-auto text-gray-500 mb-4" size={48} />
          <h3 className="font-bold text-white text-lg">No Assets Found</h3>
          <p className="text-sm mt-1">No infrastructure nodes match your search query.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full border-collapse text-left text-sm text-gray-400">
            <thead className="bg-panel-bg text-gray-300 font-semibold border-b border-panel-border/30">
              <tr>
                <th className="px-6 py-4">Node / Hostname</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Asset Type</th>
                <th className="px-6 py-4">Network Zone</th>
                <th className="px-6 py-4 text-center">Vulnerability Score</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Containment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border/25">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                    <Cpu size={16} className="text-neon-cyan" />
                    {asset.hostname}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{asset.ip_address}</td>
                  <td className="px-6 py-4">{asset.asset_type}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded border border-panel-border/30 bg-panel-bg font-mono">
                      {asset.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-semibold">
                    <span className={asset.vulnerability_score > 0.6 ? "text-neon-red font-bold" : asset.vulnerability_score > 0.3 ? "text-yellow-400" : "text-neon-green"}>
                      {asset.vulnerability_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {asset.status === 'active' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded bg-neon-green/10 border border-neon-green/45 text-neon-green inline-flex items-center gap-1">
                        <ShieldCheck size={12} /> ACTIVE
                      </span>
                    ) : asset.status === 'isolated' ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded bg-yellow-400/10 border border-yellow-400/45 text-yellow-400 inline-flex items-center gap-1">
                        <AlertCircle size={12} /> ISOLATED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded bg-neon-red/10 border border-neon-red/45 text-neon-red inline-flex items-center gap-1">
                        <ShieldAlert size={12} /> COMPROMISED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {asset.status !== 'isolated' ? (
                      <button 
                        onClick={() => handleIsolate(asset.id, asset.hostname)}
                        className="btn-neon-red text-xs py-1 px-3"
                      >
                        ISOLATE
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 font-mono italic">Containment Engaged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assets;
