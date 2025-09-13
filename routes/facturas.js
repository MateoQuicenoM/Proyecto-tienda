const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 📌 POST - crear factura
router.post('/', (req, res) => {
  const { cliente_id, pedido_id, metodo_pago } = req.body;

  if (!cliente_id || !pedido_id || !metodo_pago) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sqlSubtotal = `
    SELECT SUM(pr.precio * pp.cantidad) AS subtotal
    FROM pedidos_productos pp
    JOIN productos pr ON pp.producto_id = pr.id
    WHERE pp.pedido_id = ?
  `;
  db.query(sqlSubtotal, [pedido_id], (err, rows) => {
    if (err) {
      console.error('❌ Error calculando subtotal:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    const subtotal = rows[0].subtotal || 0;
    const impuesto = subtotal * 0.19;
    const envio = 20000;
    const total = subtotal + impuesto + envio;

    const sqlFactura = `
      INSERT INTO facturas (cliente_id, pedido_id, metodo_pago, subtotal, total)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sqlFactura, [cliente_id, pedido_id, metodo_pago, subtotal, total], (err2, result) => {
      if (err2) {
        console.error('❌ Error insertando factura:', err2);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }

      res.json({
        message: '✅ Factura creada correctamente',
        facturaId: result.insertId,
        subtotal,
        impuesto,
        envio,
        total
      });
    });
  });
});

// 📌 GET - listar facturas con detalle de productos
router.get('/', (req, res) => {
  const sql = `
    SELECT f.id AS factura_id, f.fecha, f.metodo_pago, f.subtotal, f.total,
           c.nombre AS cliente,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', pr.id,
               'nombre', pr.nombre,
               'cantidad', pp.cantidad,
               'precio_unitario', pr.precio
             )
           ) AS productos
    FROM facturas f
    JOIN clientes c ON f.cliente_id = c.id
    JOIN pedidos p ON f.pedido_id = p.id
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    GROUP BY f.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error consultando facturas:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

// 📌 GET - obtener una factura por ID
router.get('/:id', (req, res) => {
  const pedidoId = req.params.id;
  const sql = `
    SELECT f.id AS factura_id, f.fecha, f.metodo_pago, f.subtotal, f.total, f.impuesto, f.envio,
           c.nombre AS cliente,
           pr.nombre AS producto_nombre,
           pp.cantidad,
           pr.precio AS precio_unitario
    FROM facturas f
    JOIN clientes c ON f.cliente_id = c.id
    JOIN pedidos p ON f.pedido_id = p.id
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    WHERE f.pedido_id = ?
  `;
  db.query(sql, [pedidoId], (err, results) => {
    if (err) {
      console.error('❌ Error consultando factura:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const factura = {
      factura_id: results[0].factura_id,
      fecha: results[0].fecha,
      metodo_pago: results[0].metodo_pago,
      subtotal: results[0].subtotal,
      total: results[0].total,
      impuesto: results[0].impuesto,
      envio: results[0].envio,
      cliente: results[0].cliente,
      productos: results.map(row => ({
        nombre: row.producto_nombre,
        cantidad: row.cantidad,
        precio_unitario: row.precio_unitario
      }))
    };
    
    res.json(factura);
  });
});

module.exports = router;