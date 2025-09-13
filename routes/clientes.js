const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');

// ======================
// LOGIN cliente
// ======================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  db.query(
    'SELECT * FROM clientes WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: 'Error en la base de datos' });
      if (results.length === 0)
        return res.status(401).json({ error: 'Credenciales inválidas' });

      const cliente = results[0];

      // Verificar contraseña encriptada
      const esValida = await bcrypt.compare(password, cliente.password);
      if (!esValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      res.json({
        message: '✅ Inicio de sesión exitoso',
        clienteId: cliente.id,
        nombre: cliente.nombre_completo,
        email: cliente.email,
      });
    }
  );
});

// ======================
// REGISTRO cliente
// ======================
router.post('/registro', async (req, res) => {
  // Se extraen todos los campos del cuerpo de la solicitud
  const { nombre, email, password, documento, fechaNacimiento, direccion, telefono } = req.body;

  // 🚩 Solo se verifican los campos obligatorios
  if (!nombre || !email || !password || !documento || !fechaNacimiento) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // La consulta SQL se mantiene igual. Si 'direccion' o 'telefono'
    // son undefined en la solicitud, se insertarán como NULL en la base de datos
    const sql = 'INSERT INTO clientes (nombre, email, password, direccion, telefono, numero_documento, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, email, hashedPassword, documento, fechaNacimiento, direccion, telefono], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }
        console.error('❌ Error al registrar cliente:', err);
        return res.status(500).json({ error: 'Error en la base de datos' });
      }
      res.status(201).json({ message: '✅ Registro exitoso' });
    });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ======================
// OBTENER CLIENTE POR ID
// ======================
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT id, nombre_completo, numero_documento, email, fecha_nacimiento, edad FROM clientes WHERE id = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener cliente' });
      if (results.length === 0)
        return res.status(404).json({ message: 'Cliente no encontrado' });
      res.json(results[0]);
    }
  );
});

// ======================
// OBTENER PEDIDOS POR CLIENTE
// ======================
router.get('/:id/pedidos', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id AS pedido_id, p.fecha,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', pr.id,
               'nombre', pr.nombre,
               'cantidad', pp.cantidad,
               'precio_unitario', pr.precio
             )
           ) AS productos
    FROM pedidos p
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    WHERE p.cliente_id = ?
    GROUP BY p.id
    ORDER BY p.fecha DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error consultando pedidos del cliente:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

// ======================
// OBTENER FACTURAS POR CLIENTE
// ======================
router.get('/:id/facturas', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT f.id AS factura_id, f.fecha, f.total,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'producto_id', pr.id,
               'nombre', pr.nombre,
               'cantidad', pp.cantidad,
               'precio_unitario', pr.precio
             )
           ) AS productos
    FROM facturas f
    JOIN pedidos p ON f.pedido_id = p.id
    JOIN pedidos_productos pp ON p.id = pp.pedido_id
    JOIN productos pr ON pp.producto_id = pr.id
    WHERE f.cliente_id = ?
    GROUP BY f.id
    ORDER BY f.fecha DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('❌ Error consultando facturas del cliente:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(results);
  });
});

module.exports = router;
