const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // 👈 añadido
const db = require('./models/db');

const app = express();
app.use(express.json());
app.use(cors());

// 👉 Configuración de sesiones
app.use(session({
  secret: "clave_secreta_segura",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // cambiar a true si usas HTTPS
}));

// 👉 Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'pages')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

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
