# 📊 P2P ARBITRAGE - ESTADO COMPLETO DEL PROYECTO
**Última actualización:** 12 de Noviembre 2025, 10:30 AM  
**Progreso total:** 80% completado  
**Desarrollador:** Luis  
**Ubicación:** /home/p2p-arbitrage

---

## 🎯 DESCRIPCIÓN DEL PROYECTO

Sistema web completo para gestión de arbitraje P2P de criptomonedas (USDT). Permite:
- Crear y gestionar ciclos de inversión con múltiples días
- Publicar órdenes de compra/venta con cálculo automático de comisiones
- Registrar transacciones ejecutadas
- Gestión centralizada de capital mediante bóveda
- Cálculo automático de ganancias y ROI
- Reinversión automática de ganancias

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack Tecnológico
- **Backend:** Node.js v24 + Express.js
- **Frontend:** React 18 + Vite
- **Base de Datos:** PostgreSQL 17
- **Autenticación:** JWT tokens
- **ORM:** pg (node-postgres)

### Puertos y URLs
- **Backend API:** http://10.68.222.26:3000
- **Frontend Web:** http://10.68.222.26:5174
- **Base de Datos:** PostgreSQL en localhost:5432

### Gestión de Procesos
- **TMUX Sessions:**
  - `p2p-backend` → Backend corriendo en puerto 3000
  - `p2p-frontend` → Frontend corriendo en puerto 5174

---

## ✅ FUNCIONALIDADES COMPLETADAS (80%)

### 1. Sistema de Autenticación ✅
- Registro de usuarios
- Login con JWT
- Middleware de autenticación
- Usuario de prueba: `admin / admin123`

### 2. Gestión de Ciclos Generales ✅
- **Crear ciclos** con configuración personalizada:
  - Nombre del ciclo
  - Capital inicial (desde bóveda)
  - Duración en días
  - Objetivo de ganancia (%)
  - Porcentaje de comisión (%)
- **Listar ciclos** (activos, completados, pendientes)
- **Vista detallada** de cada ciclo con todas sus métricas
- **Transferencia automática** desde bóveda al crear ciclo

### 3. Gestión de Días (Daily Cycles) ✅
- **Día activo** con métricas en tiempo real:
  - Número de día
  - Capital inicial del día
  - USDT en bóveda
  - Fiat disponible
  - Fecha
- **Historial de días cerrados** con:
  - Capital inicial
  - Capital final
  - Ganancia del día
  - Rentabilidad (%)
  - Fecha de cierre
- **Validaciones** de negocio completas

### 4. Sistema de Órdenes ✅
- **Calcular precio de compra:**
  - USDT deseado → Precio con comisión incluida
  - Validación de capital disponible
- **Calcular precio de venta:**
  - USDT a vender → Monto que recibirás después de comisión
- **Publicar órdenes de compra**
- **Publicar órdenes de venta**
- **Cancelar órdenes** publicadas que no se ejecutaron
- **Tabla de órdenes publicadas** con estados:
  - `published` → Orden activa
  - `completed` → Transacción registrada
  - `cancelled` → Orden cancelada

### 5. Sistema de Transacciones ✅
- **Registrar compras ejecutadas:**
  - Cantidad USDT comprada
  - Precio de compra
  - Monto en fiat pagado
  - Comisión calculada automáticamente
  - Cambio calculado
- **Registrar ventas ejecutadas:**
  - Cantidad USDT vendida
  - Precio de venta
  - Monto en fiat recibido
  - Comisión calculada automáticamente
  - Ganancia neta
- **Tabla de transacciones** con todos los detalles
- **Actualización automática** de balances

### 6. Cerrar Día ✅
- **Cierre automático** con cálculos completos:
  - Capital final del día
  - Ganancia total del día
  - ROI del día (%)
  - Rentabilidad acumulada
- **Validaciones:**
  - Todas las órdenes deben estar ejecutadas
  - No puede haber órdenes pendientes
- **Reinversión automática:**
  - Capital día N+1 = Capital final día N
  - Creación automática del siguiente día
- **Actualización de estado** del ciclo

### 7. Sistema de Bóveda (100% COMPLETO) ✅
- **Estructura de base de datos:**
  - Tabla `vault` → Balance del usuario
  - Tabla `vault_movements` → Historial de movimientos
- **Funcionalidades:**
  - ✅ **Depositar capital** a la bóveda
  - ✅ **Crear ciclos** desde bóveda (transferencia automática)
  - ✅ **Retirar fondos** de ciclo a bóveda (recuperar ganancias)
  - ✅ **Ver movimientos** (componente creado)
- **Dashboard de bóveda:**
  - 💰 Capital Total
  - 📊 Fiat Disponible
  - 📈 Capital Invertido
  - 🔄 Ciclos Activos
- **APIs implementadas:**
  - GET `/vault/status`
  - POST `/vault/deposit`
  - POST `/vault/transfer-to-cycle`
  - POST `/vault/transfer-from-cycle`

---

## 📁 ESTRUCTURA COMPLETA DEL PROYECTO
```
/home/p2p-arbitrage/
│
├── backend/                           # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Conexión PostgreSQL
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login/Register
│   │   │   ├── generalCycleController.js  # CRUD ciclos
│   │   │   ├── dailyCycleController.js    # Gestión de días
│   │   │   ├── orderController.js         # Órdenes (con cancelOrder)
│   │   │   ├── transactionController.js   # Transacciones
│   │   │   └── vaultController.js         # Bóveda (4 endpoints)
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT verification
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── generalCycleRoutes.js
│   │   │   ├── dailyCycleRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   └── vaultRoutes.js
│   │   │
│   │   └── server.js                 # Entry point
│   │
│   ├── package.json
│   └── node_modules/
│
├── frontend/                          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx             # Modal reutilizable
│   │   │   ├── DepositForm.jsx       # Formulario depositar
│   │   │   ├── NewCycleForm.jsx      # Formulario crear ciclo
│   │   │   ├── TransferFromCycleForm.jsx  # Formulario retiro
│   │   │   ├── TransactionsTable.jsx      # Tabla transacciones
│   │   │   ├── DailyHistoryTable.jsx      # Historial días
│   │   │   └── VaultMovements.jsx         # Movimientos bóveda
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Página login
│   │   │   ├── Dashboard.jsx         # Dashboard principal
│   │   │   └── CycleDetail.jsx       # Detalle del ciclo
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Configuración axios + endpoints
│   │   │
│   │   ├── App.jsx                   # Router principal
│   │   └── main.jsx                  # Entry point
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/
│
├── .git/                              # Control de versiones
├── ESTADO_PROYECTO.md                 # Este archivo
└── README.md
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS (14 TABLAS)

### Tablas Principales

1. **users**
   - id, username, email, password_hash
   - created_at, updated_at

2. **platforms** (Binance, Bybit, etc)
   - id, name, base_url, api_enabled

3. **currencies** (USDT, VES, COP, etc)
   - id, code, name, symbol

4. **general_cycles**
   - id, user_id, name, duration_days
   - initial_capital, target_profit_percent
   - commission_percent, status
   - start_date, end_date, platform_id, currency_id

5. **daily_cycles**
   - id, general_cycle_id, day_number, date
   - capital_inicial_dia, usdt_boveda_inicio
   - fiat_disponible_inicio, capital_final_dia
   - ganancia_dia, rentabilidad_dia
   - status, closed_at

6. **orders**
   - id, daily_cycle_id, type (buy/sell)
   - usdt_amount, price, total_amount
   - commission, final_amount, status
   - is_active, cancelled_at

7. **transactions**
   - id, daily_cycle_id, order_id, type
   - usdt_amount, price, fiat_amount
   - commission, net_amount, profit
   - exchange_rate, executed_at

8. **vault** ⭐ NUEVO
   - id, user_id
   - balance_disponible (dinero libre)
   - balance_invertido (en ciclos activos)
   - balance_total (suma de ambos)
   - created_at, updated_at

9. **vault_movements** ⭐ NUEVO
   - id, vault_id, type
   - amount, balance_antes, balance_despues
   - general_cycle_id, description
   - created_at

10. **payment_methods**
    - id, name, type

11. **banks**
    - id, name, code

12. **user_payment_methods**
    - id, user_id, payment_method_id, bank_id
    - account_number, account_holder

13. **reports**
    - id, user_id, type, generated_at, file_path

14. **alerts**
    - id, user_id, type, message, is_read

---

## 🔌 API ENDPOINTS COMPLETOS

### 🔐 Authentication
```
POST /auth/register    → Registro de usuario
POST /auth/login       → Login (devuelve JWT)
```

### 💰 Vault (Bóveda)
```
GET  /vault/status              → Balance y métricas
POST /vault/deposit             → Depositar dinero
POST /vault/transfer-to-cycle   → Transferir a ciclo
POST /vault/transfer-from-cycle → Retirar de ciclo
GET  /vault/movements?limit=50  → Historial de movimientos
```

### 🔄 General Cycles
```
GET  /general-cycles           → Listar todos los ciclos
POST /general-cycles           → Crear nuevo ciclo
GET  /general-cycles/:id       → Detalle de un ciclo
PUT  /general-cycles/:id       → Actualizar ciclo
DELETE /general-cycles/:id     → Eliminar ciclo
```

### 📅 Daily Cycles
```
GET  /daily-cycles/active/:general_cycle_id  → Día activo
POST /daily-cycles/close                     → Cerrar día actual
GET  /daily-cycles/history/:general_cycle_id → Historial de días
```

### 📋 Orders
```
POST /orders/calculate-buy-price   → Calcular precio compra
POST /orders/calculate-sell-price  → Calcular precio venta
POST /orders/publish-buy           → Publicar orden compra
POST /orders/publish-sell          → Publicar orden venta
GET  /orders/daily-cycle/:id       → Órdenes de un día
PUT  /orders/:order_id/cancel      → Cancelar orden
```

### 💸 Transactions
```
POST /transactions/register-buy      → Registrar compra
POST /transactions/register-sell     → Registrar venta
GET  /transactions/daily-cycle/:id   → Transacciones de un día
GET  /transactions/summary/:cycle_id → Resumen del ciclo
```

---

## 🔄 FLUJO COMPLETO DE USO

### 1. SETUP INICIAL
```bash
# Login
POST /auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### 2. DEPOSITAR CAPITAL
```bash
# Depositar $10,000 a la bóveda
POST /vault/deposit
{
  "amount": 10000,
  "description": "Capital inicial"
}
```

### 3. CREAR CICLO
```bash
# Crear ciclo de 15 días con $5,000
POST /general-cycles
{
  "name": "Ciclo Enero 2025",
  "duration_days": 15,
  "capital_inicial_general": 5000,
  "target_profit_percent": 2.0,
  "commission_percent": 0.6
}
# → Transfiere automáticamente $5,000 de bóveda a ciclo
```

### 4. OPERAR EN EL DÍA
```bash
# a) Publicar orden de compra
POST /orders/publish-buy
{
  "daily_cycle_id": 1,
  "usdt_amount": 100,
  "buy_price": 36.50
}

# b) Registrar compra ejecutada
POST /transactions/register-buy
{
  "order_id": 1,
  "usdt_amount": 100,
  "buy_price": 36.50,
  "fiat_amount": 3700
}

# c) Publicar orden de venta
POST /orders/publish-sell
{
  "daily_cycle_id": 1,
  "usdt_amount": 100,
  "sell_price": 37.20
}

# d) Registrar venta ejecutada
POST /transactions/register-sell
{
  "order_id": 2,
  "usdt_amount": 100,
  "sell_price": 37.20,
  "fiat_amount": 3720
}
```

### 5. CERRAR DÍA
```bash
# Cerrar día y calcular ganancias
POST /daily-cycles/close
{
  "daily_cycle_id": 1
}
# → Calcula ROI, crea siguiente día, reinvierte capital
```

### 6. RETIRAR GANANCIAS
```bash
# Retirar $500 del ciclo a la bóveda
POST /vault/transfer-from-cycle
{
  "general_cycle_id": 1,
  "amount": 500,
  "description": "Retiro de ganancias"
}
```

---

## 💾 COMANDOS ÚTILES

### Control de Procesos
```bash
# Ver sesiones tmux
tmux ls

# Conectar a backend
tmux attach -t p2p-backend

# Conectar a frontend
tmux attach -t p2p-frontend

# Reiniciar backend
tmux send-keys -t p2p-backend C-c
tmux send-keys -t p2p-backend "cd /home/p2p-arbitrage/backend && npm start" Enter

# Reiniciar frontend
tmux send-keys -t p2p-frontend C-c
tmux send-keys -t p2p-frontend "cd /home/p2p-arbitrage/frontend && npm run dev" Enter
```

### Base de Datos
```bash
# Conectar a PostgreSQL
PGPASSWORD=postgres2025 psql -U postgres -d p2p_arbitrage

# Ver balance de bóveda
PGPASSWORD=postgres2025 psql -U postgres -d p2p_arbitrage -c "
SELECT balance_disponible, balance_invertido, balance_total 
FROM vault WHERE user_id = 1;"

# Ver ciclos activos
PGPASSWORD=postgres2025 psql -U postgres -d p2p_arbitrage -c "
SELECT id, name, status, initial_capital, start_date 
FROM general_cycles WHERE user_id = 1 ORDER BY created_at DESC;"

# Ver último día activo
PGPASSWORD=postgres2025 psql -U postgres -d p2p_arbitrage -c "
SELECT * FROM daily_cycles WHERE status = 'active' ORDER BY date DESC LIMIT 1;"
```

### Git
```bash
# Ver estado
cd /home/p2p-arbitrage
git status

# Ver historial
git log --oneline -10

# Crear commit
git add -A
git commit -m "feat: descripción"
git push origin main
```

---

## 🔜 PENDIENTE (20%)

### Alta Prioridad
1. ✅ **Integrar VaultMovements en Dashboard** (5 min)
   - Ya está el componente creado
   - Solo falta agregarlo al Dashboard

### Reportes y Análisis
2. **Gráfico de rentabilidad diaria** (30 min)
   - Usar Chart.js o Recharts
   - Mostrar ROI por día en línea temporal
   - Filtros por ciclo y rango de fechas

3. **Resumen de comisiones pagadas** (15 min)
   - Total comisiones por ciclo
   - Desglose por día
   - Comparativa con ganancias

4. **Cálculo de ROI del ciclo completo** (15 min)
   - ROI total del ciclo
   - ROI promedio por día
   - Proyección de ganancias

### Mejoras Opcionales
5. **Exportar reportes** (30 min)
   - Excel con resumen del ciclo
   - PDF con gráficos
   - CSV de transacciones

6. **Alertas en tiempo real** (45 min)
   - WebSocket o polling
   - Notificaciones de órdenes ejecutadas
   - Alertas de objetivos alcanzados

7. **Multi-usuario** (1 hora)
   - Dashboard por usuario
   - Roles (admin, trader)
   - Permisos granulares

8. **Modo oscuro** (15 min)
   - Toggle en UI
   - Persistencia en localStorage

---

## 🐛 ISSUES CONOCIDOS

1. ~~Import duplicado de VaultMovements~~ → **RESUELTO**
2. ~~Ruta duplicada en orderRoutes~~ → **RESUELTO**

---

## 📝 NOTAS IMPORTANTES

### Lógica de Negocio
- **Reinversión automática:** Capital final día N = Capital inicial día N+1
- **Comisiones:** Se calculan automáticamente en cada transacción
- **Validación de cierre:** Todas las órdenes deben estar ejecutadas antes de cerrar día
- **Bóveda centralizada:** Todo el capital se gestiona desde la bóveda
- **Transferencias bidireccionales:** Bóveda ↔ Ciclo en ambas direcciones

### Seguridad
- JWT tokens con expiración
- Passwords hasheados con bcrypt
- Validaciones en backend y frontend
- Middleware de autenticación en todas las rutas protegidas

### Performance
- Conexiones de BD con pool
- Transacciones atómicas con BEGIN/COMMIT
- Índices en tablas principales
- Queries optimizadas

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Arreglar import duplicado** (2 min)
2. **Integrar VaultMovements en Dashboard** (5 min)
3. **Commit final** (3 min)
4. **Crear gráficos de rentabilidad** (30 min)
5. **Testing completo** (30 min)

---

## 📞 SOPORTE

**Proyecto iniciado:** Noviembre 2025  
**Última sesión:** 12 de Noviembre 2025  
**Tiempo total invertido:** ~20 horas  
**Progreso:** 80% → Meta 100%

---

## 🏆 LOGROS DESTACADOS

✅ Sistema de bóveda completo y funcional  
✅ Flujo completo de ciclo de arbitraje  
✅ Cálculos automáticos de ROI y ganancias  
✅ Validaciones robustas de negocio  
✅ UI moderna y responsive  
✅ API RESTful completa  
✅ Control de versiones con Git  

---

**FIN DEL DOCUMENTO DE ESTADO**
