import React from 'react';
import { Database, Link2, Info, CheckCircle } from 'lucide-react';

export default function DatasetManagement({ stats }) {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dataset Management</h2>
        <p className="page-subtitle">Inspect raw data files, features, join schemas, and data dictionary mapping.</p>
      </div>

      <div className="alert alert-info">
        <Info size={16} />
        <div>
          <strong>Architecture Note:</strong> The forecasting pipeline performs a relational join on 
          three independent CSV files. <code>train.csv</code> represents the transaction logs, which is joined with 
          <code>meal_info.csv</code> (using <code>meal_id</code>) and <code>fulfilment_center_info.csv</code> (using <code>center_id</code>)
          to create the training dataframe.
        </div>
      </div>

      <div className="section-grid">
        <div className="section-card">
          <h3 className="section-title"><Database style={{ color: 'var(--accent-primary)' }} /> Source CSV Data Files</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>1. train.csv</span>
                <span className="badge badge-success">Loaded</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Contains historical food order records across weeks.
                <br />
                <strong>Rows:</strong> {stats?.train_rows?.toLocaleString() || "456,548"} | <strong>Primary Key:</strong> <code>id</code>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>2. meal_info.csv</span>
                <span className="badge badge-success">Loaded</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Contains information about the food items (category, cuisine).
                <br />
                <strong>Rows:</strong> {stats?.meal_rows || "51"} | <strong>Primary Key:</strong> <code>meal_id</code>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>3. fulfilment_center_info.csv</span>
                <span className="badge badge-success">Loaded</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Contains structural profiles of the preparation/delivery centers.
                <br />
                <strong>Rows:</strong> {stats?.center_rows || "77"} | <strong>Primary Key:</strong> <code>center_id</code>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title"><Link2 style={{ color: 'var(--accent-primary)' }} /> Relational Schema & Joins</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
            <div style={{ padding: '12px', border: '1px dashed var(--accent-primary)', borderRadius: '8px', background: 'rgba(30,64,175,0.02)' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent-primary)' }}>Join 1: Meal Enrichment</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <code>train.csv.meal_id</code> &rarr; <code>meal_info.csv.meal_id</code>
                <br />
                Appends features: <code>category</code>, <code>cuisine</code>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px dashed var(--accent-primary)', borderRadius: '8px', background: 'rgba(30,64,175,0.02)' }}>
              <div style={{ fontWeight: '600', fontSize: '13px', color: 'var(--accent-primary)' }}>Join 2: Fulfillment Center Enrichment</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <code>train.csv.center_id</code> &rarr; <code>fulfilment_center_info.csv.center_id</code>
                <br />
                Appends features: <code>city_code</code>, <code>region_code</code>, <code>center_type</code>, <code>op_area</code>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--text-primary)', fontSize: '13px' }}>
              <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
              <span>Full features generated: 14 base columns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginTop: '24px' }}>
        <h3 className="section-title">Enriched Training Schema Data Dictionary</h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
                <th>Source File</th>
                <th>Role in ML</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>id</code></td>
                <td>Integer</td>
                <td>train.csv</td>
                <td>Identifier (Dropped)</td>
                <td>Unique identifier for each transaction log.</td>
              </tr>
              <tr>
                <td><code>week</code></td>
                <td>Integer</td>
                <td>train.csv</td>
                <td>Numeric Feature</td>
                <td>Chronological week number (1 to 145). Used to capture temporal trends.</td>
              </tr>
              <tr>
                <td><code>center_id</code></td>
                <td>Integer</td>
                <td>train.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Unique ID of the fulfillment center.</td>
              </tr>
              <tr>
                <td><code>meal_id</code></td>
                <td>Integer</td>
                <td>train.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Unique ID of the meal.</td>
              </tr>
              <tr>
                <td><code>checkout_price</code></td>
                <td>Float</td>
                <td>train.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Final price charged to the customer after promotions/discounts.</td>
              </tr>
              <tr>
                <td><code>base_price</code></td>
                <td>Float</td>
                <td>train.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Original/base price of the meal item.</td>
              </tr>
              <tr>
                <td><code>emailer_for_promotion</code></td>
                <td>Binary (0/1)</td>
                <td>train.csv</td>
                <td>Binary Feature</td>
                <td>Indicates if an email campaign was sent for the meal.</td>
              </tr>
              <tr>
                <td><code>homepage_featured</code></td>
                <td>Binary (0/1)</td>
                <td>train.csv</td>
                <td>Binary Feature</td>
                <td>Indicates if the meal was featured on the homepage.</td>
              </tr>
              <tr>
                <td><code>category</code></td>
                <td>Categorical</td>
                <td>meal_info.csv</td>
                <td>One-Hot Encoded Feature</td>
                <td>Food category (e.g., Beverages, Pasta, Sandwich, Pizza).</td>
              </tr>
              <tr>
                <td><code>cuisine</code></td>
                <td>Categorical</td>
                <td>meal_info.csv</td>
                <td>One-Hot Encoded Feature</td>
                <td>Cuisine style (Continental, Indian, Italian, Thai).</td>
              </tr>
              <tr>
                <td><code>city_code</code></td>
                <td>Integer</td>
                <td>fulfilment_center_info.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Unique code representing the city location of the center.</td>
              </tr>
              <tr>
                <td><code>region_code</code></td>
                <td>Integer</td>
                <td>fulfilment_center_info.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Unique code representing the region of the center.</td>
              </tr>
              <tr>
                <td><code>center_type</code></td>
                <td>Categorical</td>
                <td>fulfilment_center_info.csv</td>
                <td>One-Hot Encoded Feature</td>
                <td>Structural categorization of center capacity (TYPE_A, TYPE_B, TYPE_C).</td>
              </tr>
              <tr>
                <td><code>op_area</code></td>
                <td>Float</td>
                <td>fulfilment_center_info.csv</td>
                <td>Numeric Feature (Scaled)</td>
                <td>Operational footprint area (in square kilometers) of the center.</td>
              </tr>
              <tr style={{ background: 'rgba(16,185,129,0.05)' }}>
                <td><code>num_orders</code></td>
                <td>Integer</td>
                <td>train.csv</td>
                <td><strong>Target Variable</strong></td>
                <td>Number of food orders. This is what the regressors predict.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
