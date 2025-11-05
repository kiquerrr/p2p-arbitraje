const pool = require('../config/database');

const transactionController = {

  // Registrar ejecución de COMPRA
  registerBuyExecution: async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        order_id,
        cantidad_usdt,
        precio_ejecutado
      } = req.body;

      if (!order_id || !cantidad_usdt || !precio_ejecutado) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos'
        });
      }

      await client.query('BEGIN');

      // Verificar que la orden existe y es del usuario
      const orderCheck = await client.query(
        `SELECT o.*, dc.id as daily_cycle_id, 
                dc.usdt_boveda_inicio, dc.fiat_disponible_inicio,
                gc.user_id
         FROM orders o
         JOIN daily_cycles dc ON o.daily_cycle_id = dc.id
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE o.id = $1 AND gc.user_id = $2 AND o.type = 'buy'`,
        [order_id, req.user.id]
      );

      if (orderCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada o no es de compra'
        });
      }

      const order = orderCheck.rows[0];
      const dailyCycleId = order.daily_cycle_id;

      const monto_fiat_gastado = parseFloat(cantidad_usdt) * parseFloat(precio_ejecutado);

      // Obtener estado actual de la bóveda
      const currentState = await client.query(
        'SELECT usdt_boveda_inicio, fiat_disponible_inicio FROM daily_cycles WHERE id = $1',
        [dailyCycleId]
      );

      const usdt_antes = parseFloat(currentState.rows[0].usdt_boveda_inicio);
      const fiat_antes = parseFloat(currentState.rows[0].fiat_disponible_inicio);

      // Registrar transacción
      const transactionResult = await client.query(
        `INSERT INTO transactions 
        (order_id, daily_cycle_id, type, cantidad_usdt, precio_ejecutado, 
         monto_fiat, usdt_boveda_antes, usdt_boveda_despues, 
         fiat_antes, fiat_despues, timestamp_ejecucion)
        VALUES ($1, $2, 'buy', $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          order_id, 
          dailyCycleId, 
          cantidad_usdt, 
          precio_ejecutado,
          monto_fiat_gastado,
          usdt_antes,
          usdt_antes + parseFloat(cantidad_usdt),
          fiat_antes,
          fiat_antes - monto_fiat_gastado
        ]
      );

      // Actualizar orden
      const nueva_cantidad_ejecutada = parseFloat(order.cantidad_ejecutada) + parseFloat(cantidad_usdt);
      const nuevo_monto_ejecutado = parseFloat(order.monto_total_ejecutado) + monto_fiat_gastado;
      const porcentaje_ejecutado = (nueva_cantidad_ejecutada / parseFloat(order.cantidad_publicada)) * 100;
      
      let nuevo_status = 'partial';
      if (porcentaje_ejecutado >= 99.9) {
        nuevo_status = 'completed';
      }

      await client.query(
        `UPDATE orders 
         SET cantidad_ejecutada = $1,
             monto_total_ejecutado = $2,
             porcentaje_ejecutado = $3,
             status = $4,
             fecha_primera_ejecucion = COALESCE(fecha_primera_ejecucion, CURRENT_TIMESTAMP),
             fecha_ultima_ejecucion = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [nueva_cantidad_ejecutada, nuevo_monto_ejecutado, porcentaje_ejecutado, nuevo_status, order_id]
      );

      // Actualizar ciclo diario
      await client.query(
        `UPDATE daily_cycles 
         SET usdt_boveda_inicio = usdt_boveda_inicio + $1,
             fiat_disponible_inicio = fiat_disponible_inicio - $2,
             total_usdt_comprados = total_usdt_comprados + $3,
             total_fiat_gastado = total_fiat_gastado + $4,
             num_compras = num_compras + 1
         WHERE id = $5`,
        [cantidad_usdt, monto_fiat_gastado, cantidad_usdt, monto_fiat_gastado, dailyCycleId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Compra registrada exitosamente',
        data: {
          transaction: transactionResult.rows[0],
          orden_actualizada: {
            id: order_id,
            cantidad_ejecutada: nueva_cantidad_ejecutada,
            porcentaje: porcentaje_ejecutado.toFixed(2) + '%',
            status: nuevo_status
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error registrando compra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar compra',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  // Registrar ejecución de VENTA
  registerSellExecution: async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        order_id,
        cantidad_usdt,
        precio_ejecutado
      } = req.body;

      if (!order_id || !cantidad_usdt || !precio_ejecutado) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos'
        });
      }

      await client.query('BEGIN');

      const orderCheck = await client.query(
        `SELECT o.*, dc.id as daily_cycle_id,
                dc.usdt_boveda_inicio, dc.fiat_disponible_inicio,
                gc.user_id, gc.commission_percent
         FROM orders o
         JOIN daily_cycles dc ON o.daily_cycle_id = dc.id
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE o.id = $1 AND gc.user_id = $2 AND o.type = 'sell'`,
        [order_id, req.user.id]
      );

      if (orderCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada o no es de venta'
        });
      }

      const order = orderCheck.rows[0];
      const dailyCycleId = order.daily_cycle_id;
      const commission_percent = parseFloat(order.commission_percent);

      const monto_fiat_bruto = parseFloat(cantidad_usdt) * parseFloat(precio_ejecutado);
      const comision = monto_fiat_bruto * commission_percent;
      const monto_fiat_neto = monto_fiat_bruto - comision;

      const currentState = await client.query(
        'SELECT usdt_boveda_inicio, fiat_disponible_inicio FROM daily_cycles WHERE id = $1',
        [dailyCycleId]
      );

      const usdt_antes = parseFloat(currentState.rows[0].usdt_boveda_inicio);
      const fiat_antes = parseFloat(currentState.rows[0].fiat_disponible_inicio);

      const transactionResult = await client.query(
        `INSERT INTO transactions 
        (order_id, daily_cycle_id, type, cantidad_usdt, precio_ejecutado, 
         monto_fiat, comision, usdt_boveda_antes, usdt_boveda_despues,
         fiat_antes, fiat_despues, timestamp_ejecucion)
        VALUES ($1, $2, 'sell', $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          order_id,
          dailyCycleId,
          cantidad_usdt,
          precio_ejecutado,
          monto_fiat_neto,
          comision,
          usdt_antes,
          usdt_antes - parseFloat(cantidad_usdt),
          fiat_antes,
          fiat_antes + monto_fiat_neto
        ]
      );

      const nueva_cantidad_ejecutada = parseFloat(order.cantidad_ejecutada) + parseFloat(cantidad_usdt);
      const nuevo_monto_ejecutado = parseFloat(order.monto_total_ejecutado) + monto_fiat_neto;
      const porcentaje_ejecutado = (nueva_cantidad_ejecutada / parseFloat(order.cantidad_publicada)) * 100;
      
      let nuevo_status = 'partial';
      if (porcentaje_ejecutado >= 99.9) {
        nuevo_status = 'completed';
      }

      await client.query(
        `UPDATE orders 
         SET cantidad_ejecutada = $1,
             monto_total_ejecutado = $2,
             porcentaje_ejecutado = $3,
             comision = comision + $4,
             status = $5,
             fecha_primera_ejecucion = COALESCE(fecha_primera_ejecucion, CURRENT_TIMESTAMP),
             fecha_ultima_ejecucion = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [nueva_cantidad_ejecutada, nuevo_monto_ejecutado, porcentaje_ejecutado, comision, nuevo_status, order_id]
      );

      await client.query(
        `UPDATE daily_cycles 
         SET usdt_boveda_inicio = usdt_boveda_inicio - $1,
             fiat_disponible_inicio = fiat_disponible_inicio + $2,
             total_usdt_vendidos = total_usdt_vendidos + $3,
             total_fiat_recibido = total_fiat_recibido + $4,
             comisiones_pagadas = comisiones_pagadas + $5,
             num_ventas = num_ventas + 1
         WHERE id = $6`,
        [cantidad_usdt, monto_fiat_neto, cantidad_usdt, monto_fiat_neto, comision, dailyCycleId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Venta registrada exitosamente',
        data: {
          transaction: transactionResult.rows[0],
          orden_actualizada: {
            id: order_id,
            cantidad_ejecutada: nueva_cantidad_ejecutada,
            porcentaje: porcentaje_ejecutado.toFixed(2) + '%',
            status: nuevo_status
          },
          comision_cobrada: comision
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error registrando venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar venta',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  // Listar transacciones de un ciclo diario
  listTransactions: async (req, res) => {
    try {
      const { daily_cycle_id } = req.params;

      const result = await pool.query(
        `SELECT t.*, o.type as order_type
         FROM transactions t
         JOIN orders o ON t.order_id = o.id
         JOIN daily_cycles dc ON t.daily_cycle_id = dc.id
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE t.daily_cycle_id = $1 AND gc.user_id = $2
         ORDER BY t.timestamp_ejecucion DESC`,
        [daily_cycle_id, req.user.id]
      );

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error listando transacciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener transacciones'
      });
    }
  }

};

module.exports = transactionController;
