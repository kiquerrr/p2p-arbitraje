import React from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';

const TransactionsTable = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
        No hay transacciones registradas
      </p>
    );
  }

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

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>TIPO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CANTIDAD USDT</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>PRECIO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>MONTO FIAT</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>COMISIÓN</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CAMBIO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>FECHA</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isBuy = tx.type === 'buy';
            const usdtChange = parseFloat(tx.usdt_boveda_despues || 0) - parseFloat(tx.usdt_boveda_antes || 0);
            const fiatChange = parseFloat(tx.fiat_despues || 0) - parseFloat(tx.fiat_antes || 0);
            
            return (
              <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {/* TIPO */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isBuy ? (
                      <TrendingUp size={16} color="#48bb78" />
                    ) : (
                      <TrendingDown size={16} color="#667eea" />
                    )}
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: isBuy ? '#c6f6d5' : '#bee3f8',
                      color: isBuy ? '#22543d' : '#2c5282'
                    }}>
                      {isBuy ? 'COMPRA' : 'VENTA'}
                    </span>
                  </div>
                </td>

                {/* CANTIDAD USDT */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>
                    {parseFloat(tx.cantidad_usdt || 0).toFixed(4)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#718096' }}>USDT</div>
                </td>

                {/* PRECIO */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#1a202c' }}>
                    ${parseFloat(tx.precio_ejecutado || 0).toFixed(3)}
                  </div>
                </td>

                {/* MONTO FIAT */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>
                    ${parseFloat(tx.monto_fiat || 0).toFixed(2)}
                  </div>
                </td>

                {/* COMISIÓN */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#e53e3e' }}>
                    ${parseFloat(tx.comision || 0).toFixed(2)}
                  </div>
                </td>

                {/* CAMBIOS */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: usdtChange >= 0 ? '#48bb78' : '#e53e3e', fontWeight: '600' }}>
                      {usdtChange >= 0 ? '+' : ''}{usdtChange.toFixed(4)} USDT
                    </span>
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    <span style={{ color: fiatChange >= 0 ? '#48bb78' : '#e53e3e', fontWeight: '600' }}>
                      {fiatChange >= 0 ? '+' : ''}${fiatChange.toFixed(2)}
                    </span>
                  </div>
                </td>

                {/* FECHA */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#718096' }}>
                    <Clock size={14} />
                    {formatDate(tx.timestamp_ejecucion || tx.created_at)}
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

export default TransactionsTable;
