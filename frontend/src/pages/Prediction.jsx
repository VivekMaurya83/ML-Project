import React, { useState } from 'react';
import { Send, Utensils, HelpCircle, AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react';

export default function Prediction({ isTrained }) {
  const [formData, setFormData] = useState({
    week: 146, // next week in the sequence
    center_id: 55,
    meal_id: 1885,
    checkout_price: 136.83,
    base_price: 152.29,
    emailer_for_promotion: 0,
    homepage_featured: 0
  });

  const [plannedQty, setPlannedQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Rich mapping of actual dishes from meal_info.csv with baseline benchmark pricing
  const availableMeals = [
    { id: 1962, name: 'Pizza (Continental)', defaultBase: 641.23, defaultCheckout: 639.23 },
    { id: 1558, name: 'Pizza (Continental Supreme)', defaultBase: 680.00, defaultCheckout: 640.00 },
    { id: 1109, name: 'Rice Bowl (Indian Traditional)', defaultBase: 310.43, defaultCheckout: 285.20 },
    { id: 1727, name: 'Rice Bowl (Indian Special)', defaultBase: 340.00, defaultCheckout: 310.00 },
    { id: 1754, name: 'Sandwich (Italian Club)', defaultBase: 295.50, defaultCheckout: 260.00 },
    { id: 1971, name: 'Sandwich (Italian Veg)', defaultBase: 280.00, defaultCheckout: 255.00 },
    { id: 1902, name: 'Biryani (Hyderabadi Indian)', defaultBase: 446.23, defaultCheckout: 410.00 },
    { id: 2306, name: 'Pasta (Italian Penne)', defaultBase: 388.00, defaultCheckout: 349.00 },
    { id: 2444, name: 'Seafood (Continental Grilled)', defaultBase: 610.00, defaultCheckout: 570.00 },
    { id: 2490, name: 'Salad (Italian Caesar)', defaultBase: 290.00, defaultCheckout: 270.00 },
    { id: 1885, name: 'Beverages (Thai Iced Tea)', defaultBase: 152.29, defaultCheckout: 136.83 },
    { id: 1062, name: 'Beverages (Italian Coffee)', defaultBase: 180.00, defaultCheckout: 155.00 },
    { id: 1248, name: 'Beverages (Indian Masala Chai)', defaultBase: 140.00, defaultCheckout: 130.00 },
    { id: 2304, name: 'Dessert (Indian Gulab Jamun)', defaultBase: 242.50, defaultCheckout: 215.00 },
    { id: 1847, name: 'Soup (Thai Tom Yum)', defaultBase: 195.00, defaultCheckout: 175.00 },
    { id: 2640, name: 'Starters (Thai Spring Rolls)', defaultBase: 280.33, defaultCheckout: 282.33 },
    { id: 2704, name: 'Other Snacks (Thai Crispy Bites)', defaultBase: 320.13, defaultCheckout: 321.13 },
  ];

  // Clean, professional mapping of major fulfillment centers
  const availableCenters = [
    { id: 13, name: 'Center 13 · Metro Central Hub (City 590)' },
    { id: 11, name: 'Center 11 · North Regional Kitchen (City 679)' },
    { id: 55, name: 'Center 55 · South Express Outlet (City 647)' },
    { id: 66, name: 'Center 66 · West Regional Kitchen (City 648)' },
    { id: 124, name: 'Center 124 · Central Express Kitchen (City 590)' },
    { id: 27, name: 'Center 27 · East Regional Kitchen (City 713)' },
    { id: 104, name: 'Center 104 · Suburban Hub (City 647)' },
    { id: 77, name: 'Center 77 · Downtown Kitchen (City 676)' },
    { id: 94, name: 'Center 94 · Airport Express Kitchen (City 632)' },
    { id: 137, name: 'Center 137 · Industrial Park Hub (City 590)' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') ? parseFloat(value) || 0 : parseInt(value) || 0
    }));
  };

  const handleMealChange = (e) => {
    const mealId = parseInt(e.target.value);
    const selected = availableMeals.find(m => m.id === mealId);
    setFormData(prev => ({
      ...prev,
      meal_id: mealId,
      base_price: selected ? selected.defaultBase : prev.base_price,
      checkout_price: selected ? selected.defaultCheckout : prev.checkout_price
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.detail || 'Prediction failed. Check inputs.');
      }
    } catch (err) {
      setError('Could not connect to the backend server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate Excess
  let excessResult = null;
  if (result && plannedQty !== '') {
    const predictedDemand = result.predictions.ensemble;
    const plan = parseFloat(plannedQty) || 0;
    const diff = plan - predictedDemand;
    if (diff >= 0) {
      excessResult = {
        type: 'excess',
        value: diff.toFixed(1),
        message: 'Estimated Excess'
      };
    } else {
      excessResult = {
        type: 'deficit',
        value: Math.abs(diff).toFixed(1),
        message: 'Estimated Deficit (Additional Food Required)'
      };
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Food Demand Forecasting & Planning</h2>
        <p className="page-subtitle">Generate demand predictions from regressors and use them to plan food preparation and avoid waste.</p>
      </div>

      {!isTrained && (
        <div className="alert alert-warning">
          <AlertTriangle size={16} />
          <div>
            <strong>Model Training Required:</strong> Models must be trained before generating predictions.
            <br />
            <span style={{ fontSize: '12px' }}>Please go to the <strong>Model Training</strong> tab and complete the training process first.</span>
          </div>
        </div>
      )}

      <div className="section-grid" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        {/* Form Column */}
        <div className="section-card">
          <h3 className="section-title"><Send size={16} style={{ color: 'var(--accent-emerald)' }} /> Input Parameters</h3>
          <form onSubmit={handlePredict}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Week Number</label>
                <input 
                  type="number" 
                  name="week" 
                  className="form-input" 
                  value={formData.week} 
                  onChange={handleInputChange} 
                  min="1" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fulfillment Center Location</label>
                <select 
                  name="center_id" 
                  className="form-input" 
                  value={formData.center_id} 
                  onChange={handleInputChange}
                >
                  {availableCenters.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Dish / Food Item</label>
                <select 
                  name="meal_id" 
                  className="form-input" 
                  value={formData.meal_id} 
                  onChange={handleMealChange}
                >
                  {availableMeals.map(meal => (
                    <option key={meal.id} value={meal.id}>{meal.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email Promotion</label>
                <select 
                  name="emailer_for_promotion" 
                  className="form-input" 
                  value={formData.emailer_for_promotion} 
                  onChange={handleInputChange}
                >
                  <option value="0">No Promotion Email</option>
                  <option value="1">Promotion Email Sent</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Checkout Price (INR)</label>
                <input 
                  type="number" 
                  name="checkout_price" 
                  step="0.01" 
                  className="form-input" 
                  value={formData.checkout_price} 
                  onChange={handleInputChange} 
                  min="1" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Base Price (INR)</label>
                <input 
                  type="number" 
                  name="base_price" 
                  step="0.01" 
                  className="form-input" 
                  value={formData.base_price} 
                  onChange={handleInputChange} 
                  min="1" 
                  required 
                />
              </div>
            </div>

            {/* Dynamic Price Discount Gauge (Interactive Widget) */}
            {formData.base_price > 0 && (
              <div style={{ margin: '-8px 0 18px 0', padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Live Discount Pricing Analysis:</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: (formData.base_price - formData.checkout_price) > 0 ? 'var(--accent-emerald)' : 
                           (formData.base_price - formData.checkout_price) < 0 ? 'var(--accent-red)' : 'var(--text-secondary)'
                  }}>
                    {((formData.base_price - formData.checkout_price) / formData.base_price * 100).toFixed(1)}% 
                    {((formData.base_price - formData.checkout_price) >= 0) ? ' Discount' : ' Price Markup'}
                  </span>
                </div>
                <div className="discount-progress-bar">
                  <div 
                    className="discount-progress-fill" 
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((formData.base_price - formData.checkout_price) / formData.base_price * 100)))}%`,
                      backgroundColor: (formData.base_price - formData.checkout_price) > 0 ? '#16a34a' : 
                                       (formData.base_price - formData.checkout_price) < 0 ? '#dc2626' : '#94a3b8'
                    }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Homepage Featured</label>
              <select 
                name="homepage_featured" 
                className="form-input" 
                value={formData.homepage_featured} 
                onChange={handleInputChange}
              >
                <option value="0">Not Featured</option>
                <option value="1">Featured on Homepage</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }} 
              disabled={!isTrained || loading}
            >
              {loading ? 'Running Models...' : 'Generate Demand Predictions'}
            </button>
          </form>

          {error && (
            <div className="alert alert-warning" style={{ marginTop: '16px', color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Prediction Results & Planning Column */}
        <div className="section-card">
          <h3 className="section-title"><Utensils size={16} style={{ color: 'var(--accent-primary)' }} /> Results & Decision Support</h3>
          
          {!result ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <HelpCircle size={48} style={{ opacity: 0.15, marginBottom: '12px' }} />
              <p>Enter parameters and click predict to generate food order forecasts.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Demographics Lookup Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Category:</span> <strong style={{ color: 'var(--text-primary)' }}>{result.meal_details.category}</strong>
                  <br />
                  <span style={{ color: 'var(--text-secondary)' }}>Cuisine:</span> <strong style={{ color: 'var(--text-primary)' }}>{result.meal_details.cuisine}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Center Location:</span> <strong style={{ color: 'var(--text-primary)' }}>City {result.center_details.city_code} (Reg {result.center_details.region_code})</strong>
                  <br />
                  <span style={{ color: 'var(--text-secondary)' }}>Center Type:</span> <strong style={{ color: 'var(--text-primary)' }}>{result.center_details.center_type} (Area: {result.center_details.op_area} km²)</strong>
                </div>
              </div>

              {/* Models predictions breakdown */}
              <div>
                <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.02em' }}>Model Output Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Random Forest</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-primary)' }}>{result.predictions.rf}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>Wt: {(result.weights.rf * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SVR (RBF)</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-primary)' }}>{result.predictions.svr}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>Wt: {(result.weights.svr * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>KNN Regressor</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-primary)' }}>{result.predictions.knn}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>Wt: {(result.weights.knn * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Ensemble Forecast display */}
              <div style={{ padding: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Weighted Averaging Ensemble Forecast</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--accent-primary)', marginTop: '4px' }}>
                  {result.predictions.ensemble} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>orders</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Calculated from: <code>(RF * {result.weights.rf.toFixed(2)}) + (SVR * {result.weights.svr.toFixed(2)}) + (KNN * {result.weights.knn.toFixed(2)})</code>
                </div>
              </div>

              {/* Food Supply Planning Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                  <TrendingDown size={16} style={{ color: 'var(--accent-primary)' }} /> Food Supply Planning
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                  Optionally, enter the planned quantity of food (in orders equivalent) you intend to prepare. The model compares this plan with the forecast to highlight potential excess supply or shortage.
                </p>

                <div className="form-group">
                  <label className="form-label">Planned Food Quantity (Orders Equivalent)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="e.g. 200" 
                    value={plannedQty} 
                    onChange={(e) => setPlannedQty(e.target.value)} 
                    min="0"
                  />
                </div>

                {excessResult && (
                  <div 
                    className={`alert ${excessResult.type === 'excess' ? 'alert-warning' : 'alert-info'}`} 
                    style={{ marginTop: '12px' }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px' }}>{excessResult.message}: {excessResult.value} orders</strong>
                      <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                        {excessResult.type === 'excess' 
                          ? 'Planned supply exceeds forecasted demand. Consider optimizing raw ingredient purchases or cooking batches to reduce potential food waste.' 
                          : 'Forecasted demand exceeds planned preparation. Consider preparing additional food units to avoid stockouts.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
