import React, { useState } from 'react';
import { vaultAPI } from '../services/api';

const TransferFromCycleForm = ({ generalCycleId, cycleName, fiatDisponible, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const transferAmount = parseFloat(amount);

    if (transferAmount > fiatDisponible) {
      setError(`Fondos insuficientes. Disponible: $${fiatDisponible.toFixed(2)}`);
      setLoading(false);
      return;
    }

    try {
      const response = await vaultAPI.transferFromCycle({
        general_cycle_id: generalCycleId,
        amount: transferAmount,
        description: description || `Retiro desde ${cycleName}`
      });

      alert(response.data.message);
      onSuccess();
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error al transferir fondos');
    } finally {
      setLoading(false);
    }
  };

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
            📤 Retirar fondos del ciclo a la bóveda
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#e65100' }}>
            Este dinero volverá a tu bóveda y estará disponible para otros ciclos
          </p>
        </div>

        <div style={{
          padding: '16px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #7dd3fc'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>
            💵 Fiat Disponible en Ciclo: ${fiatDisponible.toFixed(2)}
          </p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Monto a Retirar *
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            max={fiatDisponible}
            step="0.01"
            placeholder="1000.00"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#718096', fontSize: '12px' }}>
            Máximo disponible: ${fiatDisponible.toFixed(2)}
          </small>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#4a5568', marginBottom: '8px' }}>
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Retiro de ganancias"
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
            disabled={loading || !amount || parseFloat(amount) > fiatDisponible}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#a0aec0' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || parseFloat(amount) > fiatDisponible) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Transfiriendo...' : 'Confirmar Retiro'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TransferFromCycleForm;
