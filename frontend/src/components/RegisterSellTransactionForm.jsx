import React, { useState } from 'react';
import { transactionsAPI } from '../services/api';

const RegisterSellTransactionForm = ({ order, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cantidad_usdt: order.cantidad_usdt || '',
    precio_ejecutado: order.precio_publicado || ''
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
      await transactionsAPI.registerSell({
        order_id: order.id,
        cantidad_usdt: parseFloat(formData.cantidad_usdt),
        precio_ejecutado: parseFloat(formData.precio_ejecutado)
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar transacción');
    } finally {
      setLoading(false);
    }
  };

  const montoFiat = formData.cantidad_usdt && formData.precio_ejecutado 
    ? (parseFloat(formData.cantidad_usdt) * parseFloat(formData.precio_ejecutado)).toFixed(2)
    : '0.00';

  const comision = formData.cantidad_usdt && formData.precio_ejecutado
    ? (parseFloat(montoFiat) * 0.0035).toFixed(2)
    : '0.00';

  const montoNeto = (parseFloat(montoFiat) - parseFloat(comision)).toFixed(2);

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{
          padding: '16px',
          background: '#ebf8ff',
          borderRadius: '8px',
          border: '1px solid #90cdf4'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#2c5282' }}>
            <strong>Orden #{order.id}</strong> - Venta de USDT
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Cantidad de USDT Vendida *
          </label>
          <input
            type="number"
            name="cantidad_usdt"
            value={formData.cantidad_usdt}
            onChange={handleChange}
            required
            min="0"
            step="0.0001"
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
            Precio Ejecutado *
          </label>
          <input
            type="number"
            name="precio_ejecutado"
            value={formData.precio_ejecutado}
            onChange={handleChange}
            required
            min="0"
            step="0.001"
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

        {formData.cantidad_usdt && formData.precio_ejecutado && (
          <div style={{
            padding: '16px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1a202c' }}>Resumen</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#718096' }}>Monto Bruto:</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>${montoFiat}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#718096' }}>Comisión:</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#e53e3e' }}>-${comision}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#718096' }}>Monto Neto:</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#48bb78' }}>
                ${montoNeto}
              </span>
            </div>
          </div>
        )}

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
            {loading ? 'Registrando...' : 'Registrar Venta'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegisterSellTransactionForm;
