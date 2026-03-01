const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const {email, role} = req.body;
    const password = String(req.body.password);

    try {

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos' });
        }

        const existingUser = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ msg: 'Usuario ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO usuario (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, passwordHash, role || 'user']
        );


        res.status(201).json({ msg: 'Usuario registrado con exito', user: newUser.rows[0] });
    }
    catch (error) {
        res.status(500).json({ error: 'Error en el servidor', details: error.message });

    }
}

const login = async (req, res) => {
    const { email } = req.body;
    const password = String(req.body.password);

    try{

        const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ msg: 'credenciales invalidas (Email)' });
        }

        const usuario = result.rows[0];

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'credenciales invalidas (Password)' });
        }

        const payload = {
            id: usuario.id,
            email: usuario.email,
            role: usuario.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ msg: 'Bienvenido', token });

    }catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor' });
    }
}

module.exports = { register, login };
