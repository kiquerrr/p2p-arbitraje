import React, { useState, useEffect } from 'react';
import { vaultAPI } from '../services/api';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Calendar } from 'lucide-react';

const VaultMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const response = await vaultAPI.getMovements(50);
      setMovements(response.data.data.movements || []);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type) => {
    switch (type) {
      case 'deposit':
        return { icon: ArrowDownCircle, color: '#48bb78', bg: '#c6f6d5', label: 'Depósito' };
      case 'transfer_to_cycle':
        return { icon: ArrowUpCircle, color: '#667eea', bg: '#e0e7ff', label: 'A Ciclo' };
      case 'transfer_from_cycle':
        return { icon: ArrowDownCircle, color: '#f59e0b', bg: '#fef3c7', label: 'Desde Ciclo' };
      case 'profit':
        return { icon: ArrowRightLeft, color: '#10b981', bg: '#d1fae5', label: 'Ganancia' };
      default:
        return { icon: ArrowRightLeft, color: '#718096', bg: '#e2e8f0', label: type };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#718096' }}>Cargando movimientos...</p>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#718096' }}>No hay movimientos registrados</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>TIPO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>MONTO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>BALANCE</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CICLO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>DESCRIPCIÓN</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>FECHA</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => {
            const typeInfo = getTypeInfo(movement.type);
            const Icon = typeInfo.icon;
            const isIncoming = ['deposit', 'transfer_from_cycle', 'profit'].includes(movement.type);
            
            return (
              <tr key={movement.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {/* TIPO */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: typeInfo.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={16} color={typeInfo.color} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a202c' }}>
                      {typeInfo.label}
                    </span>
                  </div>
                </td>

                {/* MONTO */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: isIncoming ? '#16a34a' : '#dc2626'
                  }}>
                    {isIncoming ? '+' : '-'}${parseFloat(movement.amount || 0).toFixed(2)}
                  </span>
                </td>

                {/* BALANCE */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ color: '#718096', marginBottom: '2px' }}>
                      Antes: ${parseFloat(movement.balance_antes || 0).toFixed(2)}
                    </div>
                    <div style={{ color: '#1a202c', fontWeight: '600' }}>
                      Después: ${parseFloat(movement.balance_despues || 0).toFixed(2)}
                    </div>
                  </div>
                </td>

                {/* CICLO */}
                <td style={{ padding: '12px', fontSize: '13px', color: '#718096' }}>
                  {movement.cycle_name || '-'}
                </td>

                {/* DESCRIPCIÓN */}
                <td style={{ padding: '12px', fontSize: '13px', color: '#4a5568', maxWidth: '200px' }}>
                  {movement.description || '-'}
                </td>

                {/* FECHA */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#718096' }}>
                    <Calendar size={14} />
                    {formatDate(movement.created_at)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VaultMovements;
