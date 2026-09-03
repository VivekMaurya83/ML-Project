import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

export default function EDA() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEDA = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/eda');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setData(result.eda);
          } else {
            setError('Failed to load EDA data.');
          }
        } else {
          setError('Backend preprocessing required before fetching EDA.');
        }
      } catch (err) {
        setError('Could not connect to the backend server. Please verify it is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchEDA();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing dataset and generating visualizations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div className="alert alert-warning" style={{ display: 'inline-flex', maxWidth: '600px' }}>
          <Info size={16} />
          <div>
            <strong>EDA Data Unavailable:</strong> {error}
            <br />
            <span style={{ fontSize: '12px' }}>Please go to the <strong>Data Preprocessing</strong> tab and run the preprocessing pipeline first. This loads the dataset files and registers the metadata required for exploratory analysis.</span>
          </div>
        </div>
      </div>
    );
  }

  // Get color for correlation matrix cell
  const getCorrColor = (val) => {
    const opacity = Math.abs(val);
    if (val > 0) {
      return `rgba(30, 64, 175, ${opacity * 0.75})`;
    } else if (val < 0) {
      return `rgba(185, 28, 28, ${opacity * 0.75})`;
    }
    return 'rgba(0, 0, 0, 0.02)';
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Exploratory Data Analysis (EDA)</h2>
        <p className="page-subtitle">Visualize distributions, trends, and relationships in the merged food-demand dataset.</p>
      </div>

      {/* Row 1: Demand Trends & Distribution */}
      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title"><TrendingUp size={16} style={{ color: 'var(--accent-emerald)' }} /> Weekly Order Quantities Trend</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.orders_over_weeks} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="week" stroke="var(--text-secondary)" fontSize={11} label={{ value: 'Week', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} label={{ value: 'Average Orders', angle: -90, position: 'insideLeft', fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Line type="monotone" dataKey="avg_orders" stroke="var(--accent-emerald)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title"><BarChart3 size={16} style={{ color: 'var(--accent-indigo)' }} /> Orders Distribution (Skewness)</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders_dist} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="bin" stroke="var(--text-secondary)" fontSize={9} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="count" fill="var(--accent-indigo)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Category and Cuisine */}
      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title">Average Orders by Meal Category</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders_by_category} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="var(--text-secondary)" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="avg_orders" fill="var(--accent-emerald)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Average Orders by Cuisine</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders_by_cuisine} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="cuisine" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="avg_orders" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Pricing & Promotions */}
      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title">Checkout Price vs Average Orders (Decile Trend)</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.price_vs_orders} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="avg_price" stroke="var(--text-secondary)" fontSize={11} label={{ value: 'Average Checkout Price (INR)', position: 'insideBottom', offset: -12, fill: 'var(--text-secondary)' }} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-indigo)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-indigo)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="avg_orders" stroke="var(--accent-indigo)" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Impact of Promotions on Weekly Orders</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.promo_vs_orders} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="type" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="avg_orders" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Top Centers & Heatmap */}
      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title">Top 15 Fulfillment Centers by Average Orders</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.orders_by_center} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="center_id" stroke="var(--text-secondary)" fontSize={10} angle={-35} textAnchor="end" height={60} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                <Bar dataKey="avg_orders" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Feature Correlation Matrix Heatmap</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Measures the linear relationship between variables (Pearson coefficient). Val of 1 means perfect correlation, -1 means perfect inverse correlation.
          </p>
          <div style={{ overflowX: 'auto', padding: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px', width: '80px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>Feature</th>
                  {data.corr_cols.map((col, idx) => (
                    <th key={idx} style={{ padding: '6px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'center', wordBreak: 'break-word' }}>
                      {col.replace('_intensity', '').replace('_difference', '_diff').replace('_percent', '_pct')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.corr_cols.map((rowCol, rIdx) => (
                  <tr key={rIdx}>
                    <td style={{ padding: '6px', fontWeight: 'bold', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      {rowCol.replace('_intensity', '').replace('_difference', '_diff').replace('_percent', '_pct')}
                    </td>
                    {data.corr_matrix[rIdx].map((val, cIdx) => (
                      <td 
                        key={cIdx} 
                        style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          fontWeight: '600', 
                          color: Math.abs(val) > 0.4 ? '#ffffff' : 'var(--text-primary)', 
                          backgroundColor: getCorrColor(val),
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {val.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
