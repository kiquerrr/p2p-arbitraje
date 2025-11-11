import React from 'react';
import { Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const DailyHistoryTable = ({ dailyCycles, onSelectDay }) => {
  if (!dailyCycles || dailyCycles.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
        No hay historial de días
      </p>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>DÍA</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>ESTADO</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CAPITAL INICIAL</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CAPITAL FINAL</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>GANANCIA</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>RENTABILIDAD</th>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>FECHA CIERRE</th>
          </tr>
        </thead>
        <tbody>
          {dailyCycles.map((day) => {
            const isActive = day.status === 'active';
            const isCompleted = day.status === 'completed';
            const capitalInicial = parseFloat(day.capital_inicial_dia || 0);
            const capitalFinal = parseFloat(day.capital_final_dia || 0);
            const ganancia = parseFloat(day.ganancia_neta_dia || 0);
            const rentabilidad = parseFloat(day.rentabilidad_dia || 0);
            const hasData = isCompleted;

            return (
              <tr 
                key={day.id} 
                style={{ 
                  borderBottom: '1px solid #e2e8f0',
                  background: isActive ? '#f0f9ff' : 'white',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectDay && onSelectDay(day)}
              >
                {/* DÍA */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color={isActive ? '#667eea' : '#718096'} />
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: isActive ? '700' : '600',
                      color: isActive ? '#667eea' : '#1a202c'
                    }}>
                      Día {day.day_number}
                    </span>
                  </div>
                </td>

                {/* ESTADO */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: isActive ? '#dbeafe' : isCompleted ? '#d1fae5' : '#f3f4f6',
                    color: isActive ? '#1e40af' : isCompleted ? '#065f46' : '#6b7280',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isActive ? <Clock size={12} /> : <CheckCircle size={12} />}
                    {isActive ? 'ACTIVO' : isCompleted ? 'CERRADO' : 'PENDIENTE'}
                  </span>
                </td>

                {/* CAPITAL INICIAL */}
                <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>
                  ${capitalInicial.toFixed(2)}
                </td>

                {/* CAPITAL FINAL */}
                <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c', fontWeight: '600' }}>
                  {hasData ? `$${capitalFinal.toFixed(2)}` : '-'}
                </td>

                {/* GANANCIA */}
                <td style={{ padding: '12px' }}>
                  {hasData ? (
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: ganancia >= 0 ? '#16a34a' : '#dc2626'
                    }}>
                      {ganancia >= 0 ? '+' : ''}${ganancia.toFixed(2)}
                    </span>
                  ) : '-'}
                </td>

                {/* RENTABILIDAD */}
                <td style={{ padding: '12px' }}>
                  {hasData ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp 
                        size={16} 
                        color={rentabilidad >= 0 ? '#16a34a' : '#dc2626'} 
                      />
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '700',
                        color: rentabilidad >= 0 ? '#16a34a' : '#dc2626'
                      }}>
                        {rentabilidad >= 0 ? '+' : ''}{rentabilidad.toFixed(2)}%
                      </span>
                    </div>
                  ) : '-'}
                </td>

                {/* FECHA CIERRE */}
                <td style={{ padding: '12px', fontSize: '13px', color: '#718096' }}>
                  {formatDate(day.completed_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DailyHistoryTable;
