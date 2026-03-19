const pool = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const query = `
      SELECT  p.id_producto, p.nombre, p.precio, p.stock, p.imagen_url, p.descripcion, c.nombre AS categoria
      FROM productos p JOIN categoria c ON p.id_categoria = c.id_categoria ORDER BY p.id_producto ASC `;
    const response = await pool.query(query);
    res.json(response.rows);
  } catch (error) {
    console.error("ERROR getProductos:", error);
    res.status(500).json({ error: 'Error al listar productos', detalle: error.message });
  }
};

const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ msg: "Falta término de búsqueda" });

    const query = `
      SELECT   p.id_producto,  p.nombre, p.precio, p.imagen_url, c.nombre AS categoria
      FROM productos pJOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.nombre ILIKE $1 OR p.descripcion ILIKE $1
      ORDER BY p.id_producto ASC
    `;
    const response = await pool.query(query, [`%${q}%`]);
    res.json(response.rows);
  } catch (error) {
    console.error("ERROR buscarProductos:", error);
    res.status(500).json({ error: 'Error en búsqueda', detalle: error.message });
  }
};

const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        p.*,
        c.nombre AS categoria
      FROM productos p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = $1
    `;
    const response = await pool.query(query, [id]);

    if (response.rows.length === 0) return res.status(404).json({ msg: "No encontrado" });
    res.json(response.rows[0]);
  } catch (error) {
    console.error("ERROR getProductoById:", error);
    res.status(500).json({ error: 'Error al obtener producto', detalle: error.message });
  }
};

const getProductosPorCategoria = async (req, res) => {
  const { categoria_id } = req.params;
  try {
    const query = `
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.imagen_url,
        c.nombre AS categoria
      FROM productos p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE c.id_categoria = $1
      ORDER BY p.id_producto ASC
    `;
    const response = await pool.query(query, [categoria_id]);
    res.json(response.rows);
  } catch (error) {
    console.error("ERROR getProductosPorCategoria:", error);
    res.status(500).json({ error: 'Error al filtrar', detalle: error.message });
  }
};

const crearProducto = async (req, res) => {
    const { nombre, precio, stock, imagen_url, descripcion, id_categoria, youtube_id} = req.body;

    try {
        if (!nombre || !precio || !id_categoria) {
            return res.status(400).json({msg: 'Los campos nombre, precio e id_categoria son obligatorios'});
        }

        const result = await pool.query( `INSERT INTO productos (nombre, precio, stock, imagen_url, descripcion, id_categoria, youtube_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, precio, stock || 0, imagen_url || null, descripcion || null, id_categoria, youtube_id || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("ERROR crearProducto:", error);
        res.status(500).json({ error: 'Error al crear producto', detalle: error.message });
    }
}

module.exports = {
  getProductos,
  buscarProductos,
  getProductoById,
  getProductosPorCategoria, crearProducto
};