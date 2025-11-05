const pool = require('../config/database');

const orderController = {

  calculateBuyPrice: async (req, res) => {
    try {
      const { precio_competencia_venta } = req.body;
      
      if (!precio_competencia_venta) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere precio_competencia_venta'
        });
      }

      const precio_compra = parseFloat(precio_competencia_venta) - 0.001;

      res.json({
        success: true,
        data: {
          precio_competencia_venta: parseFloat(precio_competencia_venta),
          precio_compra_sugerido: precio_compra
        }
      });

    } catch (error) {
      console.error('Error calculando precio compra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al calcular precio de compra'
      });
    }
  },

  calculateSellPrice: async (req, res) => {
    try {
      const { 
        precio_compra, 
        ganancia_neta_objetivo, 
        comision,
        precio_competencia_compra 
      } = req.body;

      if (!precio_compra || !ganancia_neta_objetivo || !comision) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos'
        });
      }

      const P_C = parseFloat(precio_compra);
      const G_N = parseFloat(ganancia_neta_objetivo);
      const K = parseFloat(comision);

      const precio_venta_calculado = (P_C * (1 + G_N)) / (1 - K);
      const punto_equilibrio = P_C / (1 - K);

      if (precio_venta_calculado <= punto_equilibrio) {
        return res.status(400).json({
          success: false,
          message: '⚠️ BLOQUEADO: Precio de venta causaría pérdida',
          data: {
            precio_venta_calculado,
            punto_equilibrio,
            diferencia: precio_venta_calculado - punto_equilibrio
          }
        });
      }

      let precio_venta_final = precio_venta_calculado;
      if (precio_competencia_compra) {
        const P_comp = parseFloat(precio_competencia_compra);
        precio_venta_final = P_comp + 0.001;
        
        if (precio_venta_final <= punto_equilibrio) {
          return res.status(400).json({
            success: false,
            message: '⚠️ ADVERTENCIA: Precio competencia es muy bajo',
            data: {
              precio_venta_calculado,
              precio_competencia_compra: P_comp,
              punto_equilibrio,
              recomendacion: 'Esperar mejores condiciones de mercado'
            }
          });
        }
      }

      res.json({
        success: true,
        data: {
          precio_compra: P_C,
          precio_venta_calculado,
          precio_venta_final,
          punto_equilibrio,
          margen_seguridad: precio_venta_final - punto_equilibrio,
          ganancia_esperada_porcentaje: ((precio_venta_final - P_C) / P_C * 100).toFixed(4)
        }
      });

    } catch (error) {
      console.error('Error calculando precio venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al calcular precio de venta'
      });
    }
  },

  publishBuyOrder: async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        daily_cycle_id,
        cantidad_fiat,
        precio_publicado,
        precio_competencia_venta
      } = req.body;

      await client.query('BEGIN');

      const cycleCheck = await client.query(
        `SELECT dc.*, gc.user_id 
         FROM daily_cycles dc
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE dc.id = $1 AND gc.user_id = $2`,
        [daily_cycle_id, req.user.id]
      );

      if (cycleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Ciclo diario no encontrado'
        });
      }

      const dailyCycle = cycleCheck.rows[0];

      if (parseFloat(dailyCycle.fiat_disponible_inicio) < parseFloat(cantidad_fiat)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Fiat insuficiente',
          data: {
            disponible: dailyCycle.fiat_disponible_inicio,
            solicitado: cantidad_fiat
          }
        });
      }

      const cantidad_usdt_esperada = parseFloat(cantidad_fiat) / parseFloat(precio_publicado);

      const orderResult = await client.query(
        `INSERT INTO orders 
        (daily_cycle_id, type, cantidad_publicada, precio_publicado, 
         monto_total_publicado, status, is_active)
        VALUES ($1, 'buy', $2, $3, $4, 'published', true)
        RETURNING *`,
        [daily_cycle_id, cantidad_usdt_esperada, precio_publicado, cantidad_fiat]
      );

      await client.query(
        `INSERT INTO market_prices 
        (daily_cycle_id, user_id, precio_competencia_venta, source)
        VALUES ($1, $2, $3, 'manual')`,
        [daily_cycle_id, req.user.id, precio_competencia_venta]
      );

      await client.query(
        `UPDATE daily_cycles 
         SET ordenes_activas = true 
         WHERE id = $1`,
        [daily_cycle_id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: '✅ Orden de COMPRA publicada',
        data: orderResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error publicando orden compra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al publicar orden de compra'
      });
    } finally {
      client.release();
    }
  },

  publishSellOrder: async (req, res) => {
    const client = await pool.connect();
    try {
      const {
        daily_cycle_id,
        cantidad_usdt,
        precio_publicado,
        precio_competencia_compra
      } = req.body;

      await client.query('BEGIN');

      const cycleCheck = await client.query(
        `SELECT dc.*, gc.user_id 
         FROM daily_cycles dc
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE dc.id = $1 AND gc.user_id = $2`,
        [daily_cycle_id, req.user.id]
      );

      if (cycleCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Ciclo diario no encontrado'
        });
      }

      const dailyCycle = cycleCheck.rows[0];

      if (parseFloat(dailyCycle.usdt_boveda_inicio) < parseFloat(cantidad_usdt)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'USDT insuficiente en bóveda',
          data: {
            disponible: dailyCycle.usdt_boveda_inicio,
            solicitado: cantidad_usdt
          }
        });
      }

      const monto_fiat_esperado = parseFloat(cantidad_usdt) * parseFloat(precio_publicado);

      const orderResult = await client.query(
        `INSERT INTO orders 
        (daily_cycle_id, type, cantidad_publicada, precio_publicado, 
         monto_total_publicado, status, is_active)
        VALUES ($1, 'sell', $2, $3, $4, 'published', true)
        RETURNING *`,
        [daily_cycle_id, cantidad_usdt, precio_publicado, monto_fiat_esperado]
      );

      await client.query(
        `INSERT INTO market_prices 
        (daily_cycle_id, user_id, precio_competencia_compra, source)
        VALUES ($1, $2, $3, 'manual')`,
        [daily_cycle_id, req.user.id, precio_competencia_compra]
      );

      await client.query(
        `UPDATE daily_cycles 
         SET ordenes_activas = true 
         WHERE id = $1`,
        [daily_cycle_id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: '✅ Orden de VENTA publicada',
        data: orderResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error publicando orden venta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al publicar orden de venta'
      });
    } finally {
      client.release();
    }
  },

  listOrders: async (req, res) => {
    try {
      const { daily_cycle_id } = req.params;

      const result = await pool.query(
        `SELECT o.* 
         FROM orders o
         JOIN daily_cycles dc ON o.daily_cycle_id = dc.id
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE o.daily_cycle_id = $1 AND gc.user_id = $2
         ORDER BY o.created_at DESC`,
        [daily_cycle_id, req.user.id]
      );

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error listando órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes'
      });
    }
  },

  cancelOrder: async (req, res) => {
    const client = await pool.connect();
    try {
      const { order_id } = req.params;

      await client.query('BEGIN');

      const orderCheck = await client.query(
        `SELECT o.*, gc.user_id
         FROM orders o
         JOIN daily_cycles dc ON o.daily_cycle_id = dc.id
         JOIN general_cycles gc ON dc.general_cycle_id = gc.id
         WHERE o.id = $1 AND gc.user_id = $2`,
        [order_id, req.user.id]
      );

      if (orderCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
      }

      await client.query(
        `UPDATE orders 
         SET status = 'cancelled',
             is_active = false,
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [order_id]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Orden cancelada exitosamente'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error cancelando orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar orden'
      });
    } finally {
      client.release();
    }
  }

};

module.exports = orderController;
