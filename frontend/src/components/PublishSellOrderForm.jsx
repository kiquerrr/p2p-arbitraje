import React, { useState } from 'react';
import { ordersAPI } from '../services/api';

const PublishSellOrderForm = ({ dailyCycleId, usdtDisponible, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cantidad_usdt: '',
    precio_compra: '',
    precio_competencia_compra: '',
    ganancia_neta_objetivo: '0.0257',
    comision_plataforma: '0.0035'
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
      const response = await ordersAPI.calculateSellPrice({
        precio_compra: parseFloat(formData.precio_compra),
        precio_competencia_compra: parseFloat(formData.precio_competencia_compra),
        ganancia_neta_objetivo: parseFloat(formData.ganancia_neta_objetivo),
        comision: parseFloat(formData.comision_plataforma)
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
      await ordersAPI.publishSell({
        daily_cycle_id: dailyCycleId,
        cantidad_usdt: parseFloat(formData.cantidad_usdt),
        precio_publicado: calculatedPrice.precio_venta,
        precio_competencia_compra: parseFloat(formData.precio_competencia_compra)
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
                💡 <strong>Paso 1:</strong> Calcular precio de venta que garantice tu ganancia objetivo
              </p>
            </div>

            <div style={{
              padding: '12px',
              background: '#f7fafc',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>
                USDT Disponible: <strong style={{ color: '#1a202c' }}>{usdtDisponible.toFixed(4)} USDT</strong>
              </p>
            </div>

            {/* Cantidad USDT */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Cantidad a Vender (USDT) *
              </label>
              <input
                type="number"
                name="cantidad_usdt"
                value={formData.cantidad_usdt}
                onChange={handleChange}
                required
                min="0"
                max={usdtDisponible}
                step="0.0001"
                placeholder="976.5625"
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

            {/* Precio Compra */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Precio al que Compraste (P_C) *
              </label>
              <input
                type="number"
                name="precio_compra"
                value={formData.precio_compra}
                onChange={handleChange}
                required
                min="0"
                step="0.001"
                placeholder="1.024"
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
                El precio al que compraste estos USDT
              </small>
            </div>

            {/* Precio Competencia Compra */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Precio de Competencia (Compra) *
              </label>
              <input
                type="number"
                name="precio_competencia_compra"
                value={formData.precio_competencia_compra}
                onChange={handleChange}
                required
                min="0"
                step="0.001"
                placeholder="1.052"
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
                Precio al que la competencia está comprando USDT (ve a Binance P2P)
              </small>
            </div>

            {/* Ganancia Objetivo */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Ganancia Neta Objetivo (%)
              </label>
              <input
                type="number"
                name="ganancia_neta_objetivo"
                value={formData.ganancia_neta_objetivo}
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
              <small style={{ color: '#718096', fontSize: '12px' }}>
                Ejemplo: 0.0257 = 2.57% de ganancia
              </small>
            </div>

            {/* Comisión */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
                Comisión de Plataforma (%)
              </label>
              <input
                type="number"
                name="comision_plataforma"
                value={formData.comision_plataforma}
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
                {loading ? 'Calculando...' : 'Calcular Precio'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
            padding: '16px',
            background: calculatedPrice?.validacion?.es_valido ? '#c6f6d5' : '#fed7d7',
            borderRadius: '8px',
            border: `1px solid ${calculatedPrice?.validacion?.es_valido ? '#48bb78' : '#fc8181'}`
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: calculatedPrice?.validacion?.es_valido ? '#22543d' : '#c53030' }}>
              {calculatedPrice?.validacion?.es_valido ? '✅ Precio válido - Ganancia asegurada' : '⚠️ ' + calculatedPrice?.validacion?.mensaje}
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
                <span style={{ color: '#718096', fontSize: '14px' }}>Precio de Compra:</span>
                <span style={{ color: '#1a202c', fontSize: '14px', fontWeight: '600' }}>
                  ${parseFloat(formData.precio_compra).toFixed(3)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096', fontSize: '14px' }}>Punto de Equilibrio:</span>
                <span style={{ color: '#1a202c', fontSize: '14px', fontWeight: '600' }}>
                  ${calculatedPrice?.punto_equilibrio?.toFixed(3)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#e6fffa', borderRadius: '6px' }}>
                <span style={{ color: '#234e52', fontSize: '14px', fontWeight: '600' }}>Tu Precio de Venta:</span>
                <span style={{ color: '#234e52', fontSize: '16px', fontWeight: 'bold' }}>
                  ${calculatedPrice?.precio_venta?.toFixed(3)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#718096', fontSize: '14px' }}>Ganancia Esperada:</span>
                <span style={{ color: '#48bb78', fontSize: '14px', fontWeight: '600' }}>
                  {(calculatedPrice?.ganancia_neta_porcentaje * 100).toFixed(2)}%
                </span>
              </div>
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
              disabled={loading || !calculatedPrice?.validacion?.es_valido}
              style={{
                flex: 1,
                padding: '12px',
                background: loading || !calculatedPrice?.validacion?.es_valido ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !calculatedPrice?.validacion?.es_valido ? 'not-allowed' : 'pointer'
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

export default PublishSellOrderForm;
