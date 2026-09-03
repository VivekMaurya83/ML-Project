import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, Table, BarChart2, ShieldAlert } from 'lucide-react';

export default function ModelEvaluation({ metrics, weights }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/evaluation');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result);
          } else {
            setError('Evaluation metrics not found.');
          }
        } else {
          setError('Model training is required before evaluation metrics can be rendered.');
        }
      } catch (err) {
        setError('Could not connect to the backend server. Verify it is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [metrics, weights]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading model validation metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div className="alert alert-warning" style={{ display: 'inline-flex', maxWidth: '600px' }}>
          <ShieldAlert size={16} />
          <div>
            <strong>Evaluation Metrics Unavailable:</strong> {error}
            <br />
            <span style={{ fontSize: '12px' }}>Please go to the <strong>Model Training</strong> tab and train the machine learning models. The metrics are calculated dynamically using real validation subsets after the models complete training.</span>
          </div>
        </div>
      </div>
    );
  }

  const modelLabels = {
    rf: "Random Forest Regressor",
    svr: "Support Vector Regressor (SVR)",
    knn: "K-Nearest Neighbors (KNN)",
    ensemble: "Weighted Averaging Ensemble"
  };

  const getMetricRow = (key) => {
    const m = data.metrics[key];
    if (!m) return { name: modelLabels[key], mae: 'N/A', rmse: 'N/A', r2: 'N/A' };
    return {
      key: key,
      name: modelLabels[key],
      mae: m.mae.toFixed(2),
      rmse: m.rmse.toFixed(2),
      r2: (m.r2 * 100).toFixed(2) + "%",
      r2Val: m.r2,
      weight: data.weights?.[key] ? (data.weights[key] * 100).toFixed(1) + "%" : (key === 'ensemble' ? "N/A" : "0%")
    };
  };

  const rows = [
    getMetricRow('rf'),
    getMetricRow('svr'),
    getMetricRow('knn'),
    getMetricRow('ensemble')
  ];

  // Format data for Recharts
  const chartData = [
    {
      name: 'Random Forest',
      MAE: data.metrics.rf.mae,
      RMSE: data.metrics.rf.rmse,
      R2: data.metrics.rf.r2 * 100
    },
    {
      name: 'SVR',
      MAE: data.metrics.svr.mae,
      RMSE: data.metrics.svr.rmse,
      R2: data.metrics.svr.r2 * 100
    },
    {
      name: 'KNN',
      MAE: data.metrics.knn.mae,
      RMSE: data.metrics.knn.rmse,
      R2: data.metrics.knn.r2 * 100
    },
    {
      name: 'Weighted Ensemble',
      MAE: data.metrics.ensemble.mae,
      RMSE: data.metrics.ensemble.rmse,
      R2: data.metrics.ensemble.r2 * 100
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Model Evaluation</h2>
        <p className="page-subtitle">Compare performance metrics of individual regressors and the Weighted Averaging Ensemble model.</p>
      </div>

      <div className="section-card" style={{ marginBottom: '24px' }}>
        <h3 className="section-title"><Table size={16} style={{ color: 'var(--accent-primary)' }} /> Performance Comparison Table</h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Model Architecture</th>
                <th style={{ textAlign: 'right' }}>Mean Absolute Error (MAE)</th>
                <th style={{ textAlign: 'right' }}>Root Mean Squared Error (RMSE)</th>
                <th style={{ textAlign: 'right' }}>Coefficient of Determination (R²)</th>
                <th style={{ textAlign: 'right' }}>Validation Weight</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} style={row.key === 'ensemble' ? { backgroundColor: 'rgba(30,64,175,0.05)', fontWeight: 'bold' } : {}}>
                  <td>{row.name}</td>
                  <td style={{ textAlign: 'right' }}>{row.mae}</td>
                  <td style={{ textAlign: 'right' }}>{row.rmse}</td>
                  <td style={{ textAlign: 'right', color: row.key === 'ensemble' ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{row.r2}</td>
                  <td style={{ textAlign: 'right', color: 'var(--accent-indigo)' }}>{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title"><BarChart2 size={16} style={{ color: 'var(--accent-primary)' }} /> Accuracy Comparison (R² Score)</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            R² represents the percentage of variance in demand explained by the model's features. Higher is better (Target: 100%).
          </p>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="R2" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} name="R² Score (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title"><BarChart2 size={16} style={{ color: 'var(--accent-amber)' }} /> Error Metrics Comparison (MAE & RMSE)</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            MAE and RMSE measure prediction errors in the original orders scale. Lower is better.
          </p>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Legend verticalAlign="top" height={36} iconSize={12} iconType="circle" />
                <Bar dataKey="MAE" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RMSE" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '24px' }}>
        <h3 className="section-title"><Award size={16} style={{ color: 'var(--accent-primary)' }} /> Ensemble Weighting Methodology</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Rather than assigning arbitrary weights or taking a simple average, this application utilizes the <strong>validation Root Mean Squared Error (RMSE)</strong> to dynamically calibrate model weights. 
          Models with lower errors (better performance) receive proportionally higher weights.
        </p>
        <div style={{ display: 'flex', gap: '30px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', flex: '1 1 200px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Random Forest Weight</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)', marginTop: '4px' }}>
              {(data.weights?.rf * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>RMSE: {data.metrics.rf.rmse.toFixed(2)}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', flex: '1 1 200px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Support Vector Regressor Weight</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-indigo)', marginTop: '4px' }}>
              {(data.weights?.svr * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>RMSE: {data.metrics.svr.rmse.toFixed(2)}</div>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', flex: '1 1 200px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>KNN Regressor Weight</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-amber)', marginTop: '4px' }}>
              {(data.weights?.knn * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>RMSE: {data.metrics.knn.rmse.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
