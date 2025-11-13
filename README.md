# 🚀 Sistema P2P Arbitrage

Sistema web completo para gestión automatizada de arbitraje P2P de criptomonedas (USDT) con reinversión compuesta, control de ciclos diarios y sistema de bóveda (vault) integrado.

## 📋 Descripción

Plataforma profesional diseñada para operadores P2P que permite:
- **Gestión de ciclos generales** de inversión (7, 15, 30, 60, 90 días)
- **Ciclos diarios** con reinversión automática de ganancias
- **Sistema de Bóveda (Vault)** para gestión centralizada de capital
- **Transferencias bidireccionales** entre bóveda y ciclos activos
- **Cálculo automático** de precios de compra/venta con validaciones
- **Registro de transacciones** y cálculo automático de comisiones
- **Sistema de alertas** y validaciones de punto de equilibrio
- **Dashboard interactivo** con visualización de movimientos
- **Panel multi-usuario** con roles (admin, operador, supervisor)

## 🏗️ Arquitectura

### **Stack Tecnológico**
```
Backend:   Node.js 18+ + Express 4.x
Database:  PostgreSQL 15
Auth:      JWT (JSON Web Tokens)
Frontend:  React 18 + Vite 5
Styling:   Inline CSS (sin frameworks)
API:       RESTful con 31 endpoints
```

### **Estructura del Proyecto**
```
p2p-arbitrage/
├── backend/
│   ├── src/
│   │   ├── config/              # Configuración de PostgreSQL
│   │   ├── controllers/         # Lógica de negocio (7 controladores)
│   │   │   ├── authController.js
│   │   │   ├── generalCycleController.js
│   │   │   ├── dailyCycleController.js
│   │   │   ├── orderController.js
│   │   │   ├── transactionController.js
│   │   │   └── vaultController.js
│   │   ├── middleware/          # Auth & validaciones
│   │   ├── routes/              # Rutas de API (6 routers)
│   │   └── server.js            # Servidor Express
│   ├── package.json
│   └── .env                     # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── components/          # 12 componentes React
│   │   │   ├── NewCycleForm.jsx
│   │   │   ├── DepositForm.jsx
│   │   │   ├── VaultMovements.jsx
│   │   │   ├── TransferFromCycleForm.jsx
│   │   │   ├── PublishBuyOrderForm.jsx
│   │   │   ├── PublishSellOrderForm.jsx
│   │   │   ├── RegisterBuyTransactionForm.jsx
│   │   │   ├── RegisterSellTransactionForm.jsx
│   │   │   ├── CloseDayForm.jsx
│   │   │   ├── TransactionsTable.jsx
│   │   │   ├── DailyHistoryTable.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/               # 3 páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── CycleDetail.jsx
│   │   ├── context/             # Context API (AuthContext)
│   │   ├── services/            # API client (Axios)
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── init.sql                 # Schema completo (13 tablas)
│
└── docs/
    ├── README.md                # Este archivo
    ├── TECHNICAL.md             # Documentación técnica
    ├── CHANGELOG.md             # Historial de cambios
    └── ESTADO_PROYECTO.md       # Estado actual
```

## 🔧 Instalación

### **Requisitos Previos**
- Node.js >= 18.x
- PostgreSQL >= 15.x
- npm >= 9.x

### **1. Clonar el repositorio**
```bash
git clone https://github.com/kiquerrr/p2p-arbitrage.git
cd p2p-arbitrage
```

### **2. Configurar Base de Datos**
```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE p2p_arbitrage;"

# Importar schema
psql -U postgres -d p2p_arbitrage -f database/init.sql
```

### **3. Configurar Backend**
```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
cat > .env << 'EOL'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2p_arbitrage
DB_USER=postgres
DB_PASSWORD=tu_password

PORT=3000
NODE_ENV=development

JWT_SECRET=tu_secret_key_minimo_32_caracteres
JWT_EXPIRE=24h

BACKUP_PATH=/home/p2p-arbitrage/backups
BACKUP_TIME=00:00
EOL

# Iniciar servidor
npm start
```

### **4. Configurar Frontend**
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar API endpoint en src/services/api.js
# baseURL: 'http://localhost:3000/api'

# Iniciar servidor de desarrollo
npm run dev
```

**URLs de acceso:**
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5173`

## 📊 Base de Datos - Schema

### **13 Tablas Principales**

#### **Core del Sistema**
- `users` - Usuarios y autenticación
- `platforms` - Plataformas P2P (Binance, etc.)
- `currencies` - Monedas soportadas (USD, VES, etc.)
- `configurations` - Configuración global

#### **Sistema de Bóveda (Vault)**
- `vault` - Bóveda principal de cada usuario
  - `balance_disponible` - Capital disponible para operar
  - `balance_invertido` - Capital en ciclos activos
  - `ganancias_acumuladas` - Ganancias totales históricas
- `vault_movements` - Historial de movimientos
  - Tipos: `deposit`, `withdrawal`, `transfer_to_cycle`, `transfer_from_cycle`, `profit`, `loss`

#### **Gestión de Ciclos**
- `general_cycles` - Ciclos de inversión (7, 15, 30, 60, 90 días)
- `daily_cycles` - Ciclos diarios dentro de un ciclo general
  - 27 campos para tracking completo del día
  - Estados: `pending`, `active`, `completed`, `skipped`

#### **Operaciones**
- `orders` - Órdenes publicadas (compra/venta)
  - Estados: `published`, `partial`, `completed`, `cancelled`, `paused`
- `transactions` - Registro de ejecuciones
  - Tracking de USDT y Fiat antes/después
- `market_prices` - Precios de mercado históricos
- `alerts` - Sistema de alertas y notificaciones
- `backups` - Registro de respaldos

Ver schema completo en `database/init.sql`

## 🔐 API Endpoints

### **Autenticación** (`/api/auth`)
```
POST   /login          # Login con username/password
GET    /verify         # Verificar token JWT
```

### **Bóveda** (`/api/vault`)
```
GET    /status                  # Estado actual de la bóveda
POST   /deposit                 # Registrar depósito
POST   /transfer-to-cycle       # Transferir a ciclo activo
POST   /transfer-from-cycle     # Retirar de ciclo a bóveda
GET    /movements               # Historial de movimientos
```

### **Ciclos Generales** (`/api/general-cycles`)
```
POST   /                        # Crear nuevo ciclo
GET    /                        # Listar ciclos del usuario
GET    /:id                     # Detalle de ciclo específico
PUT    /:id/complete            # Completar ciclo
```

### **Ciclos Diarios** (`/api/daily-cycles`)
```
GET    /:id/status              # Estado del día actual
POST   /:id/close               # Cerrar día y preparar siguiente
```

### **Órdenes** (`/api/orders`)
```
POST   /calculate-buy-price     # Calcular precio de compra
POST   /calculate-sell-price    # Calcular precio de venta
POST   /publish-buy             # Publicar orden de compra
POST   /publish-sell            # Publicar orden de venta
GET    /daily-cycle/:id         # Listar órdenes del día
PUT    /:id/cancel              # Cancelar orden
```

### **Transacciones** (`/api/transactions`)
```
POST   /register-buy            # Registrar ejecución de compra
POST   /register-sell           # Registrar ejecución de venta
GET    /daily-cycle/:id         # Listar transacciones del día
```

## 🧮 Fórmulas de Cálculo

### **Precio de Compra (P_C)**
```javascript
P_C = Precio_Competencia_Venta - 0.001
```
*Objetivo: Ser el comprador más atractivo del mercado*

### **Precio de Venta (P_V)**
```javascript
P_V = (P_C × (1 + %Ganancia_Neta)) / (1 - %Comisión)
```
*Incluye ganancia objetivo + comisión de plataforma*

### **Punto de Equilibrio**
```javascript
Punto_Equilibrio = P_C / (1 - %Comisión)
```

### **Validación Crítica**
```javascript
IF (P_V <= Punto_Equilibrio) {
  BLOQUEAR("⚠️ Precio causaría pérdida");
}
```

## 💰 Sistema de Bóveda (Vault)

### **Concepto**
La bóveda centraliza la gestión de capital del usuario:
- **Balance Disponible**: Capital listo para invertir o retirar
- **Balance Invertido**: Capital activo en ciclos
- **Ganancias Acumuladas**: Histórico de ganancias totales

### **Flujo de Capital**
```
1. Usuario deposita → Bóveda (balance_disponible)
2. Crear ciclo → Transferir a ciclo (balance_invertido++)
3. Ciclo genera ganancia → Automáticamente a bóveda
4. Cerrar ciclo → Capital retorna a bóveda (balance_disponible)
```

### **Tipos de Movimientos**
```
✅ deposit              - Depósito externo
⬇️ transfer_to_cycle    - Transferencia a ciclo
⬆️ transfer_from_cycle  - Retorno desde ciclo
💰 profit               - Ganancia registrada
📉 loss                 - Pérdida registrada
⬅️ withdrawal           - Retiro externo
```

## 📈 Flujo Operativo Completo

### **Fase 1: Preparación**
```bash
# 1. Login en el sistema
POST /api/auth/login
{ "username": "admin", "password": "admin123" }

# 2. Depositar capital inicial
POST /api/vault/deposit
{ "amount": 1000, "description": "Depósito inicial" }

# 3. Crear ciclo general
POST /api/general-cycles
{
  "name": "Ciclo Enero 2025",
  "capital_inicial_general": 1000,
  "duration_days": 15,
  "target_profit_percent": 0.0257,
  "commission_percent": 0.0035
}
```

### **Fase 2: Día de Operaciones**
```bash
# 4. Publicar orden de compra
POST /api/orders/publish-buy
{
  "daily_cycle_id": 1,
  "cantidad_fiat": 1000,
  "precio_publicado": 1.024
}

# 5. Registrar ejecución
POST /api/transactions/register-buy
{
  "order_id": 1,
  "cantidad_usdt": 976.5625,
  "precio_ejecutado": 1.024
}

# 6. Publicar orden de venta
POST /api/orders/publish-sell
{
  "daily_cycle_id": 1,
  "cantidad_usdt": 976.5625,
  "precio_publicado": 1.053
}

# 7. Registrar venta
POST /api/transactions/register-sell
{
  "order_id": 2,
  "cantidad_usdt": 976.5625,
  "precio_ejecutado": 1.053
}

# 8. Cerrar día
POST /api/daily-cycles/1/close
{ "precio_usdt_cierre": 1.053 }
```

**Resultado:** Día 1 cerrado con ganancia de $24.72 (2.47%) → Día 2 inicia con $1,024.72

## 🎯 Características Implementadas

### ✅ **Backend Completo**
- [x] Sistema de autenticación JWT
- [x] CRUD de ciclos generales y diarios
- [x] Cálculo de precios con validaciones
- [x] Sistema de bóveda con 6 tipos de movimientos
- [x] Transferencias bidireccionales vault ↔ cycles
- [x] Publicación y gestión de órdenes
- [x] Registro de transacciones con tracking
- [x] Reinversión compuesta automática
- [x] Sistema de alertas
- [x] Cálculo automático de comisiones
- [x] 31 endpoints REST API documentados

### ✅ **Frontend Funcional**
- [x] Dashboard principal con métricas
- [x] Visualización de movimientos de bóveda
- [x] Formularios de depósito y transferencias
- [x] Creación de ciclos con validaciones
- [x] Detalle de ciclo diario
- [x] Publicación de órdenes (compra/venta)
- [x] Registro de transacciones
- [x] Sistema de autenticación con Context API
- [x] 12 componentes React reutilizables
- [x] 3 páginas principales (Login, Dashboard, CycleDetail)

## 🚧 Próximas Fases

### **Mejoras Inmediatas**
- [ ] Gráficos de rentabilidad (Chart.js / Recharts)
- [ ] Reportes exportables (PDF/Excel)
- [ ] Filtros y búsqueda en movimientos
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro

### **Funcionalidades Avanzadas**
- [ ] Gestión de múltiples usuarios
- [ ] Panel de administración
- [ ] Integración API Binance
- [ ] Automatización de publicaciones
- [ ] Sistema de respaldos automáticos
- [ ] Monitoreo de sistema
- [ ] Tests unitarios e integración

## 👤 Credenciales por Defecto
```
Usuario: admin
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambiar estas credenciales en producción.

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Autenticación JWT con expiración de 24h
- ✅ Validaciones en todos los endpoints
- ✅ Prevención de pérdidas con punto de equilibrio
- ✅ Transacciones de BD con ROLLBACK automático
- ✅ CORS configurado para desarrollo

## 📊 Ejemplo de Proyección

### **Ciclo de 15 días con $1,000 inicial y 2.5% diario:**
```
Día 1:  $1,000.00 → $1,025.00 (+2.50%)
Día 2:  $1,025.00 → $1,050.63 (+2.50%)
Día 3:  $1,050.63 → $1,076.89 (+2.50%)
Día 5:  $1,130.28 → $1,158.54 (+2.50%)
Día 10: $1,343.92 → $1,377.52 (+2.50%)
Día 15: $1,597.87 → $1,637.81 (+63.78% acumulado)
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.

## 📧 Contacto

- GitHub: [@kiquerrr](https://github.com/kiquerrr)
- Email: kiquerrr@gmail.com

---

**Desarrollado con ❤️ para optimizar operaciones P2P de criptomonedas**

*Última actualización: Noviembre 2025*
