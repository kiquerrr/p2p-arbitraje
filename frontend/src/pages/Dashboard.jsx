import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generalCyclesAPI, vaultAPI } from '../services/api';
import { PlusCircle, Wallet, TrendingUp, DollarSign, BarChart3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import Modal from '../components/Modal';
import NewCycleForm from '../components/NewCycleForm';
import DepositForm from '../components/DepositForm';
import VaultMovements from '../components/VaultMovements';

const Dashboard = () => {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cyclesResponse, vaultResponse] = await Promise.all([
        generalCyclesAPI.list(),
        vaultAPI.getStatus()
      ]);
      
      setCycles(cyclesResponse.data.data || []);
      setVault(vaultResponse.data.data.vault);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewCycleSuccess = () => {
    setShowNewCycleModal(false);
    loadData();
  };

  const handleDepositSuccess = () => {
    setShowDepositModal(false);
    loadData();
  };

  const activeCycles = cycles.filter(c => c.status === 'active').length;
  const balanceDisponible = parseFloat(vault?.balance_disponible || 0);
  const balanceInvertido = parseFloat(vault?.balance_invertido || 0);
  const capitalTotal = balanceDisponible + balanceInvertido;
  const gananciasAcumuladas = parseFloat(vault?.ganancias_acumuladas || 0);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '18px', color: '#718096' }}>Cargando...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>P2P Arbitrage</h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
                Sistema de gestión de arbitraje
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '-40px auto 0', padding: '0 40px 40px' }}>
        
        {/* Métricas de Bóveda */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <Wallet size={24} color="#667eea" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '600' }}>Capital Total</h3>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1a202c' }}>
              ${capitalTotal.toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <DollarSign size={24} color="#48bb78" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '600' }}>Fiat Disponible</h3>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#48bb78' }}>
              ${balanceDisponible.toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <BarChart3 size={24} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '600' }}>Capital Invertido</h3>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
              ${balanceInvertido.toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '600' }}>Ciclos Activos</h3>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1a202c' }}>
              {activeCycles}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <button
            onClick={() => setShowDepositModal(true)}
            style={{
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
            }}
          >
            <ArrowDownCircle size={20} />
            Depositar a Bóveda
          </button>

          <button
            onClick={() => setShowNewCycleModal(true)}
            style={{
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
            }}
          >
            <PlusCircle size={20} />
            Nuevo Ciclo
          </button>
        </div>

        {/* Lista de Ciclos */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
              Ciclos Generales
            </h2>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginTop: '40px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
            Movimientos de Bóveda
          </h2>
          <VaultMovements />
        </div>
          </div>

          {cycles.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>
              No hay ciclos creados. Crea tu primer ciclo para comenzar.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cycles.map(cycle => (
                <div
                  key={cycle.id}
                  onClick={() => navigate(`/cycle/${cycle.id}`)}
                  style={{
                    padding: '20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': { borderColor: '#667eea' }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#1a202c' }}>
                        {cycle.name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#718096' }}>
                        Duración: {cycle.duration_days} días | Capital: ${parseFloat(cycle.initial_capital || 0).toFixed(2)}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: cycle.status === 'active' ? '#d1fae5' : cycle.status === 'completed' ? '#dbeafe' : '#f3f4f6',
                      color: cycle.status === 'active' ? '#065f46' : cycle.status === 'completed' ? '#1e40af' : '#6b7280'
                    }}>
                      {cycle.status === 'active' ? 'ACTIVO' : cycle.status === 'completed' ? 'COMPLETADO' : 'PENDIENTE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showNewCycleModal}
        onClose={() => setShowNewCycleModal(false)}
        title="Crear Nuevo Ciclo"
      >
        <NewCycleForm
          onSuccess={handleNewCycleSuccess}
          onCancel={() => setShowNewCycleModal(false)}
          availableBalance={balanceDisponible}
        />
      </Modal>

      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Depositar a Bóveda"
      >
        <DepositForm
          onSuccess={handleDepositSuccess}
          onCancel={() => setShowDepositModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
