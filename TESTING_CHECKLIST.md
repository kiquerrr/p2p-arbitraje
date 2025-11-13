# ✅ Checklist de Testing - P2P Arbitrage

**Fecha de testing:** ___________  
**Testeador:** ___________  
**Versión:** v1.0.0

---

## 🔐 1. Autenticación

- [ ] Login con credenciales correctas (admin/admin123)
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Verificar que el token JWT se guarda
- [ ] Logout y verificar redirección
- [ ] Intentar acceder a Dashboard sin login (debe redirigir)

**Bugs encontrados:**
```
___________________________________________
```

---

## 💰 2. Sistema de Vault

### Depósito
- [ ] Depositar $1,000 en vault
- [ ] Verificar que balance_disponible = $1,000
- [ ] Verificar que aparece en movimientos
- [ ] Depositar $500 más
- [ ] Verificar que balance_disponible = $1,500

### Movimientos
- [ ] Ver historial de movimientos
- [ ] Verificar que muestra tipo "deposit"
- [ ] Verificar balance antes/después

**Resultados:**
```
Balance inicial: $_______
Después de depósitos: $_______
Movimientos registrados: _______
```

**Bugs encontrados:**
```
___________________________________________
```

---

## 🔄 3. Crear Ciclo General

- [ ] Hacer clic en "Nuevo Ciclo"
- [ ] Llenar formulario:
  - Nombre: "Ciclo de Prueba"
  - Capital inicial: $1,000
  - Duración: 15 días
  - Ganancia objetivo: 2.5%
  - Comisión: 0.35%
- [ ] Verificar que se crea el ciclo
- [ ] Verificar que se crean 15 días automáticamente
- [ ] Verificar que vault.balance_invertido = $1,000
- [ ] Verificar que vault.balance_disponible = $500

**Resultados:**
```
ID del ciclo: _______
Días creados: _______
Balance vault después: $_______
```

**Bugs encontrados:**
```
___________________________________________
```

---

## 📅 4. Día 1 - Operaciones Completas

### 4.1 Orden de Compra

- [ ] Calcular precio de compra
  - Precio competencia venta: $1.025
  - Precio calculado: $1.024 (debe ser -0.001)
- [ ] Publicar orden de compra
  - Cantidad fiat: $1,000
  - Verificar que se publica correctamente
- [ ] Verificar que orden aparece en lista
- [ ] Verificar estado: "published"

### 4.2 Registrar Compra

- [ ] Registrar ejecución de compra
  - Cantidad USDT: _______ (calcular: $1,000 / $1.024)
  - Precio ejecutado: $1.024
- [ ] Verificar que orden cambia a "completed"
- [ ] Verificar que daily_cycle.usdt_boveda_cierre aumenta
- [ ] Verificar que daily_cycle.fiat_disponible_cierre disminuye
- [ ] Verificar que transacción se registra

**Resultados compra:**
```
USDT comprados: _______
Fiat gastado: $_______
Estado orden: _______
```

### 4.3 Orden de Venta

- [ ] Calcular precio de venta
  - Precio compra: $1.024
  - Ganancia objetivo: 2.5%
  - Comisión: 0.35%
  - Precio calculado: $_______ 
  - Punto de equilibrio: $_______
  - Validar que P_V > Punto_Equilibrio
- [ ] Publicar orden de venta
  - Cantidad USDT: (todo lo comprado)
  - Verificar publicación correcta

### 4.4 Registrar Venta

- [ ] Registrar ejecución de venta
  - Precio ejecutado: (igual al publicado)
- [ ] Verificar cálculo de comisión (0.35%)
- [ ] Verificar que orden cambia a "completed"
- [ ] Verificar que fiat aumenta
- [ ] Verificar que USDT disminuye a 0

**Resultados venta:**
```
USDT vendidos: _______
Fiat recibido bruto: $_______
Comisión pagada: $_______
Fiat neto: $_______
```

### 4.5 Cerrar Día 1

- [ ] Hacer clic en "Cerrar Día"
- [ ] Verificar cálculos:
  - Capital final día: $_______
  - Capital inicial día: $_______
  - Ganancia neta: $_______
  - Rentabilidad %: _______%
- [ ] Verificar que día 1 cambia a "completed"
- [ ] Verificar que día 2 cambia a "active"
- [ ] Verificar que capital día 2 = capital final día 1

**Resultados día 1:**
```
Capital inicial: $1,000.00
Capital final: $_______
Ganancia: $_______
Rentabilidad: _______%
¿Pasó a día 2?: _______
```

**Bugs encontrados:**
```
___________________________________________
```

---

## 🔄 5. Transferencias Vault ↔ Cycle

### Transferir de Vault a Ciclo

- [ ] Depositar $500 en vault
- [ ] Transferir $300 al ciclo activo
- [ ] Verificar que vault.balance_disponible disminuye $300
- [ ] Verificar que vault.balance_invertido aumenta $300
- [ ] Verificar que se registra movimiento tipo "transfer_to_cycle"
- [ ] Verificar que daily_cycle.fiat_disponible_inicio aumenta

### Transferir de Ciclo a Vault

- [ ] Desde detalle de ciclo, transferir $200 a vault
- [ ] Verificar que vault.balance_disponible aumenta $200
- [ ] Verificar que vault.balance_invertido disminuye $200
- [ ] Verificar que se registra movimiento tipo "transfer_from_cycle"
- [ ] Verificar que daily_cycle.fiat_disponible_cierre disminuye

**Resultados:**
```
Transferido a ciclo: $_______
Transferido a vault: $_______
Balance vault final: $_______
```

**Bugs encontrados:**
```
___________________________________________
```

---

## ❌ 6. Cancelación de Órdenes

- [ ] Publicar una orden de compra
- [ ] Cancelar la orden SIN ejecutar
- [ ] Verificar que estado cambia a "cancelled"
- [ ] Verificar que is_active = false
- [ ] Verificar que capital vuelve a estar disponible

**Bugs encontrados:**
```
___________________________________________
```

---

## 📊 7. Validaciones Críticas

### Validación de Capital Insuficiente

- [ ] Intentar crear ciclo con más capital que disponible en vault
- [ ] Debe mostrar error: "Capital insuficiente"
- [ ] Intentar publicar orden de compra > fiat disponible
- [ ] Debe bloquear
- [ ] Intentar publicar orden de venta > USDT disponible
- [ ] Debe bloquear

### Validación de Punto de Equilibrio

- [ ] Calcular precio de venta con ganancia muy baja (0.1%)
- [ ] Si P_V <= Punto_Equilibrio, debe bloquear
- [ ] Debe mostrar mensaje claro con el déficit

### Validación de Órdenes Activas

- [ ] Dejar una orden sin completar
- [ ] Intentar cerrar día
- [ ] Debe advertir sobre órdenes pendientes

**Bugs encontrados:**
```
___________________________________________
```

---

## 🔍 8. Visualización de Datos

### Dashboard

- [ ] Ver resumen de vault
- [ ] Ver lista de ciclos activos
- [ ] Ver últimos movimientos
- [ ] Todas las cifras deben coincidir con BD

### Detalle de Ciclo

- [ ] Ver información del ciclo
- [ ] Ver lista de días
- [ ] Ver órdenes del día actual
- [ ] Ver transacciones del día

**Bugs encontrados:**
```
___________________________________________
```

---

## 📈 9. Completar Ciclo Completo (Opcional - Largo)

Si tienes tiempo, prueba un ciclo completo de 7 días:

- [ ] Día 1: Compra + Venta + Cierre ✓
- [ ] Día 2: Compra + Venta + Cierre ✓
- [ ] Día 3: Compra + Venta + Cierre ✓
- [ ] Día 4: Compra + Venta + Cierre ✓
- [ ] Día 5: Compra + Venta + Cierre ✓
- [ ] Día 6: Compra + Venta + Cierre ✓
- [ ] Día 7: Compra + Venta + Cierre ✓
- [ ] Completar ciclo general
- [ ] Verificar ganancia total acumulada
- [ ] Verificar rentabilidad %

**Resultados finales:**
```
Capital inicial: $______
Capital final: $______
Ganancia total: $______
Rentabilidad: ______%
```

---

## 📝 RESUMEN DE TESTING

### Estadísticas

- **Total de pruebas:** _______
- **Pruebas exitosas:** _______
- **Bugs encontrados:** _______
- **Bugs críticos:** _______

### Bugs Críticos (Bloquean uso)
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Bugs Menores (No bloquean)
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Mejoras Sugeridas
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

### Optimizaciones Recomendadas
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

---

## ✅ Conclusión

**¿El sistema está listo para uso real?** [ ] SÍ  [ ] NO

**Razones:**
```
___________________________________________
___________________________________________
___________________________________________
```

**Próximos pasos:**
```
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________
```

---

**Firma:** ___________  
**Fecha:** ___________
