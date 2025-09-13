// 📌 POST - crear pedido y factura con productos y método de pago
router.post('/', (req, res) => {
  const { cliente_id, productos, metodo_pago } = req.body;

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
        // Si falla la inserción de productos, puedes agregar aquí una lógica para revertir la creación del pedido si falla
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