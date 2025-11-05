const pool = require('../config/database');

const generalCycleController = {
  
  // Crear nuevo ciclo general
  create: async (req, res) => {
    const client = await pool.connect();
    try {
      const { 
        name, 
        capital_inicial_general, 
        duration_days, 
        target_profit_percent, 
        commission_percent,
        platform_id,
        currency_id
      } = req.body;

      await client.query('BEGIN');

      // Calcular fechas
      const start_date = new Date();
      const end_date = new Date(start_date);
      end_date.setDate(end_date.getDate() + duration_days);

      // Crear ciclo general
      const cycleResult = await client.query(
        `INSERT INTO general_cycles 
        (user_id, name, capital_inicial_general, duration_days, 
         target_profit_percent, commission_percent, platform_id, currency_id,
         start_date, end_date, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING *`,
        [req.user.id, name, capital_inicial_general, duration_days, 
         target_profit_percent, commission_percent, platform_id, currency_id,
         start_date.toISOString().split('T')[0], 
         end_date.toISOString().split('T')[0]]
      );

      const generalCycle = cycleResult.rows[0];

      // Crear ciclos diarios
      const dailyCycles = [];
      for (let i = 1; i <= duration_days; i++) {
        const dayDate = new Date(start_date);
        dayDate.setDate(dayDate.getDate() + (i - 1));
        
        const capital_inicial_dia = i === 1 ? capital_inicial_general : 0;
        
        const dailyResult = await client.query(
          `INSERT INTO daily_cycles 
          (general_cycle_id, day_number, date, capital_inicial_dia, 
           usdt_boveda_inicio, fiat_disponible_inicio, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [generalCycle.id, i, dayDate.toISOString().split('T')[0], 
           capital_inicial_dia, 0, i === 1 ? capital_inicial_general : 0, 
           i === 1 ? 'active' : 'pending']
        );
        
        dailyCycles.push(dailyResult.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Ciclo general creado exitosamente',
        data: {
          generalCycle,
          dailyCycles
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creando ciclo general:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear ciclo general',
        error: error.message
      });
    } finally {
      client.release();
    }
  },

  // Listar ciclos generales del usuario
  list: async (req, res) => {
    try {
      const { status } = req.query;
      
      let query = `
        SELECT gc.*, 
               p.name as platform_name,
               c.code as currency_code,
               c.symbol as currency_symbol,
               COUNT(dc.id) as total_days,
               SUM(CASE WHEN dc.status = 'completed' THEN 1 ELSE 0 END) as completed_days
        FROM general_cycles gc
        LEFT JOIN platforms p ON gc.platform_id = p.id
        LEFT JOIN currencies c ON gc.currency_id = c.id
        LEFT JOIN daily_cycles dc ON gc.id = dc.general_cycle_id
        WHERE gc.user_id = $1
      `;
      
      const params = [req.user.id];
      
      if (status) {
        query += ` AND gc.status = $2`;
        params.push(status);
      }
      
      query += ` GROUP BY gc.id, p.name, c.code, c.symbol ORDER BY gc.created_at DESC`;
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      console.error('Error listando ciclos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ciclos generales'
      });
    }
  },

  // Obtener detalles de un ciclo general
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const cycleResult = await pool.query(
        `SELECT gc.*, 
                p.name as platform_name,
                c.code as currency_code,
                c.symbol as currency_symbol
         FROM general_cycles gc
         LEFT JOIN platforms p ON gc.platform_id = p.id
         LEFT JOIN currencies c ON gc.currency_id = c.id
         WHERE gc.id = $1 AND gc.user_id = $2`,
        [id, req.user.id]
      );

      if (cycleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ciclo no encontrado'
        });
      }

      const dailyCyclesResult = await pool.query(
        `SELECT * FROM daily_cycles 
         WHERE general_cycle_id = $1 
         ORDER BY day_number`,
        [id]
      );

      res.json({
        success: true,
        data: {
          generalCycle: cycleResult.rows[0],
          dailyCycles: dailyCyclesResult.rows
        }
      });

    } catch (error) {
      console.error('Error obteniendo ciclo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalles del ciclo'
      });
    }
  },

  // Completar ciclo general
  complete: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `UPDATE general_cycles 
         SET status = 'completed', 
             completed_at = CURRENT_TIMESTAMP,
             capital_final_general = (
               SELECT capital_final_dia 
               FROM daily_cycles 
               WHERE general_cycle_id = $1 
               ORDER BY day_number DESC 
               LIMIT 1
             ),
             ganancia_total = (
               SELECT SUM(ganancia_neta_dia) 
               FROM daily_cycles 
               WHERE general_cycle_id = $1
             )
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ciclo no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Ciclo completado exitosamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Error completando ciclo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al completar ciclo'
      });
    }
  }

};

module.exports = generalCycleController;
