import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Topology from './pages/Topology';
import Assets from './pages/Assets';

function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-bg-dark text-gray-200">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/topology" element={<Topology />} />
              <Route path="/devices" element={<Assets />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
