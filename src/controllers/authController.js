const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
    const {email, password, role} = req.body;
    try {
        const existingUser = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'Usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO usuario (email, password, role) VALUES ($1, $2, $3) RETURNING *',
            [email, passwordHash, role]
        );

        res.status(201).json({ msg: 'Usuario registrado con exito', user: newUser.rows[0] });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });

    }
}

module.exports = { register };
