import React from 'react';
import { GitPullRequest, Code, Award, Compass } from 'lucide-react';

export default function ModelInfo() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Predictive Model Documentation</h2>
        <p className="page-subtitle">Detailed equations, optimization strategies, and analytical properties of the forecasting models.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Random Forest Card */}
        <div className="section-card">
          <h3 className="section-title"><GitPullRequest size={18} style={{ color: 'var(--accent-primary)' }} /> 1. Random Forest Regressor</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Random Forest is an ensemble learning method that constructs a multitude of independent decision trees during training and outputs the average prediction of the individual trees. It uses two key techniques:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Bootstrap Aggregation (Bagging):</strong> Each tree is trained on a random bootstrap sample of the dataset (drawn with replacement). This reduces model variance.</li>
            <li><strong>Feature Randomness:</strong> When splitting a node, only a random subset of features is considered, ensuring individual trees are decorrelated.</li>
          </ul>
          
          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Mathematical Formulation</span>
            
            {/* HTML Styled Equation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'Georgia, serif', fontSize: '18px', margin: '16px 0', color: 'var(--text-primary)' }}>
              <span>ŷ = </span>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', marginRight: '4px' }}>
                <span style={{ borderBottom: '1px solid var(--text-primary)', padding: '0 4px', fontSize: '14px' }}>1</span>
                <span style={{ fontSize: '14px' }}>B</span>
              </div>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
                <span style={{ fontSize: '10px', lineHeight: 1 }}>B</span>
                <span style={{ fontSize: '26px', lineHeight: 1, margin: '2px 0' }}>∑</span>
                <span style={{ fontSize: '10px', lineHeight: 1 }}>b=1</span>
              </div>
              <span style={{ marginLeft: '4px' }}>T<sub>b</sub>(x)</span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              Where <strong>B</strong> is the number of decision trees (set to 100), and <strong>T<sub>b</sub>(x)</strong> is the prediction of the b-th decision tree on the input feature vector <strong>x</strong>.
            </p>
          </div>
        </div>

        {/* Support Vector Regressor Card */}
        <div className="section-card">
          <h3 className="section-title"><Code size={18} style={{ color: 'var(--accent-primary)' }} /> 2. Support Vector Regressor (SVR)</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Support Vector Regression finds a function that has at most <strong>ε</strong> deviation from the actual target values for all training data, while being as flat as possible. It is highly robust to outliers that lie within this ε-insensitive tube.
            Because the relationship between food features and demand is non-linear, we utilize the <strong>Radial Basis Function (RBF) Kernel</strong>, which maps input data into an infinite-dimensional feature space.
          </p>
          
          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>RBF Kernel Equation</span>
            
            {/* HTML Styled Equation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontFamily: 'Georgia, serif', fontSize: '18px', margin: '16px 0', color: 'var(--text-primary)' }}>
              <span>K(x, x') = exp( -γ ||x - x'||<sup>2</sup> )</span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              SVR is highly sensitive to features with different ranges. Therefore, fitting SVR requires all input features to be standardized using a <strong>StandardScaler</strong>.
            </p>
          </div>
        </div>

        {/* KNN Regressor Card */}
        <div className="section-card">
          <h3 className="section-title"><Compass size={18} style={{ color: 'var(--accent-primary)' }} /> 3. K-Nearest Neighbors (KNN) Regressor</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            KNN Regressor is a non-parametric, instance-based algorithm. To predict the demand for a given query, it identifies the <strong>K</strong> closest historical records in the multi-dimensional feature space (using Euclidean distance) and averages their target values.
            We use **distance-weighted voting**, meaning closer neighbors exert a higher influence on the prediction than neighbors further away.
          </p>
          
          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Distance-Weighted Formula</span>
            
            {/* HTML Styled Equation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'Georgia, serif', fontSize: '18px', margin: '16px 0', color: 'var(--text-primary)' }}>
              <span>ŷ = </span>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
                <span style={{ borderBottom: '1px solid var(--text-primary)', padding: '0 6px', fontSize: '15px' }}>∑ w<sub>i</sub> y<sub>i</sub></span>
                <span style={{ fontSize: '15px' }}>∑ w<sub>i</sub></span>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                where w<sub>i</sub> = 1 / d(x, x<sub>i</sub>)
              </span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              Where <strong>d(x, x<sub>i</sub>)</strong> represents the Euclidean distance between query <strong>x</strong> and neighbor <strong>x<sub>i</sub></strong>. Distance metrics are scale-sensitive, requiring standard scaling before evaluation.
            </p>
          </div>
        </div>

        {/* Weighted Ensemble Card */}
        <div className="section-card">
          <h3 className="section-title"><Award size={18} style={{ color: 'var(--accent-primary)' }} /> 4. Weighted Averaging Ensemble Model</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Ensemble methods combine predictions from multiple base models to produce a more robust forecast that is less susceptible to individual bias or variance. 
            Rather than a simple average, our ensemble weights each model based on its **Root Mean Squared Error (RMSE)** on the validation set.
          </p>
          
          <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>Ensemble Calibration Formula</span>
            
            {/* HTML Styled Equations */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', fontFamily: 'Georgia, serif', fontSize: '18px', margin: '16px 0', color: 'var(--text-primary)' }}>
              <div>
                <span>P<sub>ensemble</sub> = w<sub>rf</sub> P<sub>rf</sub> + w<sub>svr</sub> P<sub>svr</sub> + w<sub>knn</sub> P<sub>knn</sub></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>w<sub>i</sub> = </span>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle' }}>
                  <span style={{ borderBottom: '1px solid var(--text-primary)', padding: '0 6px', fontSize: '14px' }}>1 / RMSE<sub>i</sub></span>
                  <span style={{ fontSize: '14px' }}>∑ ( 1 / RMSE<sub>j</sub> )</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', textAlign: 'center' }}>
              This mathematically guarantees that the model with the lowest validation error receives the highest weight, and all weights sum to exactly 1.0.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
