require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productoRoutes = require('./routes/productoRoute');
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});