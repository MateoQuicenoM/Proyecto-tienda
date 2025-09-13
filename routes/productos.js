const express = require('express');
const router = express.Router();
const db = require('../models/db'); // conexión a MySQL

// --- GET: listar todos los productos ---
router.get('/', (req, res) => {
    const query = `SELECT * FROM productos`;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener los productos' });
        }
        res.json(results);
    });
});

// --- GET: obtener un solo producto por id ---
router.get('/:id', (req, res) => {
    const productoId = req.params.id;
    const query = `SELECT * FROM productos WHERE id = ?`;
    db.query(query, [productoId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el producto' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(results[0]);
    });
});

// --- POST: crear un producto ---
router.post('/', (req, res) => {
    const { nombre, fotografia, precio, descripcion, stock } = req.body;

    if (!nombre || !fotografia || !precio || !descripcion || stock === undefined) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const query = `INSERT INTO productos (nombre, fotografia, precio, descripcion, stock) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [nombre, fotografia, precio, descripcion, stock], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al crear el producto' });
        }
        res.status(201).json({ message: 'Producto creado correctamente', id: result.insertId });
    });
});

// --- PUT: actualizar un producto ---
router.put('/:id', (req, res) => {
    const productoId = req.params.id;
    const { nombre, fotografia, precio, descripcion, stock } = req.body;

    const query = `UPDATE productos SET nombre = ?, fotografia = ?, precio = ?, descripcion = ?, stock = ? WHERE id = ?`;
    db.query(query, [nombre, fotografia, precio, descripcion, stock, productoId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el producto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    });
});

// --- DELETE: eliminar un producto ---
router.delete('/:id', (req, res) => {
    const productoId = req.params.id;

    const query = `DELETE FROM productos WHERE id = ?`;
    db.query(query, [productoId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar el producto' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
});

module.exports = router;
