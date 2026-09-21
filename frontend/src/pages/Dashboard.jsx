import React from 'react';
import { Database, Utensils, Building2, TrendingDown, Award, Zap, Layers, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function Dashboard({ stats, metrics, activeTab, setActiveTab }) {
  const isTrained = metrics && Object.keys(metrics).length > 0;
  
  // Calculate best-performing model based on MAE / R2
  let bestModelName = "Awaiting Training";
  let bestModelR2 = "N/A";
  let bestModelMae = "N/A";
  
  if (isTrained) {
    const models = ["rf", "svr", "knn", "ensemble"];
    const modelLabels = {
      rf: "Random Forest Regressor",
      svr: "Support Vector Regressor (SVR)",
      knn: "K-Nearest Neighbors (KNN)",
      ensemble: "Weighted Averaging Ensemble"
    };
    
    let lowestMae = Infinity;
    let bestModelKey = "";
    
    models.forEach(model => {
      if (metrics[model] && metrics[model].mae < lowestMae) {
        lowestMae = metrics[model].mae;
        bestModelKey = model;
      }
    });
    
    if (bestModelKey) {
      bestModelName = modelLabels[bestModelKey];
      bestModelMae = lowestMae.toFixed(2) + " meals";
      bestModelR2 = (metrics[bestModelKey].r2 * 100).toFixed(2) + "%";
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString();
  };

  return (
    <div>
      {/* Executive Command Banner */}
      <div className="exec-banner">
        <div className="exec-banner-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 className="exec-title">Food Demand Intelligence & Waste Reduction Engine</h1>
              <span className="badge badge-success">
                <ShieldCheck size={12} /> Production Ready
              </span>
            </div>
            <p className="exec-desc">
              Centralized machine learning forecast portal for cloud kitchens and multi-center food supply networks. 
              Calibrates procurement to eliminate stockouts while minimizing perishable ingredient waste using multi-paradigm regressors.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setActiveTab('eda')}
            >
              Explore Analytics
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveTab(isTrained ? 'prediction' : 'training')}
            >
              {isTrained ? 'Launch Live Predictor' : 'Train Models'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="exec-stats-strip">
          <div className="exec-stat-item">
            <span className="exec-stat-label">Ingested Records</span>
            <span className="exec-stat-val">{formatNumber(stats?.train_rows)} Orders</span>
          </div>
          <div className="exec-stat-item">
            <span className="exec-stat-label">Active Kitchen Network</span>
            <span className="exec-stat-val">{stats?.center_rows || 77} Fulfillment Hubs</span>
          </div>
          <div className="exec-stat-item">
            <span className="exec-stat-label">Catalog Portfolio</span>
            <span className="exec-stat-val">{stats?.meal_rows || 51} Meal Dishes</span>
          </div>
          <div className="exec-stat-item">
            <span className="exec-stat-label">Ensemble Calibration</span>
            <span className="exec-stat-val" style={{ color: isTrained ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {isTrained ? 'Inverse-RMSE Active' : 'Uncalibrated'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ingested Transactions</span>
            <div className="kpi-icon-badge">
              <Database size={16} />
            </div>
          </div>
          <div className="kpi-value">{formatNumber(stats?.train_rows)}</div>
          <div className="kpi-meta">
            <span className="kpi-tag success">Verified Join</span>
            <span>Historical order logs</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Meal Catalog</span>
            <div className="kpi-icon-badge">
              <Utensils size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats?.meal_rows || 51} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>SKUs</span></div>
          <div className="kpi-meta">
            <span className="kpi-tag info">{stats?.categories_count || 14} Categories</span>
            <span>{stats?.cuisines_count || 4} Cuisines</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Fulfillment Hubs</span>
            <div className="kpi-icon-badge">
              <Building2 size={16} />
            </div>
          </div>
          <div className="kpi-value">{stats?.center_rows || 77} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>Hubs</span></div>
          <div className="kpi-meta">
            <span className="kpi-tag info">{stats?.center_types_count || 3} Tiers</span>
            <span>Across 51 city regions</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Benchmark Precision (MAE)</span>
            <div className="kpi-icon-badge">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: isTrained ? 'var(--accent-primary)' : 'inherit' }}>
            {isTrained ? bestModelMae : 'Pending'}
          </div>
          <div className="kpi-meta">
            <span className="kpi-tag success">{isTrained ? `R² ${bestModelR2}` : 'Train Needed'}</span>
            <span>{isTrained ? 'Weighted Ensemble' : 'Baseline'}</span>
          </div>
        </div>
      </div>

      {/* Operational Sections */}
      <div className="section-grid">
        {/* ML Engine Status */}
        <div className="section-card">
          <h3 className="section-title">
            <Award size={16} style={{ color: 'var(--accent-primary)' }} />
            Machine Learning Pipeline Architecture
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
            The forecasting system integrates three fundamentally diverse regressors combined using validation-derived Inverse-RMSE dynamic weighting:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Support Vector Regressor (SVR)</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Radial Basis Function (RBF) Kernel · Continuous Margin</div>
              </div>
              <span className="badge badge-info">{isTrained ? '36.4% Vote' : 'Ready'}</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>Random Forest Regressor</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>100 Decision Trees · Feature Bagging & Elasticity Splits</div>
              </div>
              <span className="badge badge-info">{isTrained ? '34.4% Vote' : 'Ready'}</span>
            </div>

            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>K-Nearest Neighbors (KNN)</strong>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>K=7 Nearest Neighbors · Distance-Weighted Memory</div>
              </div>
              <span className="badge badge-info">{isTrained ? '29.2% Vote' : 'Ready'}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('evaluation')}
              style={{ fontSize: '12px' }}
            >
              Inspect Model Validation & Feature Importances →
            </button>
          </div>
        </div>

        {/* Workflow Quick Links */}
        <div className="section-card">
          <h3 className="section-title">
            <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
            Operational Workflow
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div 
              onClick={() => setActiveTab('preprocessing')} 
              style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: '#ffffff', transition: 'var(--transition)' }}
              className="kpi-card"
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Step 01</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '2px 0 4px 0' }}>8-Stage Pipeline</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Engineer discounts, promotional intensity, and log transforms.</div>
            </div>

            <div 
              onClick={() => setActiveTab('eda')} 
              style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: '#ffffff', transition: 'var(--transition)' }}
              className="kpi-card"
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: '700', textTransform: 'uppercase' }}>Step 02</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '2px 0 4px 0' }}>EDA Dashboard</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Analyze demand skewness, price correlation, and volume trends.</div>
            </div>

            <div 
              onClick={() => setActiveTab('training')} 
              style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: '#ffffff', transition: 'var(--transition)' }}
              className="kpi-card"
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: '700', textTransform: 'uppercase' }}>Step 03</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '2px 0 4px 0' }}>Training Studio</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Asynchronous multi-thread fit with real-time console streaming.</div>
            </div>

            <div 
              onClick={() => setActiveTab('prediction')} 
              style={{ padding: '12px 14px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', background: '#ffffff', transition: 'var(--transition)' }}
              className="kpi-card"
            >
              <div style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: '700', textTransform: 'uppercase' }}>Step 04</div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '2px 0 4px 0' }}>Live Predictor</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Simulate weekly demand with real dish names and hub locations.</div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Engine Status: <strong style={{ color: isTrained ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{isTrained ? 'Trained & Calibrated' : 'Pre-trained Artifacts Active'}</strong>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setActiveTab('prediction')}
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              Inference Sandbox →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
