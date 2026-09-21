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
  ServerCrash,
  Download,
  Activity,
  Layers,
  CheckCircle2,
  ChevronRight
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
    checkBackendStatus();
  };

  const handleTrainingComplete = async () => {
    setIsTrained(true);
    await fetchEvaluationData();
    checkBackendStatus();
  };

  // Grouped Menu Sections
  const menuSections = [
    {
      title: "Data Platform",
      items: [
        { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'dataset', label: 'Dataset Ingestion', icon: Database },
        { id: 'preprocessing', label: '8-Stage Pipeline', icon: Settings },
        { id: 'eda', label: 'Exploratory Analytics', icon: BarChart4 },
      ]
    },
    {
      title: "Machine Learning",
      items: [
        { id: 'training', label: 'Model Training Studio', icon: Cpu },
        { id: 'evaluation', label: 'Validation & Weights', icon: LineChart },
        { id: 'prediction', label: 'Operational Predictor', icon: Send },
      ]
    },
    {
      title: "System Reference",
      items: [
        { id: 'modelinfo', label: 'Model Architecture', icon: Info },
      ]
    }
  ];

  // Helper to find active tab title
  const getActiveTabTitle = () => {
    for (const sec of menuSections) {
      const match = sec.items.find(i => i.id === activeTab);
      if (match) return match.label;
    }
    return 'Dashboard';
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Connecting to OptiFlow Enterprise Kernel...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div className="sidebar-title">OptiFlow ML</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '600' }}>Enterprise Demand v2.4</div>
          </div>
        </div>

        <nav style={{ flexGrow: 1, overflowY: 'auto' }}>
          {menuSections.map((sec, idx) => (
            <div key={idx} style={{ marginBottom: '12px' }}>
              <div className="sidebar-section-title">{sec.title}</div>
              <ul className="sidebar-menu">
                {sec.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button 
                        onClick={() => setActiveTab(item.id)} 
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                        style={{ width: '100%', background: 'none', textAlign: 'left' }}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: '650', color: 'var(--text-primary)' }}>Kernel Node</span>
            <span className="badge badge-success">Port 8000</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>
            FastAPI 0.110 · Python 3.12
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper with Enterprise Topbar */}
      <div className="main-wrapper">
        <header className="top-navbar">
          <div className="breadcrumbs">
            <span className="breadcrumb-root">OptiFlow Core</span>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <span style={{ color: 'var(--text-muted)' }}>Supply Forecasting</span>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{getActiveTabTitle()}</span>
          </div>

          <div className="top-navbar-actions">
            <div className="status-pill">
              <span className={`status-indicator ${backendConnected ? 'online' : 'training'}`}></span>
              <span>{backendConnected ? 'Backend Connected' : 'Connecting...'}</span>
            </div>

            <div className="status-pill" style={{ display: 'none', mdDisplay: 'flex' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ingested:</span>
              <span style={{ fontWeight: '700' }}>{stats?.train_rows?.toLocaleString() || '456,548'}</span>
            </div>

            <a 
              href="http://localhost:8000/api/preprocess/download" 
              download
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}
              title="Download preprocessed engineered dataset as CSV"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </a>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {!backendConnected && (
            <div className="alert alert-warning" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3', color: '#9f1239', marginBottom: '20px' }}>
              <ServerCrash size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Backend Connection Offline:</strong> Cannot reach the FastAPI server at <code>http://localhost:8000</code>.
                <br />
                <span style={{ fontSize: '11.5px' }}>Ensure the backend server is running in your terminal (<code>uvicorn main:app --reload</code>).</span>
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
    </div>
  );
}
