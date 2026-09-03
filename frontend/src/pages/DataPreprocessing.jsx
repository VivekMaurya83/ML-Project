import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Check, 
  Info, 
  ShieldAlert, 
  Download, 
  HardDrive, 
  Table, 
  Terminal, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function DataPreprocessing({ stats, onPreprocessComplete, preprocessState }) {
  const [sampleSize, setSampleSize] = useState(preprocessState?.sampleSize || 10000);
  const [valSplit, setValSplit] = useState(preprocessState?.valSplit || 0.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(preprocessState?.successMsg || '');
  const [preprocessStats, setPreprocessStats] = useState(preprocessState?.stats || null);
  const [executionLogs, setExecutionLogs] = useState(preprocessState?.logs || []);
  const [previewData, setPreviewData] = useState(preprocessState?.preview || null);
  const [savedFile, setSavedFile] = useState(preprocessState?.savedFile || null);
  const [activeStepIndex, setActiveStepIndex] = useState(preprocessState?.stats ? 8 : 0);

  const consoleContainerRef = useRef(null);

  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTop = consoleContainerRef.current.scrollHeight;
    }
  }, [executionLogs]);

  const pipelineStages = [
    { num: 1, title: 'Relational Merge', desc: 'Join train.csv with meal_info.csv & center_info.csv' },
    { num: 2, title: 'Feature Engineering', desc: 'Compute price_difference, discount_percent, promotion_intensity' },
    { num: 3, title: 'Reproducible Sampling', desc: 'Random sampling (random_state=42) for consistent benchmarking' },
    { num: 4, title: 'Train / Validation Split', desc: 'Partition into independent training and validation subsets' },
    { num: 5, title: 'Encoding & Scaling', desc: 'One-Hot encode categories, fit StandardScaler on numerical features' },
    { num: 6, title: 'Target Log Transform', desc: 'Apply log1p(num_orders) to normalize heavily skewed target variance' },
    { num: 7, title: 'On-Disk Persistence', desc: 'Save train_sampled_engineered.csv to backend/processed_data/' },
    { num: 8, title: 'EDA Precomputation', desc: 'Generate correlation matrix & chart histograms for instant UI loading' },
  ];

  const handlePreprocess = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setExecutionLogs(['[Initialization] Sending preprocessing request to FastAPI backend...']);
    setActiveStepIndex(1);

    // Simulate animated step progression while backend processes
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < 7 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('http://localhost:8000/api/preprocess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sample_size: Number(sampleSize),
          val_split: Number(valSplit),
        }),
      });

      const result = await response.json();
      clearInterval(stepInterval);

      if (response.ok && result.success) {
        setActiveStepIndex(8);
        setSuccessMsg(result.message);
        setPreprocessStats(result);
        setExecutionLogs(result.logs || []);
        setPreviewData({
          columns: result.preview_columns || [],
          rows: result.preview_rows || []
        });
        setSavedFile(result.saved_file || null);

        onPreprocessComplete({
          sampleSize,
          valSplit,
          successMsg: result.message,
          stats: result,
          logs: result.logs,
          preview: {
            columns: result.preview_columns || [],
            rows: result.preview_rows || []
          },
          savedFile: result.saved_file
        });
      } else {
        setError(result.detail || 'Preprocessing failed. Please try again.');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError('Could not connect to the backend server. Make sure it is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Data Preprocessing & Feature Engineering</h2>
        <p className="page-subtitle">Configure dataset parameters, inspect execution steps, and persist engineered datasets to disk.</p>
      </div>

      {/* Top Configuration & Pipeline Stages Grid */}
      <div className="section-grid">
        {/* Left: Configuration Form */}
        <div className="section-card">
          <h3 className="section-title"><Settings size={18} style={{ color: 'var(--accent-primary)' }} /> Preprocessing Configuration</h3>
          
          <div className="form-group">
            <label className="form-label">Training Sample Size</label>
            <select 
              className="form-input" 
              value={sampleSize} 
              onChange={(e) => setSampleSize(e.target.value)}
              disabled={loading}
            >
              <option value="5000">5,000 Rows (Fast Evaluation - ~2s)</option>
              <option value="10000">10,000 Rows (Standard Benchmark - Recommended)</option>
              <option value="25000">25,000 Rows (High Precision - Takes ~1-2 minutes)</option>
              <option value="50000">50,000 Rows (Production Profile - Takes ~5 minutes)</option>
              <option value="456548">456,548 Rows (Full Dataset - SVR will take several hours)</option>
            </select>
            {Number(sampleSize) > 20000 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', color: 'var(--accent-amber)', fontSize: '11px' }}>
                <ShieldAlert size={14} />
                <span>Warning: Support Vector Regressor (SVR) scales with O(N³). Sample sizes over 20,000 will slow down training significantly.</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Validation Split Ratio</label>
            <select 
              className="form-input" 
              value={valSplit} 
              onChange={(e) => setValSplit(e.target.value)}
              disabled={loading}
            >
              <option value="0.1">10% Validation, 90% Training</option>
              <option value="0.15">15% Validation, 85% Training</option>
              <option value="0.2">20% Validation, 80% Training (Standard)</option>
              <option value="0.25">25% Validation, 75% Training</option>
              <option value="0.3">30% Validation, 70% Training</option>
            </select>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              onClick={handlePreprocess}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="loading-spinner" size={16} style={{ animation: 'spin 1s infinite' }} />
                  Executing Pipeline Steps...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Execute Preprocessing Pipeline
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-warning" style={{ marginTop: '16px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginTop: '16px' }}>
              <Check size={16} />
              <div>
                <strong>Pipeline Executed Successfully!</strong> {successMsg}
                {preprocessStats?.execution_time_sec && (
                  <span className="badge badge-success" style={{ marginLeft: '8px' }}>
                    Elapsed: {preprocessStats.execution_time_sec}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pipeline Stages Tracker */}
        <div className="section-card">
          <h3 className="section-title"><Layers size={18} style={{ color: 'var(--accent-primary)' }} /> Pipeline Execution Stages</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {pipelineStages.map((stage) => {
              const isCompleted = activeStepIndex >= stage.num;
              const isActive = loading && activeStepIndex === stage.num;

              return (
                <div 
                  key={stage.num} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isActive ? '#eff6ff' : isCompleted ? '#f0fdf4' : '#f8fafc',
                    border: isActive ? '1px solid #bfdbfe' : isCompleted ? '1px solid #bbf7d0' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: isCompleted ? '#16a34a' : isActive ? 'var(--accent-primary)' : '#e2e8f0', 
                      color: isCompleted || isActive ? '#ffffff' : 'var(--text-secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 'bold', 
                      fontSize: '11px', 
                      flexShrink: 0 
                    }}
                  >
                    {isCompleted ? <Check size={14} /> : stage.num}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '12px' }}>
                      {stage.title}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '1px' }}>
                      {stage.desc}
                    </div>
                  </div>
                  <div>
                    {isCompleted ? (
                      <span className="badge badge-success" style={{ fontSize: '9px' }}>Done</span>
                    ) : isActive ? (
                      <span className="badge badge-warning" style={{ fontSize: '9px' }}>Running</span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Ready</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Pipeline Execution Console */}
      <div className="section-card" style={{ marginTop: '24px' }}>
        <h3 className="section-title"><Terminal size={18} style={{ color: 'var(--accent-primary)' }} /> Live Preprocessing Console Log</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Real-time execution trace, relational join metrics, feature transformations, and disk persistence events.
        </p>
        <div className="console-box" ref={consoleContainerRef} style={{ minHeight: '160px', maxHeight: '220px' }}>
          {executionLogs.length === 0 ? (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Console is inactive. Click "Execute Preprocessing Pipeline" to see live events.</div>
          ) : (
            executionLogs.map((log, idx) => (
              <div key={idx} className="console-line">
                {log}
              </div>
            ))
          )}
          {loading && (
            <div className="console-line" style={{ color: '#fbbf24', animation: 'pulse 1s infinite' }}>
              Transforming features and writing dataset to disk...
            </div>
          )}
        </div>
      </div>

      {/* Disk Persistence Card */}
      {savedFile && (
        <div className="section-card" style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardDrive size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Saved Dataset on Disk</h4>
                  <span className="badge badge-success">Persisted</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                  <strong>File:</strong> <code>{savedFile.filename}</code> ({savedFile.size_mb} MB / {savedFile.size_kb} KB) | <strong>Rows:</strong> {savedFile.total_rows?.toLocaleString()}
                  <br />
                  <strong>Path:</strong> <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{savedFile.path}</span>
                </div>
              </div>
            </div>

            <div>
              <a 
                href="http://localhost:8000/api/preprocess/download" 
                download="train_sampled_engineered.csv"
                className="btn btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} />
                Download Preprocessed CSV
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Preprocessed Dataset Metrics */}
      {preprocessStats && (
        <div className="section-card" style={{ marginTop: '24px' }}>
          <h3 className="section-title"><CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} /> Preprocessed Dataset Metrics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', textAlign: 'center' }}>
            <div style={{ borderRight: '1px solid var(--border-color)', padding: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Full Ingested Size</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{preprocessStats.merged_rows?.toLocaleString()} Rows</div>
            </div>
            <div style={{ borderRight: '1px solid var(--border-color)', padding: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Training Samples</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>{preprocessStats.train_rows?.toLocaleString()} Rows</div>
            </div>
            <div style={{ borderRight: '1px solid var(--border-color)', padding: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Validation Samples</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-indigo)', marginTop: '4px' }}>{preprocessStats.val_rows?.toLocaleString()} Rows</div>
            </div>
            <div style={{ padding: '10px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Encoded Features</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-amber)', marginTop: '4px' }}>{preprocessStats.num_features} Features</div>
            </div>
          </div>
        </div>
      )}

      {/* Preprocessed Data Preview Table */}
      {previewData && previewData.rows && previewData.rows.length > 0 && (
        <div className="section-card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="section-title" style={{ borderBottom: 'none', margin: 0, padding: 0 }}>
              <Table size={18} style={{ color: 'var(--accent-primary)' }} /> Preprocessed Dataset Preview (First 10 Rows)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Showing engineered columns and normalized features
            </span>
          </div>

          <div className="custom-table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  {previewData.columns.map((col, idx) => (
                    <th key={idx} style={{ whiteSpace: 'nowrap', textTransform: 'uppercase', fontSize: '11px' }}>
                      {col.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {previewData.columns.map((col, cIdx) => {
                      const val = row[col];
                      const isHighlighted = ['price_difference', 'discount_percent', 'promotion_intensity'].includes(col);
                      const isTarget = col === 'num_orders';

                      return (
                        <td 
                          key={cIdx} 
                          style={{ 
                            whiteSpace: 'nowrap',
                            fontWeight: isTarget || isHighlighted ? '600' : 'normal',
                            color: isTarget ? 'var(--accent-primary)' : isHighlighted ? 'var(--accent-emerald)' : 'var(--text-primary)',
                            background: isHighlighted ? 'rgba(21, 128, 61, 0.02)' : 'inherit'
                          }}
                        >
                          {col === 'discount_percent' ? `${Number(val) > 0 ? '+' : ''}${val}%` : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
