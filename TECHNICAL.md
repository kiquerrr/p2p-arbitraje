# 📚 Documentación Técnica - Sistema P2P Arbitrage

## 🏛️ Arquitectura de Base de Datos

### **Modelo Entidad-Relación**
```
users (Usuarios)
  └─ general_cycles (Ciclos Generales)
       └─ daily_cycles (Ciclos Diarios)
            ├─ orders (Órdenes)
            │    └─ transactions (Transacciones)
            └─ market_prices (Precios)
```

### **Relaciones Clave**
- Un usuario puede tener múltiples ciclos generales
- Un ciclo general contiene N ciclos diarios (según duration_days)
- Un ciclo diario puede tener múltiples órdenes
- Una orden puede tener múltiples transacciones (ejecuciones parciales)

---

## 🔄 Flujo de Capital (Crítico)

### **Regla de Oro: 100% del Capital Siempre Activo**
```
Estado del Capital en Ciclo Diario:
├─ USDT en Bóveda (usdt_boveda_inicio)
├─ Fiat Disponible (fiat_disponible_inicio)
└─ En Órdenes Activas (orders.is_active = true)

SIEMPRE: Capital_Total = USDT_Bóveda + Fiat_Disponible + Órdenes_Activas
```

### **Transición de Capital entre Días**
```sql
-- Al cerrar Día N:
UPDATE daily_cycles 
SET capital_final_dia = (usdt_boveda × precio_cierre) + fiat_disponible,
    ganancia_neta_dia = capital_final_dia - capital_inicial_dia;

-- Al iniciar Día N+1:
UPDATE daily_cycles 
SET capital_inicial_dia = (SELECT capital_final_dia FROM daily_cycles WHERE id = N),
    usdt_boveda_inicio = (SELECT usdt_boveda_cierre FROM daily_cycles WHERE id = N),
    fiat_disponible_inicio = (SELECT fiat_disponible_cierre FROM daily_cycles WHERE id = N);
```

---

## 🧮 Sistema de Cálculos

### **1. Precio de Compra (P_C)**
```javascript
// Objetivo: Ser el comprador más atractivo
P_C = Precio_Competencia_Venta - 0.001

// Ejemplo:
// Competencia vende USDT a: $1.025
// Publicamos compra a: $1.024
// → Vendedores nos elegirán a nosotros
```

### **2. Precio de Venta (P_V)**
```javascript
// Fórmula completa:
P_V = (P_C × (1 + %G_N)) / (1 - %K)

// Donde:
// P_C = Precio de compra
// %G_N = Ganancia neta objetivo (ej: 0.0257 = 2.57%)
// %K = Comisión de la plataforma (ej: 0.0035 = 0.35%)

// Ejemplo:
// P_C = $1.024
// %G_N = 2.57%
// %K = 0.35%
// P_V = ($1.024 × 1.0257) / 0.9965 = $1.054
```

### **3. Punto de Equilibrio**
```javascript
// Precio mínimo que cubre costos (sin ganancia):
Punto_Equilibrio = P_C / (1 - %K)

// Ejemplo:
// P_C = $1.024
// %K = 0.35%
// Punto_Equilibrio = $1.024 / 0.9965 = $1.0276

// Validación CRÍTICA:
IF (P_V <= Punto_Equilibrio) {
  BLOQUEAR("Precio causaría pérdida");
}
```

### **4. Cálculo de Comisión**
```javascript
// Solo en VENTAS:
Monto_Bruto = Cantidad_USDT × Precio_Ejecutado
Comisión = Monto_Bruto × %K
Monto_Neto = Monto_Bruto - Comisión

// Ejemplo:
// Vendemos: 976.5625 USDT a $1.053
// Bruto: 976.5625 × 1.053 = $1,028.32
// Comisión: $1,028.32 × 0.0035 = $3.60
// Neto: $1,028.32 - $3.60 = $1,024.72
```

---

## 🔐 Sistema de Autenticación

### **JWT Token Structure**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1699999999,
  "exp": 1700086399
}
```

### **Middleware de Protección**
```javascript
// Todas las rutas excepto /auth/login requieren token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Roles y Permisos**
```
admin:      Acceso total
operator:   Gestión de ciclos y órdenes propias
supervisor: Solo lectura de reportes
```

---

## 🛡️ Validaciones Críticas

### **1. Validación de Capital Disponible**
```javascript
// Antes de publicar COMPRA:
IF (Fiat_Disponible < Cantidad_Fiat_Orden) {
  RECHAZAR("Fiat insuficiente");
}

// Antes de publicar VENTA:
IF (USDT_Bóveda < Cantidad_USDT_Orden) {
  RECHAZAR("USDT insuficiente");
}
```

### **2. Validación de Punto de Equilibrio**
```javascript
// Al calcular P_V:
IF (P_V <= Punto_Equilibrio) {
  BLOQUEAR("Operación causaría pérdida");
  MOSTRAR({
    precio_venta: P_V,
    punto_equilibrio: Punto_Equilibrio,
    deficit: Punto_Equilibrio - P_V
  });
}
```

### **3. Validación de Órdenes Activas**
```javascript
// Antes de cerrar día:
ordenes_activas = COUNT(orders WHERE is_active = true AND status != 'completed')

IF (ordenes_activas > 0) {
  ADVERTIR("Tienes {ordenes_activas} órdenes sin completar");
  SUGERIR("Cancela las órdenes o espera a que se completen");
}
```

---

## 📊 Estados de Entidades

### **Estados de General Cycle**
```
active      → Ciclo en curso
completed   → Ciclo finalizado
cancelled   → Ciclo cancelado
paused      → Ciclo pausado temporalmente
```

### **Estados de Daily Cycle**
```
pending     → Día aún no iniciado
active      → Día en curso (operaciones abiertas)
completed   → Día cerrado con todas las operaciones finalizadas
skipped     → Día sin operaciones (mercado cerrado, etc.)
```

### **Estados de Order**
```
published   → Orden publicada, esperando ejecución
partial     → Parcialmente ejecutada (1% - 99%)
completed   → 100% ejecutada
cancelled   → Cancelada por el operador
paused      → Pausada temporalmente
```

---

## 🔄 Transacciones de Base de Datos

### **Principio ACID**
Todas las operaciones críticas usan transacciones:
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Operaciones múltiples...
  await client.query('INSERT INTO orders...');
  await client.query('UPDATE daily_cycles...');
  await client.query('INSERT INTO transactions...');
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

---

## 🚨 Sistema de Alertas

### **Tipos de Alertas**
```
critical   → Bloquea operación (pérdida inminente)
warning    → Advierte pero permite continuar
info       → Información general
success    → Operación exitosa
```

### **Ejemplos de Alertas**
```javascript
// CRÍTICA:
"⚠️ BLOQUEADO: Precio de venta causaría pérdida"

// ADVERTENCIA:
"⚠️ Ganancia menor a objetivo (0.5% vs 2.57%)"

// INFO:
"✓ Día 1 completado. Ganancia: $24.72"
```

---

## 📈 Optimizaciones de Base de Datos

### **Índices Creados**
```sql
-- Consultas frecuentes optimizadas:
CREATE INDEX idx_daily_cycles_general_cycle ON daily_cycles(general_cycle_id);
CREATE INDEX idx_daily_cycles_date ON daily_cycles(date);
CREATE INDEX idx_orders_daily_cycle ON orders(daily_cycle_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_alerts_user ON alerts(user_id);
```

### **Consultas Optimizadas**
```sql
-- Dashboard del operador (consulta compleja):
SELECT 
  dc.*,
  COUNT(o.id) as total_ordenes,
  SUM(t.monto_fiat) as total_transacciones,
  gc.target_profit_percent
FROM daily_cycles dc
LEFT JOIN orders o ON dc.id = o.daily_cycle_id
LEFT JOIN transactions t ON dc.id = t.daily_cycle_id
JOIN general_cycles gc ON dc.general_cycle_id = gc.id
WHERE gc.user_id = $1 AND dc.status = 'active'
GROUP BY dc.id, gc.target_profit_percent;
```

---

## 🔧 Variables de Entorno
```bash
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=p2p_arbitrage
DB_USER=postgres
DB_PASSWORD=tu_password_segura

# Servidor
PORT=3000
NODE_ENV=production  # development | production | test

# JWT
JWT_SECRET=clave_secreta_minimo_32_caracteres_aqui
JWT_EXPIRE=24h

# Backup
BACKUP_PATH=/backups/p2p-arbitrage
BACKUP_TIME=00:00

# Plataforma
DEFAULT_PLATFORM=binance
DEFAULT_CURRENCY=USD
```

---

## 🐛 Debugging

### **Logs del Sistema**
```bash
# Ver logs en tiempo real:
tmux attach -t p2p-backend

# Logs de PostgreSQL:
tail -f /var/log/postgresql/postgresql-15-main.log

# Logs de la aplicación:
tail -f /home/p2p-arbitrage/backend/logs/app.log
```

### **Queries de Debugging**
```sql
-- Ver estado de un ciclo:
SELECT * FROM daily_cycles WHERE id = 1;

-- Ver órdenes activas:
SELECT * FROM orders WHERE is_active = true;

-- Ver última transacción:
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 1;

-- Verificar capital:
SELECT 
  usdt_boveda_inicio,
  fiat_disponible_inicio,
  (usdt_boveda_inicio + fiat_disponible_inicio) as capital_total
FROM daily_cycles WHERE id = 1;
```

---

## 🚀 Deploy en Producción

### **1. Preparación**
```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias
apt install -y nginx certbot python3-certbot-nginx

# Configurar firewall
ufw allow 80
ufw allow 443
ufw allow 3000
```

### **2. Configurar Nginx**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **3. SSL con Let's Encrypt**
```bash
certbot --nginx -d tu-dominio.com
```

### **4. Process Manager (PM2)**
```bash
npm install -g pm2

cd /home/p2p-arbitrage/backend
pm2 start src/server.js --name p2p-backend
pm2 save
pm2 startup
```

---

## 📊 Métricas y Monitoreo

### **Endpoints de Salud**
```
GET /health
```

### **Métricas Clave**
- Tiempo de respuesta de API
- Número de transacciones/día
- Capital total en el sistema
- Tasa de éxito de órdenes
- Rentabilidad promedio

---

**Última actualización:** 2025-11-05
