import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generalCyclesAPI } from '../services/api';
import { LogOut, PlusCircle, TrendingUp, DollarSign } from 'lucide-react';
import Modal from '../components/Modal';
import NewCycleForm from '../components/NewCycleForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCycleModal, setShowNewCycleModal] = useState(false);

  useEffect(() => {
    loadCycles();
  }, []);

  const loadCycles = async () => {
    try {
      const response = await generalCyclesAPI.list({ status: 'active' });
      setCycles(response.data.data);
    } catch (error) {
      console.error('Error cargando ciclos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCycleSuccess = () => {
    setShowNewCycleModal(false);
    loadCycles();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 40px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <DollarSign size={32} />
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>P2P Arbitrage</h1>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Bienvenido, {user?.username}</p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Stats Cards */}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={20} color="white" />
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '500' }}>
                Ciclos Activos
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1a202c' }}>
              {cycles.length}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#48bb78',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} color="white" />
              </div>
              <h3 style={{ margin: 0, fontSize: '14px', color: '#718096', fontWeight: '500' }}>
                Capital Total
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#1a202c' }}>
              ${cycles.reduce((sum, c) => sum + parseFloat(c.capital_inicial_general || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Cycles List */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
              Ciclos Generales
            </h2>
            <button 
              onClick={() => setShowNewCycleModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <PlusCircle size={18} />
              Nuevo Ciclo
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#718096' }}>Cargando...</p>
            ) : cycles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#718096', marginBottom: '16px' }}>
                  No tienes ciclos activos
                </p>
                <button 
                  onClick={() => setShowNewCycleModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Crear tu primer ciclo
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    onClick={() => navigate(`/cycle/${cycle.id}`)}
                    style={{
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                        {cycle.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#718096' }}>
                        <span>Duración: {cycle.duration_days} días</span>
                        <span>Días completados: {cycle.completed_days}/{cycle.total_days}</span>
                        <span>Capital: ${parseFloat(cycle.capital_inicial_general).toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      background: '#c6f6d5',
                      color: '#22543d',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {cycle.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nuevo Ciclo */}
      <Modal
        isOpen={showNewCycleModal}
        onClose={() => setShowNewCycleModal(false)}
        title="Crear Nuevo Ciclo General"
      >
        <NewCycleForm
          onSuccess={handleNewCycleSuccess}
          onCancel={() => setShowNewCycleModal(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
