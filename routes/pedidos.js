const express = require('express');
const router = express.Router();
const db = require('../models/db');
// const bcrypt = require('bcryptjs'); // No necesario aquí si solo manejas pedidos

// 📌 POST - crear pedido y factura con productos y método de pago
router.post('/', (req, res) => {
    const { cliente_id, productos, metodo_pago } = req.body;

    if (!cliente_id || !productos || productos.length === 0 || !metodo_pago) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para el pedido y la factura.' });
    }

    // Paso 1: Insertar el pedido
    // ✅ CORRECCIÓN CLAVE: Se añade 'fecha' usando NOW() para evitar fallo de columna NOT NULL
    const sqlPedido = 'INSERT INTO pedidos (cliente_id, fecha) VALUES (?, NOW())';
    
    db.query(sqlPedido, [cliente_id], (err, result) => {
      if (err) {
        console.error('❌ Error insertando pedido:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      const pedidoId = result.insertId;

      // Paso 2: Insertar los productos en la tabla intermedia
      const sqlProductos = 'INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad, precio_unitario) VALUES ?';
      const values = productos.map(p => [pedidoId, p.producto_id, p.cantidad, p.precio_unitario]);

      db.query(sqlProductos, [values], (err2) => {
        if (err2) {
          console.error('❌ Error insertando productos del pedido:', err2);
          // Es crítico eliminar el pedido si falla la inserción de productos (transacciones)
          // Para simplificar, solo se hace un rollback manual:
          db.query('DELETE FROM pedidos WHERE id = ?', [pedidoId]);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }

        // Paso 3: Calcular el total del pedido para la factura
        const subtotal = productos.reduce((sum, p) => sum + (p.precio_unitario * p.cantidad), 0);
        const impuesto = subtotal * 0.19;
        const envio = 20000;
        const total = subtotal + impuesto + envio;

        // Paso 4: Crear la factura asociada al pedido
        // ✅ CORRECCIÓN DE SINTAXIS/ROBUSTEZ: Se convierte a una sola línea y se añade 'fecha'
        const sqlFactura = 'INSERT INTO facturas (cliente_id, pedido_id, metodo_pago, subtotal, impuesto, envio, total, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())';
        
        const facturaValues = [cliente_id, pedidoId, metodo_pago, subtotal, impuesto, envio, total];

        db.query(sqlFactura, facturaValues, (err3, result3) => {
          if (err3) {
            console.error('❌ Error creando factura:', err3);
            // Deberías hacer un rollback total aquí también si esto falla
            return res.status(500).json({ error: 'Error en la base de datos' });
          }

          res.status(201).json({
            message: '✅ Pedido y factura creados correctamente',
            pedidoId: pedidoId, // Corregido a camelCase para coincidir con el frontend
            facturaId: result3.insertId
          });
        });
      });
    });
});

// ===============================================
// Ruta GET - Historial de pedidos
// ===============================================
router.get('/cliente/:id', (req, res) => {
    const { id } = req.params;
    
    // Se añade .trim() para seguridad
    const sql = `
SELECT 
f.pedido_id, 
f.fecha,
f.total 
FROM pedidos p
JOIN facturas f ON p.id = f.pedido_id
WHERE p.cliente_id = ?
ORDER BY f.fecha DESC
`.trim();

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('❌ Error consultando historial de pedidos:', err);
            return res.status(500).json({ error: 'Error en la base de datos al buscar historial de pedidos. Revisa el log para detalles.' });
        }
        res.json(results);
    });
});

module.exports = router;