const pool = require('../config/db');

const poblarTablaProductos = async (req, res) => {
    const client = await pool.connect();
    try {
        const respuesta = await fetch('https://fakestoreapi.com/products');
        const datos = await respuesta.json();
        
        await client.query('BEGIN'); 

        for (const prod of datos) {
            
            let categoriaId;
            const checkCat = await client.query('SELECT id_categoria FROM categoria WHERE nombre = $1', [prod.category]);

            if (checkCat.rows.length > 0) {
                categoriaId = checkCat.rows[0].id_categoria;
            } else {
                const newCat = await client.query(
                    'INSERT INTO categoria (nombre) VALUES ($1) RETURNING id_categoria',
                    [prod.category]
                );
                categoriaId = newCat.rows[0].id_categoria;
            }

            await client.query(
                `INSERT INTO productos (nombre, precio, stock, descripcion, imagen_url, id_categoria) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [prod.title, prod.price, 50, prod.description, prod.image, categoriaId]
            );
        }

        await client.query('COMMIT');
        res.json({ msg: 'Base de datos poblada con éxito' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { poblarTablaProductos };