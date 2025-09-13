const mysql = require('mysql2');

// Configuración de la conexión
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // usuario MySQL
  password: '',    // contraseña MySQL
  database: 'tienda_online' // nombre de la base de datos que crearemos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err);
    return;
  }
  console.log('✅ Conexión a MySQL exitosa');
});

module.exports = db;
