const pool = require('../config/database');

const dailyCycleController = {

  // Obtener estado actual de un día
  getStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT dc.*, gc.user_id, gc.target_profit_percent, gc.commission_percent
         FROM daily_cycles dc
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE dc.id = $1 AND gc.user_id = $2`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ciclo diario no encontrado'
        });
      }

      const dailyCycle = result.rows[0];

      // Obtener órdenes del día
      const orders = await pool.query(
        'SELECT * FROM orders WHERE daily_cycle_id = $1 ORDER BY created_at',
        [id]
      );

      // Obtener transacciones del día
      const transactions = await pool.query(
        'SELECT * FROM transactions WHERE daily_cycle_id = $1 ORDER BY timestamp_ejecucion',
        [id]
      );

      // Calcular capital total actual
      const capital_total_actual = parseFloat(dailyCycle.usdt_boveda_inicio) * 1.0 + 
                                   parseFloat(dailyCycle.fiat_disponible_inicio);

      res.json({
        success: true,
        data: {
          dailyCycle,
          capital_total_actual,
          orders: orders.rows,
          transactions: transactions.rows,
          resumen: {
            compras_completadas: dailyCycle.num_compras,
            ventas_completadas: dailyCycle.num_ventas,
            usdt_en_boveda: dailyCycle.usdt_boveda_inicio,
            fiat_disponible: dailyCycle.fiat_disponible_inicio,
            ordenes_activas: dailyCycle.ordenes_activas
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado del ciclo diario'
      });
    }
  },

  // Cerrar día y preparar siguiente
  closeDay: async (req, res) => {
    const client = await pool.connect();
    try {
      const { id } = req.params;
      const { precio_usdt_cierre } = req.body;

      await client.query('BEGIN');

      // Verificar que el ciclo pertenece al usuario
      const cycleCheck = await client.query(
        `SELECT dc.*, gc.id as general_cycle_id, gc.user_id, gc.duration_days
         FROM daily_cycles dc
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE dc.id = $1 AND gc.user_id = $2`,
        [id, req.user.id]
      );

      if (cycleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Ciclo diario no encontrado'
        });
      }

      const currentDay = cycleCheck.rows[0];

      // Verificar que no hay órdenes activas pendientes
      const activeOrders = await client.query(
        `SELECT COUNT(*) as count FROM orders 
         WHERE daily_cycle_id = $1 AND is_active = true AND status != 'completed'`,
        [id]
      );

      if (parseInt(activeOrders.rows[0].count) > 0) {
        await client.query('ROLLBACK');
        return res.json({
          success: false,
          message: '⚠️ Tienes órdenes activas sin completar',
          data: {
            ordenes_pendientes: activeOrders.rows[0].count,
            sugerencia: 'Cancela las órdenes o espera a que se completen antes de cerrar el día'
          }
        });
      }

      // Calcular capital final y ganancia
      const usdt_boveda_final = parseFloat(currentDay.usdt_boveda_inicio);
      const fiat_final = parseFloat(currentDay.fiat_disponible_inicio);
      
      // Capital final en USD
      const capital_final_dia = (usdt_boveda_final * parseFloat(precio_usdt_cierre || 1.0)) + fiat_final;
      const capital_inicial_dia = parseFloat(currentDay.capital_inicial_dia);
      const ganancia_neta_dia = capital_final_dia - capital_inicial_dia;
      const rentabilidad_dia = (ganancia_neta_dia / capital_inicial_dia) * 100;

      // Cerrar día actual
      await client.query(
        `UPDATE daily_cycles 
         SET usdt_boveda_cierre = $1,
             fiat_disponible_cierre = $2,
             capital_final_dia = $3,
             ganancia_neta_dia = $4,
             rentabilidad_dia = $5,
             precio_usdt_cierre = $6,
             status = 'completed',
             completed_at = CURRENT_TIMESTAMP,
             ordenes_activas = false
         WHERE id = $7`,
        [usdt_boveda_final, fiat_final, capital_final_dia, 
         ganancia_neta_dia, rentabilidad_dia, precio_usdt_cierre || 1.0, id]
      );

      // Preparar día siguiente si existe
      const nextDay = await client.query(
        `SELECT * FROM daily_cycles 
         WHERE general_cycle_id = $1 AND day_number = $2`,
        [currentDay.general_cycle_id, currentDay.day_number + 1]
      );

      if (nextDay.rows.length > 0) {
        // Actualizar día siguiente con capital inicial
        await client.query(
          `UPDATE daily_cycles 
           SET capital_inicial_dia = $1,
               usdt_boveda_inicio = $2,
               fiat_disponible_inicio = $3,
               status = 'active'
           WHERE id = $4`,
          [capital_final_dia, usdt_boveda_final, fiat_final, nextDay.rows[0].id]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Día cerrado exitosamente',
        data: {
          dia_cerrado: {
            day_number: currentDay.day_number,
            capital_inicial: capital_inicial_dia,
            capital_final: capital_final_dia,
            ganancia_neta: ganancia_neta_dia,
            rentabilidad: rentabilidad_dia.toFixed(4) + '%'
          },
          dia_siguiente: nextDay.rows.length > 0 ? {
            day_number: nextDay.rows[0].day_number,
            capital_inicial: capital_final_dia,
            status: 'active'
          } : null
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cerrando día:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cerrar día',
        error: error.message
      });
    } finally {
      client.release();
    }
  }

};

module.exports = dailyCycleController;
