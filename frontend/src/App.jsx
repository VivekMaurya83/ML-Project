import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  BarChart4, 
  Cpu, 
  LineChart, 
  Send, 
  Info,
  ServerCrash
} from 'lucide-react';

// Import Pages
import Dashboard from './pages/Dashboard';
import DatasetManagement from './pages/DatasetManagement';
import DataPreprocessing from './pages/DataPreprocessing';
import EDA from './pages/EDA';
import ModelTraining from './pages/ModelTraining';
import ModelEvaluation from './pages/ModelEvaluation';
import Prediction from './pages/Prediction';
import ModelInfo from './pages/ModelInfo';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // App States synchronized from backend
  const [stats, setStats] = useState(null);
  const [isPreprocessed, setIsPreprocessed] = useState(false);
  const [isTrained, setIsTrained] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [weights, setWeights] = useState(null);

  // Cache preprocessing values on frontend to avoid losing choices when switching tabs
  const [preprocessState, setPreprocessState] = useState({
    sampleSize: 10000,
    valSplit: 0.2,
    successMsg: '',
    stats: null
  });

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/stats');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStats(result.stats);
          setIsPreprocessed(result.preprocessed);
          setIsTrained(result.is_trained);
          setBackendConnected(true);

          if (result.is_trained) {
            // Load metrics and weights if trained
            await fetchEvaluationData();
          }
        }
      } else {
        setBackendConnected(false);
      }
    } catch (err) {
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluationData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/evaluation');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMetrics(result.metrics);
          setWeights(result.weights);
        }
      }
    } catch (err) {
      console.error("Failed to load evaluation data", err);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    // Set a recurring check in the background for backend health
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePreprocessComplete = (prepData) => {
    setPreprocessState(prepData);
    setIsPreprocessed(true);
    // reload stats (e.g. categories count, shapes etc)
    checkBackendStatus();
  };

  const handleTrainingComplete = async () => {
    setIsTrained(true);
    await fetchEvaluationData();
    checkBackendStatus();
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dataset', label: 'Dataset Management', icon: Database },
    { id: 'preprocessing', label: 'Data Preprocessing', icon: Settings },
    { id: 'eda', label: 'Exploratory Analysis', icon: BarChart4 },
    { id: 'training', label: 'Model Training', icon: Cpu },
    { id: 'evaluation', label: 'Model Evaluation', icon: LineChart },
    { id: 'prediction', label: 'Ensemble Prediction', icon: Send },
    { id: 'modelinfo', label: 'Model Reference', icon: Info },
  ];

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Initializing Food Demand Forecasting System...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="sidebar-title">
            OptiFlow
            <div style={{ fontSize: '10px', fontWeight: '500', color: 'var(--text-secondary)' }}>Demand Planner</div>
          </div>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => setActiveTab(item.id)} 
                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>OptiFlow Systems</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>v1.2.0 (Active)</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {!backendConnected && (
          <div className="alert alert-warning" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'var(--accent-red)', color: '#fca5a5', marginBottom: '24px' }}>
            <ServerCrash size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Backend Connection Offline:</strong> Cannot reach the FastAPI server at <code>http://localhost:8000</code>.
              <br />
              <span style={{ fontSize: '12px' }}>Please make sure you launch the backend by running the FastAPI server. It is required to process the CSV datasets, train models, and generate predictions.</span>
            </div>
          </div>
        )}

        {/* Tab Switching */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            metrics={metrics} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'dataset' && (
          <DatasetManagement stats={stats} />
        )}

        {activeTab === 'preprocessing' && (
          <DataPreprocessing 
            stats={stats}
            preprocessState={preprocessState}
            onPreprocessComplete={handlePreprocessComplete}
          />
        )}

        {activeTab === 'eda' && (
          <EDA />
        )}

        {activeTab === 'training' && (
          <ModelTraining 
            isPreprocessed={isPreprocessed}
            isTrained={isTrained}
            onTrainingComplete={handleTrainingComplete}
          />
        )}

        {activeTab === 'evaluation' && (
          <ModelEvaluation 
            metrics={metrics} 
            weights={weights} 
          />
        )}

        {activeTab === 'prediction' && (
          <Prediction isTrained={isTrained} />
        )}

        {activeTab === 'modelinfo' && (
          <ModelInfo />
        )}
      </main>
    </div>
  );
}
