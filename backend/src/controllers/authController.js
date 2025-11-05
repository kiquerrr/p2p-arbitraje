const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Usuario y contraseña son requeridos' 
        });
      }

      const result = await pool.query(
        'SELECT id, username, email, password_hash, role, status FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      const user = result.rows[0];

      if (user.status !== 'active') {
        return res.status(403).json({ 
          success: false, 
          message: 'Usuario inactivo o suspendido' 
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Credenciales inválidas' 
        });
      }

      // Actualizar último login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error en el servidor' 
      });
    }
  },

  // Verificar token
  verifyToken: async (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  }
};

module.exports = authController;
