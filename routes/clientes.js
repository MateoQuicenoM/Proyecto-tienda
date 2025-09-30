const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcryptjs');

// ======================
// LOGIN cliente con sesión
// ======================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    db.query(
        'SELECT id, password, nombre, email FROM clientes WHERE email = ?', 
        [email],
        async (err, results) => {
            if (err) {
                console.error('❌ ERROR DE BASE DE DATOS en LOGIN:', err); 
                return res.status(500).json({ error: 'Error en la base de datos' });
            }
            if (results.length === 0)
                return res.status(401).json({ error: 'Credenciales inválidas' });

            const cliente = results[0];

            const esValida = await bcrypt.compare(password, cliente.password);
            if (!esValida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }

            req.session.user = {
                id: cliente.id,
                nombre: cliente.nombre,
                email: cliente.email
            };

            res.json({
                message: '✅ Inicio de sesión exitoso',
                cliente: req.session.user 
            });
        }
    );
});

// =rupción
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No hay sesión iniciada' });
    }
    res.json({ user: req.session.user }); 
});

// ======================
// Logout
// ======================
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: '✅ Sesión cerrada' });
});

// ======================
// REGISTRO cliente
// ======================
router.post('/registro', async (req, res) => {
    const { nombre, email, password, documento, fechaNacimiento, direccion, telefono } = req.body;

    if (!nombre || !email || !password || !documento || !fechaNacimiento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO clientes (nombre, email, password, direccion, telefono, numero_documento, fecha_nacimiento) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [nombre, email, hashedPassword, direccion, telefono, documento, fechaNacimiento], (err, result) => {
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
// OBTENER CLIENTE POR ID (COMPLETO)
// ======================
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query(
        // ✅ DEBE DEVOLVER ESTOS NOMBRES DE COLUMNA
        'SELECT id, nombre, numero_documento, email, fecha_nacimiento, direccion, telefono FROM clientes WHERE id = ?',
        [id],
        (err, results) => {
            if (err) {
                console.error('❌ Error al obtener cliente:', err);
                return res.status(500).json({ error: 'Error al obtener cliente' });
            }
            if (results.length === 0)
                return res.status(404).json({ message: 'Cliente no encontrado' });
            res.json(results[0]);
        }
    );
});

// ======================
// ACTUALIZAR CLIENTE (SOLO DIRECCIÓN Y TELÉFONO)
// ======================
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { direccion, telefono } = req.body; 

    const updateFields = [];
    const updateValues = [];

    if (direccion !== undefined) {
        updateFields.push('direccion = ?');
        updateValues.push(direccion);
    }
    if (telefono !== undefined) {
        updateFields.push('telefono = ?');
        updateValues.push(telefono);
    }
    
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No se encontraron campos válidos para actualizar.' });
    }

    const finalSql = `UPDATE clientes SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);
    
    db.query(finalSql, updateValues, (err, result) => {
        if (err) {
            console.error('❌ Error al actualizar cliente:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json({ message: '✅ Datos personales actualizados correctamente.' });
    });
});


module.exports = router;