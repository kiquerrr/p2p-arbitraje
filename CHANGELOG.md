# 📝 Changelog - Sistema P2P Arbitrage

Todos los cambios notables en este proyecto serán documentados en este archivo.

---

## [v0.1.0] - 2025-11-05

### ✨ **Añadido - MVP Backend Completo**

#### **Autenticación**
- Sistema de login con JWT
- Hash de contraseñas con bcrypt
- Middleware de autenticación
- Middleware de roles

#### **Ciclos Generales**
- Crear ciclo general (7, 15, 30, 60, 90 días)
- Listar ciclos del usuario
- Ver detalle de ciclo
- Completar ciclo con cálculo de ganancia total

#### **Ciclos Diarios**
- Creación automática de N ciclos diarios al crear ciclo general
- Ver estado del día actual
- Cerrar día con validaciones
- Preparación automática del día siguiente
- Reinversión compuesta (capital día N → día N+1)

#### **Órdenes**
- Calcular precio de compra (P_C)
- Calcular precio de venta (P_V) con validaciones
- Publicar orden de compra
- Publicar orden de venta
- Listar órdenes de un día
- Cancelar órdenes

#### **Transacciones**
- Registrar ejecución de compra
- Registrar ejecución de venta
- Cálculo automático de comisiones
- Actualización de bóveda USDT y fiat disponible
- Listar transacciones de un día

#### **Base de Datos**
- Schema completo con 11 tablas
- Relaciones y foreign keys
- Índices optimizados
- Triggers para updated_at
- Datos iniciales (plataformas, monedas, usuario admin)

#### **Validaciones**
- Punto de equilibrio (evita pérdidas)
- Capital disponible (fiat y USDT)
- Órdenes activas antes de cerrar día
- Ownership de recursos por usuario

### 🔧 **Configuración**
- Variables de entorno (.env)
- Configuración de PostgreSQL
- Sistema de logs
- CORS habilitado

### 📊 **Testing Completado**
- ✅ Crear ciclo general de 15 días
- ✅ Publicar orden de compra
- ✅ Registrar ejecución de compra (976.5625 USDT)
- ✅ Publicar orden de venta
- ✅ Registrar ejecución de venta ($1,024.72)
- ✅ Cerrar día 1 con ganancia de $24.72 (2.47%)
- ✅ Activar día 2 con capital de $1,024.72

---

## [Próximas Versiones]

### **v0.2.0 - Frontend React** *(Planeado)*
- Dashboard principal
- Formularios de creación de ciclos
- Vista de ciclo diario
- Publicación de órdenes
- Registro de ejecuciones
- Reportes y gráficos

### **v0.3.0 - Reportes y Análisis** *(Planeado)*
- Reportes diarios/semanales/mensuales
- Gráficos de crecimiento
- Análisis de rentabilidad
- Exportación a Excel/PDF
- Dashboard de métricas

### **v0.4.0 - Multi-usuario** *(Planeado)*
- Panel de administración
- Gestión de operadores
- Permisos por rol
- Auditoría de acciones

### **v0.5.0 - Automatización** *(Planeado)*
- Integración API Binance
- Scraping de precios
- Publicación automática de órdenes
- Monitoreo en tiempo real
- Alertas por email/Telegram

### **v1.0.0 - Producción** *(Futuro)*
- Deploy con Docker
- Backup automático
- Monitoreo de sistema
- Documentación completa
- Tests unitarios e integración

---

## 🐛 **Correcciones Importantes**

### **[2025-11-05] - Autenticación PostgreSQL**
- **Problema:** Error de autenticación peer vs md5
- **Solución:** Configurar pg_hba.conf para md5

### **[2025-11-05] - Hash de Contraseña**
- **Problema:** Hash inicial inválido en schema
- **Solución:** Generar hash correcto con bcrypt

### **[2025-11-05] - Sintaxis EOF en controlador**
- **Problema:** Error de sintaxis al agregar función cancelOrder
- **Solución:** Recrear archivo completo con sintaxis correcta

---

**Formato basado en [Keep a Changelog](https://keepachangelog.com/)**
