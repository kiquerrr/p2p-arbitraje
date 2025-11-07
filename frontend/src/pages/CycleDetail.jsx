import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generalCyclesAPI, dailyCyclesAPI, ordersAPI, transactionsAPI } from '../services/api';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, ShoppingCart, Store } from 'lucide-react';

const CycleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [dailyCycle, setDailyCycle] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycleData();
  }, [id]);

  const loadCycleData = async () => {
    try {
      // Cargar ciclo general
      const cycleResponse = await generalCyclesAPI.getById(id);
      setCycle(cycleResponse.data.data);

      // Buscar el ciclo diario activo
      const dailyCycles = cycleResponse.data.data.daily_cycles || [];
      const activeDailyCycle = dailyCycles.find(dc => dc.status === 'active');

      if (activeDailyCycle) {
        // Cargar estado del día actual
        const dailyResponse = await dailyCyclesAPI.getStatus(activeDailyCycle.id);
        setDailyCycle(dailyResponse.data.data);

        // Cargar órdenes
        const ordersResponse = await ordersAPI.list(activeDailyCycle.id);
        setOrders(ordersResponse.data.data);

        // Cargar transacciones
        const transactionsResponse = await transactionsAPI.list(activeDailyCycle.id);
        setTransactions(transactionsResponse.data.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#718096' }}>Cargando...</p>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#718096' }}>Ciclo no encontrado</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 40px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </button>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>{cycle.name}</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Día {dailyCycle?.day_number || 0} de {cycle.duration_days}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Calendar size={20} color="#667eea" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096' }}>Día Actual</h3>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
              {dailyCycle?.day_number || 0}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <DollarSign size={20} color="#48bb78" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096' }}>Capital Inicial Día</h3>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
              ${dailyCycle?.capital_inicial_dia?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={20} color="#667eea" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096' }}>USDT en Bóveda</h3>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
              {dailyCycle?.usdt_boveda_inicio?.toFixed(4) || '0.0000'}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <DollarSign size={20} color="#48bb78" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096' }}>Fiat Disponible</h3>
            </div>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a202c' }}>
              ${dailyCycle?.fiat_disponible_inicio?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <ShoppingCart size={18} />
            Publicar Compra
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <Store size={18} />
            Publicar Venta
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginLeft: 'auto'
          }}>
            Cerrar Día
          </button>
        </div>

        {/* Orders Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a202c' }}>
              Órdenes Publicadas
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>No hay órdenes publicadas</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>TIPO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CANTIDAD</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>PRECIO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: order.order_type === 'buy' ? '#c6f6d5' : '#bee3f8',
                            color: order.order_type === 'buy' ? '#22543d' : '#2c5282'
                          }}>
                            {order.order_type === 'buy' ? 'COMPRA' : 'VENTA'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          {order.order_type === 'buy' ? `$${order.cantidad_fiat?.toFixed(2)}` : `${order.cantidad_usdt?.toFixed(4)} USDT`}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          ${order.precio_publicado?.toFixed(3)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          {order.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a202c' }}>
              Transacciones Ejecutadas
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>No hay transacciones registradas</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>TIPO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>CANTIDAD USDT</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>PRECIO</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>MONTO FIAT</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#718096', fontWeight: '600' }}>COMISIÓN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: tx.transaction_type === 'buy' ? '#c6f6d5' : '#bee3f8',
                            color: tx.transaction_type === 'buy' ? '#22543d' : '#2c5282'
                          }}>
                            {tx.transaction_type === 'buy' ? 'COMPRA' : 'VENTA'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          {tx.cantidad_usdt?.toFixed(4)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          ${tx.precio_ejecutado?.toFixed(3)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          ${tx.monto_fiat?.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#1a202c' }}>
                          ${tx.comision_plataforma?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDetail;
