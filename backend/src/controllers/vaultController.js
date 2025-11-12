const pool = require('../config/database');

const vaultController = {
  // Obtener estado de la bóveda
  getStatus: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM vault WHERE user_id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        // Crear bóveda si no existe
        const newVault = await pool.query(
          `INSERT INTO vault (user_id, balance_disponible, balance_invertido)
           VALUES ($1, 0, 0)
           RETURNING *`,
          [req.user.id]
        );
        return res.json({
          success: true,
          data: { vault: newVault.rows[0] }
        });
      }

      res.json({
        success: true,
        data: { vault: result.rows[0] }
      });
    } catch (error) {
      console.error('Error obteniendo bóveda:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de bóveda'
      });
    }
  },

  // Agregar depósito a la bóveda
  addDeposit: async (req, res) => {
    const client = await pool.connect();
    try {
      const { amount, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monto inválido'
        });
      }

      await client.query('BEGIN');

      // Obtener bóveda actual
      const vaultResult = await client.query(
        'SELECT * FROM vault WHERE user_id = $1',
        [req.user.id]
      );

      const vault = vaultResult.rows[0];
      const balanceAntes = parseFloat(vault.balance_disponible);
      const balanceDespues = balanceAntes + parseFloat(amount);

      // Actualizar bóveda
      await client.query(
        `UPDATE vault 
         SET balance_disponible = $1,
             total_depositos = total_depositos + $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [balanceDespues, amount, vault.id]
      );

      // Registrar movimiento
      await client.query(
        `INSERT INTO vault_movements 
         (vault_id, type, amount, balance_antes, balance_despues, description)
         VALUES ($1, 'deposit', $2, $3, $4, $5)`,
        [vault.id, amount, balanceAntes, balanceDespues, description || 'Depósito a bóveda']
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Depósito registrado exitosamente',
        data: {
          balance_anterior: balanceAntes,
          balance_nuevo: balanceDespues,
          monto_depositado: parseFloat(amount)
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error agregando depósito:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar depósito'
      });
    } finally {
      client.release();
    }
  },

  // Transferir de bóveda a ciclo
  transferToCycle: async (req, res) => {
    const client = await pool.connect();
    try {
      const { general_cycle_id, amount, description } = req.body;

      if (!general_cycle_id || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros inválidos'
        });
      }

      await client.query('BEGIN');

      // Verificar bóveda
      const vaultResult = await client.query(
        'SELECT * FROM vault WHERE user_id = $1',
        [req.user.id]
      );

      const vault = vaultResult.rows[0];
      const balanceDisponible = parseFloat(vault.balance_disponible);

      if (balanceDisponible < parseFloat(amount)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Fondos insuficientes en bóveda',
          data: {
            disponible: balanceDisponible,
            requerido: parseFloat(amount)
          }
        });
      }

      // Verificar ciclo
      const cycleResult = await client.query(
        'SELECT * FROM general_cycles WHERE id = $1 AND user_id = $2',
        [general_cycle_id, req.user.id]
      );

      if (cycleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Ciclo no encontrado'
        });
      }

      // Actualizar bóveda
      const newBalanceDisponible = balanceDisponible - parseFloat(amount);
      const newBalanceInvertido = parseFloat(vault.balance_invertido) + parseFloat(amount);

      await client.query(
        `UPDATE vault 
         SET balance_disponible = $1,
             balance_invertido = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalanceDisponible, newBalanceInvertido, vault.id]
      );

      // Registrar movimiento
      await client.query(
        `INSERT INTO vault_movements 
         (vault_id, type, amount, balance_antes, balance_despues, general_cycle_id, description)
         VALUES ($1, 'transfer_to_cycle', $2, $3, $4, $5, $6)`,
        [vault.id, amount, balanceDisponible, newBalanceDisponible, general_cycle_id, 
         description || `Transferencia a ciclo #${general_cycle_id}`]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Transferencia exitosa',
        data: {
          balance_disponible: newBalanceDisponible,
          balance_invertido: newBalanceInvertido,
          monto_transferido: parseFloat(amount)
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error transfiriendo a ciclo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al transferir fondos'
      });
    } finally {
      client.release();
    }
  },

  // Obtener movimientos
  getMovements: async (req, res) => {
    try {
      const { limit = 50 } = req.query;

      const vaultResult = await pool.query(
        'SELECT id FROM vault WHERE user_id = $1',
        [req.user.id]
      );

      if (vaultResult.rows.length === 0) {
        return res.json({
          success: true,
          data: { movements: [] }
        });
      }

      const result = await pool.query(
        `SELECT vm.*, gc.name as cycle_name
         FROM vault_movements vm
         LEFT JOIN general_cycles gc ON vm.general_cycle_id = gc.id
         WHERE vm.vault_id = $1
         ORDER BY vm.created_at DESC
         LIMIT $2`,
        [vaultResult.rows[0].id, limit]
      );

      res.json({
        success: true,
        data: { movements: result.rows }
      });
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener movimientos'
      });
    }
  },
  // Transferir de ciclo a bóveda
  transferFromCycle: async (req, res) => {
    const client = await pool.connect();
    try {
      const { general_cycle_id, amount, description } = req.body;

      if (!general_cycle_id || !amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros inválidos'
        });
      }

      await client.query('BEGIN');

      // Verificar ciclo
      const cycleResult = await client.query(
        'SELECT * FROM general_cycles WHERE id = $1 AND user_id = $2',
        [general_cycle_id, req.user.id]
      );

      if (cycleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Ciclo no encontrado'
        });
      }

      // Obtener día activo del ciclo
      const dailyCycleResult = await client.query(
        `SELECT * FROM daily_cycles 
         WHERE general_cycle_id = $1 AND status = 'active'
         LIMIT 1`,
        [general_cycle_id]
      );

      if (dailyCycleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'No hay día activo en este ciclo'
        });
      }

      const dailyCycle = dailyCycleResult.rows[0];
      const fiatDisponible = parseFloat(dailyCycle.fiat_disponible_inicio || 0);

      if (fiatDisponible < parseFloat(amount)) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Fondos insuficientes en el ciclo',
          data: {
            disponible: fiatDisponible,
            requerido: parseFloat(amount)
          }
        });
      }

      // Actualizar día activo del ciclo
      const newFiatDisponible = fiatDisponible - parseFloat(amount);
      await client.query(
        `UPDATE daily_cycles 
         SET fiat_disponible_inicio = $1
         WHERE id = $2`,
        [newFiatDisponible, dailyCycle.id]
      );

      // Obtener bóveda
      const vaultResult = await client.query(
        'SELECT * FROM vault WHERE user_id = $1',
        [req.user.id]
      );

      const vault = vaultResult.rows[0];
      const balanceDisponible = parseFloat(vault.balance_disponible);
      const balanceInvertido = parseFloat(vault.balance_invertido);

      // Actualizar bóveda
      const newBalanceDisponible = balanceDisponible + parseFloat(amount);
      const newBalanceInvertido = Math.max(0, balanceInvertido - parseFloat(amount));

      await client.query(
        `UPDATE vault 
         SET balance_disponible = $1,
             balance_invertido = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalanceDisponible, newBalanceInvertido, vault.id]
      );

      // Registrar movimiento
      await client.query(
        `INSERT INTO vault_movements 
         (vault_id, type, amount, balance_antes, balance_despues, general_cycle_id, description)
         VALUES ($1, 'transfer_from_cycle', $2, $3, $4, $5, $6)`,
        [vault.id, amount, balanceDisponible, newBalanceDisponible, general_cycle_id,
         description || `Retiro desde ciclo #${general_cycle_id}`]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: '✅ Transferencia exitosa',
        data: {
          balance_disponible: newBalanceDisponible,
          balance_invertido: newBalanceInvertido,
          fiat_ciclo: newFiatDisponible,
          monto_transferido: parseFloat(amount)
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error transfiriendo desde ciclo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al transferir fondos'
      });
    } finally {
      client.release();
    }
  }

};

module.exports = vaultController;
