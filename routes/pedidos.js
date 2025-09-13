const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 📌 GET - listar pedidos con productos
router.get('/', (req, res) => {
  const sql = `
    SELECT p.id AS pedido_id, p.fecha, c.nombre_completo AS cliente, 
           SUM(pr.precio * pp.cantidad) AS subtotal,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', pr.id,
               'nombre', pr.nombre,
               'cantidad', pp.cantidad,
               'precio_unitario', pr.precio
             )
           ) AS productos
    FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    GROUP BY p.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error consultando pedidos:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

// 📌 POST - crear pedido y factura con productos y método de pago
router.post('/', (req, res) => {
  const { cliente_id, productos, metodo_pago } = req.body; // ❗ ¡Importante! 'metodo_pago' debe venir del frontend

  if (!cliente_id || !productos || productos.length === 0 || !metodo_pago) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para el pedido y la factura.' });
  }

  // Paso 1: Insertar el pedido
  const sqlPedido = 'INSERT INTO pedidos (cliente_id) VALUES (?)';
  db.query(sqlPedido, [cliente_id], (err, result) => {
    if (err) {
      console.error('❌ Error insertando pedido:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    const pedidoId = result.insertId;

    // Paso 2: Insertar los productos en la tabla intermedia
    const sqlProductos = 'INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad) VALUES ?';
    const values = productos.map(p => [pedidoId, p.producto_id, p.cantidad]);

    db.query(sqlProductos, [values], (err2) => {
      if (err2) {
        console.error('❌ Error insertando productos del pedido:', err2);
        // Puedes agregar aquí una lógica para revertir la creación del pedido si falla
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      // Paso 3: Calcular el total del pedido para la factura
      const subtotal = productos.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0);
      const impuesto = subtotal * 0.19;
      const envio = 20000;
      const total = subtotal + impuesto + envio;

      // Paso 4: Crear la factura asociada al pedido
      const sqlFactura = `
        INSERT INTO facturas (cliente_id, pedido_id, metodo_pago, subtotal, impuesto, envio, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const facturaValues = [cliente_id, pedidoId, metodo_pago, subtotal, impuesto, envio, total];

      db.query(sqlFactura, facturaValues, (err3, result3) => {
        if (err3) {
          console.error('❌ Error creando factura:', err3);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Si todo es exitoso, enviamos la respuesta
        res.status(201).json({
          message: '✅ Pedido y factura creados correctamente',
          pedidoId,
          facturaId: result3.insertId
        });
      });
    });
  });
});

// 📌 GET - obtener un pedido por ID
router.get('/:id', (req, res) => {
  const pedidoId = req.params.id;
  const sql = `
    SELECT p.id AS pedido_id, p.fecha, c.nombre_completo AS cliente, 
           SUM(pr.precio * pp.cantidad) AS subtotal,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', pr.id,
               'nombre', pr.nombre,
               'cantidad', pp.cantidad,
               'precio_unitario', pr.precio
             )
           ) AS productos
    FROM pedidos p
    JOIN clientes c ON p.cliente_id = c.id
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    WHERE p.id = ?
    GROUP BY p.id
  `;
  db.query(sql, [pedidoId], (err, results) => {
    if (err) {
      console.error('❌ Error consultando pedido:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(results[0]);
  });
});

module.exports = router;
