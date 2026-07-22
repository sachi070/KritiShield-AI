import { NavLink } from 'react-router-dom';
import { Shield, Activity, ShieldAlert, Network, Server } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Activity size={20} /> },
    { name: 'Incident Response', path: '/alerts', icon: <ShieldAlert size={20} /> },
    { name: 'Topology', path: '/topology', icon: <Network size={20} /> },
    { name: 'Assets', path: '/devices', icon: <Server size={20} /> },
  ];

  return (
    <div className="w-64 h-full bg-panel-bg backdrop-blur-xl border-r border-panel-border flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-panel-border">
        <div className="relative">
          <Shield size={32} className="text-neon-cyan" />
          <div className="absolute inset-0 bg-neon-cyan opacity-20 blur-md rounded-full animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">KRITI<span className="text-neon-cyan">SHIELD</span></h1>
          <p className="text-xs text-neon-green font-mono uppercase tracking-widest">Active</p>
        </div>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-panel-border">
        <div className="glass-panel p-4 flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#39ff14] animate-pulse"></div>
          <p className="text-xs font-mono text-gray-400 uppercase">System Status</p>
          <p className="text-sm text-neon-green font-semibold uppercase">Operational</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
