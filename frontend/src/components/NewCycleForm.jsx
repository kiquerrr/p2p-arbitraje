import React, { useState } from 'react';
import { generalCyclesAPI } from '../services/api';

const NewCycleForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    capital_inicial_general: '',
    duration_days: '15',
    target_profit_percent: '0.0257',
    commission_percent: '0.0035',
    platform_id: 1,
    currency_id: 1
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        capital_inicial_general: parseFloat(formData.capital_inicial_general),
        duration_days: parseInt(formData.duration_days),
        target_profit_percent: parseFloat(formData.target_profit_percent),
        commission_percent: parseFloat(formData.commission_percent)
      };

      await generalCyclesAPI.create(data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear ciclo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Nombre del Ciclo */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Nombre del Ciclo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: Ciclo Noviembre 2025"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Capital Inicial */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Capital Inicial (USD) *
          </label>
          <input
            type="number"
            name="capital_inicial_general"
            value={formData.capital_inicial_general}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
            placeholder="1000"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Duración */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Duración del Ciclo *
          </label>
          <select
            name="duration_days"
            value={formData.duration_days}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          >
            <option value="7">7 días</option>
            <option value="15">15 días</option>
            <option value="30">30 días</option>
            <option value="60">60 días</option>
            <option value="90">90 días</option>
          </select>
        </div>

        {/* Ganancia Objetivo */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Ganancia Neta Objetivo (%)
          </label>
          <input
            type="number"
            name="target_profit_percent"
            value={formData.target_profit_percent}
            onChange={handleChange}
            required
            min="0"
            step="0.0001"
            placeholder="0.0257"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#718096', fontSize: '12px' }}>
            Ejemplo: 0.0257 = 2.57% diario
          </small>
        </div>

        {/* Comisión */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Comisión de Plataforma (%)
          </label>
          <input
            type="number"
            name="commission_percent"
            value={formData.commission_percent}
            onChange={handleChange}
            required
            min="0"
            step="0.0001"
            placeholder="0.0035"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#718096', fontSize: '12px' }}>
            Ejemplo: 0.0035 = 0.35%
          </small>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fed7d7',
            color: '#c53030',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creando...' : 'Crear Ciclo'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default NewCycleForm;
