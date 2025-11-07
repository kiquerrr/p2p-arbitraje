import React, { useState } from 'react';
import { ordersAPI } from '../services/api';

const PublishBuyOrderForm = ({ dailyCycleId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cantidad_fiat: '',
    precio_competencia_venta: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ordersAPI.calculateBuyPrice({
        precio_competencia_venta: parseFloat(formData.precio_competencia_venta)
      });

      setCalculatedPrice(response.data.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al calcular precio');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setError('');
    setLoading(true);

    try {
      await ordersAPI.publishBuy({
        daily_cycle_id: dailyCycleId,
        cantidad_fiat: parseFloat(formData.cantidad_fiat),
        precio_publicado: calculatedPrice.precio_compra,
        precio_competencia_venta: parseFloat(formData.precio_competencia_venta)
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {step === 1 ? (
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{
              padding: '16px',
              background: '#ebf8ff',
              borderRadius: '8px',
              border: '1px solid #90cdf4'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#2c5282' }}>
                💡 <strong>Paso 1:</strong> Verificar precio de la competencia y calcular precio de compra óptimo
              </p>
            </div>

            {/* Cantidad Fiat */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Cantidad a Invertir (USD) *
              </label>
              <input
                type="number"
                name="cantidad_fiat"
                value={formData.cantidad_fiat}
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
              <small style={{ color: '#718096', fontSize: '12px' }}>
                Monto en dólares que usarás para comprar USDT
              </small>
            </div>

            {/* Precio Competencia */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Precio de Competencia (Venta) *
              </label>
              <input
                type="number"
                name="precio_competencia_venta"
                value={formData.precio_competencia_venta}
                onChange={handleChange}
                required
                min="0"
                step="0.001"
                placeholder="1.025"
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
                Precio al que la competencia está vendiendo USDT (ve a Binance P2P)
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
                  background: loading ? '#a0aec0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Calculando...' : 'Calcular Precio'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            padding: '16px',
            background: '#c6f6d5',
            borderRadius: '8px',
            border: '1px solid #48bb78'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#22543d' }}>
              ✅ <strong>Precio calculado exitosamente</strong>
            </p>
          </div>

          {/* Resultado */}
          <div style={{
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a202c' }}>Resumen de la Orden</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096', fontSize: '14px' }}>Precio de Competencia:</span>
                <span style={{ color: '#1a202c', fontSize: '14px', fontWeight: '600' }}>
                  ${parseFloat(formData.precio_competencia_venta).toFixed(3)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#e6fffa', borderRadius: '6px' }}>
                <span style={{ color: '#234e52', fontSize: '14px', fontWeight: '600' }}>Tu Precio de Compra:</span>
                <span style={{ color: '#234e52', fontSize: '16px', fontWeight: 'bold' }}>
                  ${calculatedPrice?.precio_compra?.toFixed(3)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096', fontSize: '14px' }}>Cantidad a Invertir:</span>
                <span style={{ color: '#1a202c', fontSize: '14px', fontWeight: '600' }}>
                  ${parseFloat(formData.cantidad_fiat).toFixed(2)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096', fontSize: '14px' }}>USDT Esperado:</span>
                <span style={{ color: '#1a202c', fontSize: '14px', fontWeight: '600' }}>
                  ~{(parseFloat(formData.cantidad_fiat) / calculatedPrice?.precio_compra).toFixed(4)} USDT
                </span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '12px',
            background: '#fef5e7',
            borderRadius: '8px',
            border: '1px solid #f9e79f'
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#7d6608' }}>
              ⚠️ Tu precio es <strong>$0.001</strong> menor que la competencia, lo que te hace más atractivo para los vendedores.
            </p>
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setStep(1)}
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
              Volver
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Publicando...' : 'Publicar Orden'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishBuyOrderForm;
