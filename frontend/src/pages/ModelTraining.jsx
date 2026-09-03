import React, { useState, useEffect, useRef } from 'react';
import { Play, Activity, Terminal, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function ModelTraining({ isPreprocessed, isTrained, onTrainingComplete }) {
  const [status, setStatus] = useState('idle'); // 'idle', 'training', 'completed', 'error'
  const [logs, setLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const consoleEndRef = useRef(null);
  const pollingInterval = useRef(null);

  // Poll status from backend
  const checkStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/train/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
        setLogs(data.logs || []);
        
        if (data.status === 'completed') {
          clearInterval(pollingInterval.current);
          onTrainingComplete(); // notify parent component to fetch fresh metrics
        } else if (data.status === 'error') {
          clearInterval(pollingInterval.current);
          setErrorMsg('An error occurred during training. Check the logs.');
        }
      }
    } catch (err) {
      console.error("Error checking training status:", err);
    }
  };

  // Start polling when status changes to training
  useEffect(() => {
    if (status === 'training') {
      pollingInterval.current = setInterval(checkStatus, 1500);
    } else {
      clearInterval(pollingInterval.current);
    }
    return () => clearInterval(pollingInterval.current);
  }, [status]);

  // Scroll to bottom of console logs on update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Load current status on mount
  useEffect(() => {
    const fetchCurrentStatus = async () => {
      await checkStatus();
    };
    fetchCurrentStatus();
  }, []);

  const handleStartTraining = async () => {
    setStatus('training');
    setLogs(['Initiating model training request...']);
    setErrorMsg('');
    try {
      const response = await fetch('http://localhost:8000/api/train', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setStatus('training');
      } else {
        setStatus('error');
        setErrorMsg(data.detail || 'Failed to start training.');
        setLogs(prev => [...prev, `Error: ${data.detail || 'Failed to start training'}`]);
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Could not connect to the backend server.');
      setLogs(prev => [...prev, 'Error: Could not connect to the backend server.']);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Model Training</h2>
        <p className="page-subtitle">Train the traditional machine learning models and calculate weights for the ensemble.</p>
      </div>

      {!isPreprocessed && (
        <div className="alert alert-warning">
          <AlertTriangle size={16} />
          <div>
            <strong>Action Required:</strong> The dataset must be preprocessed before training models.
            <br />
            <span style={{ fontSize: '12px' }}>Please go to the <strong>Data Preprocessing</strong> tab and click "Execute Preprocessing Pipeline" first.</span>
          </div>
        </div>
      )}

      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title"><Activity size={18} style={{ color: 'var(--accent-primary)' }} /> Execution Control</h3>
          
          <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
              {status === 'idle' && <span className="badge badge-warning">Idle (Ready)</span>}
              {status === 'training' && <span className="badge badge-warning" style={{ animation: 'pulse 1.5s infinite' }}>Training In Progress</span>}
              {status === 'completed' && <span className="badge badge-success">Training Completed</span>}
              {status === 'error' && <span className="badge badge-danger">Training Failed</span>}
            </div>
            
            {isTrained && status === 'completed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--accent-primary)' }}>
                <CheckCircle size={14} />
                <span>Pre-trained models are loaded and persistent. You can retrain them if needed.</span>
              </div>
            )}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '8px' }} 
            onClick={handleStartTraining}
            disabled={!isPreprocessed || status === 'training'}
          >
            {status === 'training' ? (
              <>
                <RefreshCw className="loading-spinner" size={16} style={{ animation: 'spin 1s infinite' }} />
                Fitting Models on CPU...
              </>
            ) : (
              <>
                <Play size={16} />
                Start Regressor & Ensemble Training
              </>
            )}
          </button>

          {errorMsg && (
            <div className="alert alert-warning" style={{ marginTop: '16px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              {errorMsg}
            </div>
          )}
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            <strong>What happens when you click train?</strong>
            <ol style={{ paddingLeft: '16px', marginTop: '4px' }}>
              <li>The preprocessed, split train subset is loaded.</li>
              <li>A <strong>Random Forest Regressor</strong> is trained (100 Decision Trees).</li>
              <li>A <strong>Support Vector Regressor (SVR)</strong> is fitted using radial basis function (RBF) kernel.</li>
              <li>A <strong>K-Nearest Neighbors (KNN) Regressor</strong> is trained using inverse-distance voting.</li>
              <li>Model prediction profiles are generated on the validation split.</li>
              <li>Relative error (RMSE) is used to calculate weights dynamically for the <strong>Weighted Averaging Ensemble</strong>.</li>
            </ol>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title"><Terminal size={18} style={{ color: 'var(--accent-primary)' }} /> Live Training Console Log</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Monitor real-time training events, hyperparameters, and weight results from the Python backend.
          </p>
          <div className="console-box">
            {logs.length === 0 ? (
              <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Console is inactive. Start training to view logs.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="console-line">
                  {log}
                </div>
              ))
            )}
            {status === 'training' && (
              <div className="console-line" style={{ color: '#fbbf24', animation: 'pulse 1s infinite' }}>
                Running CPU training loops...
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
