const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('./models/db');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de sesiones
app.use(session({
    secret: "clave_secreta_segura",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// 👉 Servir archivos estáticos (frontend)
// Estas líneas se mantienen para cargar CSS, JS y pages desde la raíz.
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// ✅ CORRECCIÓN CLAVE: Le decimos a Express que la URL /images 
// debe apuntar al directorio 'public/images'
app.use('/images', express.static(path.join(__dirname, 'public', 'images'))); 


// 👉 Ruta home (sirve index.html automáticamente)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Rutas API
const productosRoutes = require('./routes/productos');
app.use('/productos', productosRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/clientes', clientesRoutes);

const pedidosRoutes = require('./routes/pedidos');
app.use('/pedidos', pedidosRoutes);

const facturasRoutes = require('./routes/facturas');
app.use('/facturas', facturasRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});