# 🚀 Sistema P2P Arbitrage

Sistema web para gestión automatizada de arbitraje P2P de criptomonedas (USDT) con reinversión compuesta y control de ciclos diarios.

## 📋 Descripción

Plataforma diseñada para operadores P2P que permite:
- Gestión de ciclos generales de inversión (7, 15, 30, 60, 90 días)
- Ciclos diarios con reinversión automática de ganancias
- Cálculo automático de precios de compra/venta con validaciones
- Registro de transacciones y cálculo de comisiones
- Sistema de alertas y validaciones de punto de equilibrio
- Panel multi-usuario con roles (admin, operador, supervisor)

## 🏗️ Arquitectura

### **Stack Tecnológico**
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL 15
- **Autenticación:** JWT
- **Frontend:** React.js *(en desarrollo)*
- **Despliegue:** Docker / Linux (Debian)

### **Estructura del Proyecto**
```
p2p-arbitrage/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Autenticación, validaciones
│   │   ├── models/          # Modelos de datos
│   │   ├── routes/          # Rutas de API
│   │   ├── services/        # Servicios auxiliares
│   │   └── server.js        # Servidor principal
│   ├── package.json
│   └── .env                 # Variables de entorno
├── frontend/                # *(Próxima fase)*
├── database/
│   └── init.sql             # Schema de base de datos
└── README.md
```

## 🔧 Instalación

### **Requisitos Previos**
- Node.js >= 18.x
- PostgreSQL >= 15.x
- npm >= 9.x

### **1. Clonar el repositorio**
```bash
git clone https://github.com/kiquerrr/p2p-arbitraje.git
cd p2p-arbitraje
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

JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRE=24h
EOL

# Iniciar servidor
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📊 Base de Datos

### **Tablas Principales**
- `users` - Usuarios del sistema
- `general_cycles` - Ciclos de inversión (15, 30, 60 días, etc.)
- `daily_cycles` - Ciclos diarios dentro de un ciclo general
- `orders` - Órdenes publicadas (compra/venta)
- `transactions` - Registro de ejecuciones
- `market_prices` - Precios de mercado
- `alerts` - Sistema de alertas
- `platforms` - Plataformas P2P (Binance, etc.)
- `currencies` - Monedas soportadas

Ver schema completo en `database/init.sql`

## 🔐 API Endpoints

### **Autenticación**
```
POST   /api/auth/login          # Login
GET    /api/auth/verify         # Verificar token
```

### **Ciclos Generales**
```
POST   /api/general-cycles      # Crear ciclo
GET    /api/general-cycles      # Listar ciclos
GET    /api/general-cycles/:id  # Detalle de ciclo
PUT    /api/general-cycles/:id/complete  # Completar ciclo
```

### **Ciclos Diarios**
```
GET    /api/daily-cycles/:id/status  # Estado del día
POST   /api/daily-cycles/:id/close   # Cerrar día
```

### **Órdenes**
```
POST   /api/orders/calculate-buy-price   # Calcular P_C
POST   /api/orders/calculate-sell-price  # Calcular P_V
POST   /api/orders/publish-buy           # Publicar compra
POST   /api/orders/publish-sell          # Publicar venta
GET    /api/orders/daily-cycle/:id       # Listar órdenes
PUT    /api/orders/:id/cancel            # Cancelar orden
```

### **Transacciones**
```
POST   /api/transactions/register-buy   # Registrar compra
POST   /api/transactions/register-sell  # Registrar venta
GET    /api/transactions/daily-cycle/:id # Listar transacciones
```

## 🧮 Fórmulas de Cálculo

### **Precio de Compra (P_C)**
```
P_C = Precio_Competencia_Venta - 0.001
```

### **Precio de Venta (P_V)**
```
P_V = (P_C × (1 + %Ganancia_Neta)) / (1 - %Comisión)
```

### **Punto de Equilibrio**
```
Punto_Equilibrio = P_C / (1 - %Comisión)
```

### **Validación Crítica**
```
SI P_V ≤ Punto_Equilibrio → BLOQUEAR (causaría pérdida)
```

## 📈 Flujo de Operación

### **1. Crear Ciclo General**
```json
POST /api/general-cycles
{
  "name": "Ciclo Enero 2025",
  "capital_inicial_general": 1000,
  "duration_days": 15,
  "target_profit_percent": 0.0257,
  "commission_percent": 0.0035,
  "platform_id": 1,
  "currency_id": 1
}
```

### **2. Día 1: Publicar Compra**
```json
POST /api/orders/publish-buy
{
  "daily_cycle_id": 1,
  "cantidad_fiat": 1000,
  "precio_publicado": 1.024,
  "precio_competencia_venta": 1.025
}
```

### **3. Registrar Ejecución de Compra**
```json
POST /api/transactions/register-buy
{
  "order_id": 1,
  "cantidad_usdt": 976.5625,
  "precio_ejecutado": 1.024
}
```

### **4. Publicar Venta**
```json
POST /api/orders/publish-sell
{
  "daily_cycle_id": 1,
  "cantidad_usdt": 976.5625,
  "precio_publicado": 1.053,
  "precio_competencia_compra": 1.052
}
```

### **5. Registrar Ejecución de Venta**
```json
POST /api/transactions/register-sell
{
  "order_id": 2,
  "cantidad_usdt": 976.5625,
  "precio_ejecutado": 1.053
}
```

### **6. Cerrar Día**
```json
POST /api/daily-cycles/1/close
{
  "precio_usdt_cierre": 1.053
}
```

**Resultado:** Día 1 cerrado con ganancia de $24.72 (2.47%) → Día 2 inicia con $1,024.72

## 🎯 Características Implementadas

### ✅ **MVP Backend Completado**
- [x] Sistema de autenticación JWT
- [x] CRUD de ciclos generales
- [x] Gestión de ciclos diarios
- [x] Cálculo de precios con validaciones
- [x] Publicación de órdenes
- [x] Registro de transacciones
- [x] Reinversión compuesta automática
- [x] Sistema de alertas
- [x] Cancelación de órdenes
- [x] Cálculo automático de comisiones

## 🚧 En Desarrollo

### **Próximas Fases**
- [ ] Frontend React (Dashboard, Formularios, Gráficos)
- [ ] Sistema de reportes y análisis
- [ ] Gestión de múltiples usuarios
- [ ] Integración API Binance
- [ ] Automatización de publicaciones
- [ ] Sistema de respaldos automáticos
- [ ] Notificaciones en tiempo real

## 👤 Usuario por Defecto
```
Usuario: admin
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambiar estas credenciales en producción.

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación JWT con expiración de 24h
- Validaciones en todos los endpoints
- Prevención de pérdidas con punto de equilibrio
- Transacciones de base de datos con ROLLBACK

## 📊 Ejemplo de Resultado

### **Ciclo de 15 días con $1,000 inicial y 2.5% diario:**
```
Día 1:  $1,000.00 → $1,024.72 (+2.47%)
Día 2:  $1,024.72 → $1,050.02 (+2.47%)
Día 3:  $1,050.02 → $1,075.93 (+2.47%)
...
Día 15: $1,434.56 (+43.46% acumulado)
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

GitHub: [@kiquerrr](https://github.com/kiquerrr)

---

**Desarrollado con ❤️ para optimizar operaciones P2P**
