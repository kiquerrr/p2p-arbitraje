import React, { useState } from 'react';
import { generalCyclesAPI, vaultAPI } from '../services/api';

const NewCycleForm = ({ onSuccess, onCancel, availableBalance }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    duration_days: 15,
    capital_inicial_general: '',
    target_profit_percent: 2.0,
    commission_percent: 0.6
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

    const capital = parseFloat(formData.capital_inicial_general);

    if (capital > availableBalance) {
      setError(`Fondos insuficientes. Disponible: $${availableBalance.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      // 1. Crear el ciclo
      const cycleResponse = await generalCyclesAPI.create(formData);
      console.log('Cycle Response:', cycleResponse.data);
      
      // Extraer ID del ciclo - probar múltiples estructuras
      const cycleId = cycleResponse.data.data?.generalCycle?.id || 
                      cycleResponse.data.data?.id ||
                      cycleResponse.data.id;

      console.log('Cycle ID:', cycleId);

      if (!cycleId) {
        throw new Error('No se pudo obtener el ID del ciclo creado');
      }

      // 2. Transferir capital de bóveda a ciclo
      const transferResponse = await vaultAPI.transferToCycle({
        general_cycle_id: cycleId,
        amount: capital,
        description: `Capital inicial para ciclo: ${formData.name}`
      });

      console.log('Transfer Response:', transferResponse.data);

      alert('✅ Ciclo creado y capital transferido exitosamente');
      onSuccess();
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Error al crear ciclo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #7dd3fc'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>
            💰 Balance Disponible: ${availableBalance.toFixed(2)}
          </p>
        </div>

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
            placeholder="Ej: Ciclo Enero 2025"
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

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Capital Inicial *
          </label>
          <input
            type="number"
            name="capital_inicial_general"
            value={formData.capital_inicial_general}
            onChange={handleChange}
            required
            min="0.01"
            max={availableBalance}
            step="0.01"
            placeholder="1000.00"
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
            Máximo disponible: ${availableBalance.toFixed(2)}
          </small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Duración (días) *
          </label>
          <input
            type="number"
            name="duration_days"
            value={formData.duration_days}
            onChange={handleChange}
            required
            min="1"
            max="365"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
              Ganancia Objetivo (%)
            </label>
            <input
              type="number"
              name="target_profit_percent"
              value={formData.target_profit_percent}
              onChange={handleChange}
              step="0.1"
              min="0"
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
              Comisión (%)
            </label>
            <input
              type="number"
              name="commission_percent"
              value={formData.commission_percent}
              onChange={handleChange}
              step="0.1"
              min="0"
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
            disabled={loading || !formData.capital_inicial_general || parseFloat(formData.capital_inicial_general) > availableBalance}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || parseFloat(formData.capital_inicial_general) > availableBalance) ? 'not-allowed' : 'pointer'
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
