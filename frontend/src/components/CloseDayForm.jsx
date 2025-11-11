import React, { useState } from 'react';
import { dailyCyclesAPI } from '../services/api';

const CloseDayForm = ({ dailyCycle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [precioUsdtCierre, setPrecioUsdtCierre] = useState('1.000');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await dailyCyclesAPI.close(dailyCycle.id, {
        precio_usdt_cierre: parseFloat(precioUsdtCierre)
      });

      if (response.data.success) {
        alert('✅ ' + response.data.message);
        onSuccess();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError({
        message: errorData?.message || 'Error al cerrar el día',
        details: errorData?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const usdtBoveda = parseFloat(dailyCycle?.usdt_boveda_inicio || 0);
  const fiatDisponible = parseFloat(dailyCycle?.fiat_disponible_inicio || 0);
  const capitalInicial = parseFloat(dailyCycle?.capital_inicial_dia || 0);
  const precio = parseFloat(precioUsdtCierre || 1.0);
  
  const capitalFinal = (usdtBoveda * precio) + fiatDisponible;
  const ganancia = capitalFinal - capitalInicial;
  const rentabilidad = capitalInicial > 0 ? (ganancia / capitalInicial) * 100 : 0;

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{
          padding: '16px',
          background: '#fff5e6',
          borderRadius: '8px',
          border: '1px solid #ff9800'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#e65100' }}>
            ⚠️ Atención: Esta acción cerrará el día {dailyCycle?.day_number}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#e65100' }}>
            Asegúrate de que todas tus operaciones estén completas antes de cerrar el día.
          </p>
        </div>

        <div style={{
          padding: '16px',
          background: '#f7fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1a202c' }}>Estado Actual</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Capital Inicial:</span>
              <span style={{ fontWeight: '600', color: '#1a202c' }}>${capitalInicial.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>USDT en Bóveda:</span>
              <span style={{ fontWeight: '600', color: '#1a202c' }}>{usdtBoveda.toFixed(4)} USDT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Fiat Disponible:</span>
              <span style={{ fontWeight: '600', color: '#1a202c' }}>${fiatDisponible.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Precio de USDT al Cierre *
          </label>
          <input
            type="number"
            value={precioUsdtCierre}
            onChange={(e) => setPrecioUsdtCierre(e.target.value)}
            required
            min="0"
            step="0.001"
            placeholder="1.000"
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
            Precio actual de USDT para calcular el capital final en USD
          </small>
        </div>

        <div style={{
          padding: '16px',
          background: ganancia >= 0 ? '#f0fdf4' : '#fef2f2',
          borderRadius: '8px',
          border: `1px solid ${ganancia >= 0 ? '#86efac' : '#fecaca'}`
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1a202c' }}>Resumen del Cierre</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Capital Final:</span>
              <span style={{ fontWeight: '600', color: '#1a202c' }}>${capitalFinal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Ganancia del Día:</span>
              <span style={{ fontWeight: '600', color: ganancia >= 0 ? '#16a34a' : '#dc2626' }}>
                {ganancia >= 0 ? '+' : ''}{ganancia.toFixed(2)} USD
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#718096' }}>Rentabilidad:</span>
              <span style={{ fontWeight: '600', color: ganancia >= 0 ? '#16a34a' : '#dc2626' }}>
                {ganancia >= 0 ? '+' : ''}{rentabilidad.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            background: '#fed7d7',
            borderRadius: '8px',
            border: '1px solid #fc8181'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#c53030' }}>
              {error.message || error}
            </p>
            {error.details && (
              <div style={{ fontSize: '13px', color: '#742a2a' }}>
                {error.details.ordenes_pendientes && (
                  <p style={{ margin: '4px 0' }}>
                    📋 Órdenes pendientes: <strong>{error.details.ordenes_pendientes}</strong>
                  </p>
                )}
                {error.details.sugerencia && (
                  <p style={{ margin: '4px 0' }}>💡 {error.details.sugerencia}</p>
                )}
              </div>
            )}
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
              background: loading ? '#a0aec0' : '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Cerrando Día...' : 'Confirmar Cierre'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CloseDayForm;
