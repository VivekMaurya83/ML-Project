import React from 'react';
import { Database, Utensils, Home, BarChart2, Award, Zap, Layers } from 'lucide-react';

export default function Dashboard({ stats, metrics, activeTab, setActiveTab }) {
  const isTrained = metrics && Object.keys(metrics).length > 0;
  
  // Calculate best-performing model based on R2 Score
  let bestModelName = "Not Trained Yet";
  let bestModelR2 = "N/A";
  
  if (isTrained) {
    const models = ["rf", "svr", "knn", "ensemble"];
    const modelLabels = {
      rf: "Random Forest Regressor",
      svr: "Support Vector Regressor (SVR)",
      knn: "K-Nearest Neighbors (KNN)",
      ensemble: "Weighted Averaging Ensemble"
    };
    
    let highestR2 = -Infinity;
    let bestModelKey = "";
    
    models.forEach(model => {
      if (metrics[model] && metrics[model].r2 > highestR2) {
        highestR2 = metrics[model].r2;
        bestModelKey = model;
      }
    });
    
    if (bestModelKey) {
      bestModelName = modelLabels[bestModelKey];
      bestModelR2 = (highestR2 * 100).toFixed(2) + "%";
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString();
  };

  return (
    <div>
      <div className="hero-banner">
        <h1 style={{ fontSize: '26px', marginBottom: '8px', color: 'var(--accent-primary)', fontWeight: '800', letterSpacing: '-0.02em' }}>
          Enterprise Food Demand Forecasting & Supply Optimization Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '800px', lineHeight: '1.6' }}>
          An integrated predictive analysis platform designed to forecast future order volumes and optimize operational kitchen logistics. 
          By combining Random Forest, Support Vector Regression, and K-Nearest Neighbors models with validation-driven ensemble weighting, the system supports precise resource allocation and food waste reduction.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card card-blue">
          <Database className="card-icon" style={{ color: 'var(--accent-primary)' }} />
          <span className="card-title">Dataset Size</span>
          <span className="card-value">{formatNumber(stats?.train_rows)}</span>
          <span className="card-subtitle">Historical Orders</span>
        </div>

        <div className="card card-green">
          <Utensils className="card-icon" style={{ color: 'var(--accent-emerald)' }} />
          <span className="card-title">Meal Inventory</span>
          <span className="card-value">{stats?.meal_rows || 0}</span>
          <span className="card-subtitle">{stats?.categories_count || 0} Categories | {stats?.cuisines_count || 0} Cuisines</span>
        </div>

        <div className="card card-amber">
          <Home className="card-icon" style={{ color: 'var(--accent-amber)' }} />
          <span className="card-title">Fulfillment Centers</span>
          <span className="card-value">{stats?.center_rows || 0}</span>
          <span className="card-subtitle">{stats?.center_types_count || 0} Operational Center Types</span>
        </div>

        <div className="card card-indigo">
          <BarChart2 className="card-icon" style={{ color: 'var(--accent-indigo)' }} />
          <span className="card-title">Average Demand</span>
          <span className="card-value">{stats?.average_orders ? Math.round(stats.average_orders) : 0}</span>
          <span className="card-subtitle">Orders per Week-Center-Meal</span>
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title"><Award style={{ color: 'var(--accent-amber)' }} /> Best Forecasting Model</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Model Name</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {bestModelName}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>R² Accuracy Score</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-emerald)', marginTop: '4px' }}>
                  {bestModelR2}
                </div>
              </div>
              {isTrained && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ensemble Calibration</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-indigo)', marginTop: '4px' }}>
                    Active
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setActiveTab(isTrained ? 'evaluation' : 'training')}
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                {isTrained ? 'View Evaluation Metrics' : 'Train Models Now'}
              </button>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title"><Zap style={{ color: 'var(--accent-emerald)' }} /> Quick Navigation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '8px 0' }}>
            <div 
              onClick={() => setActiveTab('preprocessing')} 
              style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
              <div style={{ fontWeight: '600', color: 'var(--accent-emerald)', marginBottom: '4px' }}>1. Preprocess</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Clean, merge and sample raw datasets.</div>
            </div>
            <div 
              onClick={() => setActiveTab('eda')} 
              style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
              <div style={{ fontWeight: '600', color: 'var(--accent-indigo)', marginBottom: '4px' }}>2. Explore EDA</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Visualize orders, categories & price relationships.</div>
            </div>
            <div 
              onClick={() => setActiveTab('training')} 
              style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
              <div style={{ fontWeight: '600', color: 'var(--accent-amber)', marginBottom: '4px' }}>3. Model Training</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Train SVR, RF & KNN with validation split.</div>
            </div>
            <div 
              onClick={() => setActiveTab('prediction')} 
              style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
            >
              <div style={{ fontWeight: '600', color: 'var(--accent-emerald)', marginBottom: '4px' }}>4. Demand Planning</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Predict demand and calculate potential excess food.</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="section-card">
        <h3 className="section-title"><Layers style={{ color: 'var(--accent-primary)' }} /> Data Ingestion & Modelling Pipeline</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          This system deploys a structured, end-to-end Machine Learning pipeline. First, raw order databases are relationally joined with meal attributes and fulfillment center profiles. Feature engineering constructs mathematical variables such as <code>price_difference</code>, <code>discount_percent</code>, and promotional intensities. Standard scaling and categorical encoding are then performed. The regression algorithms are fit on a variance-stabilizing logarithmic target distribution. Validation errors are calculated dynamically to compute optimal weights for the Weighted Averaging Ensemble, maximizing forecasting robustness.
        </p>
      </div>
    </div>
  );
}
