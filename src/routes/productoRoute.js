const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const externalController = require('../controllers/externalController');

router.get('/search', productoController.buscarProductos);

router.get('/', productoController.getProductos);

router.get('/categoria/:categoria_id', productoController.getProductosPorCategoria);

router.get('/:id', productoController.getProductoById);

router.post('/poblar-data', externalController.poblarTablaProductos);

module.exports = router;