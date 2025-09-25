# 🛒 Proyecto Tienda Online

Este repositorio contiene el código de la tienda online con Node.js, Express y MySQL.

---

## 🚀 Requisitos previos

- [Node.js](https://nodejs.org/) (v16 o superior).
- [XAMPP](https://www.apachefriends.org/) (para MySQL y phpMyAdmin).
- [Git](https://git-scm.com/).
- [Postman](https://www.postman.com/) para probar endpoints.

---

## 📂 Estructura del proyecto

```
Proyecto-tienda/
│── css/                # Estilos CSS
│── db/                 # Carpeta con script de base de datos
│   └── tienda_online.sql
│── js/                 # Scripts frontend
│── models/             # Conexión con la base de datos
│   └── db.js
│── pages/              # Páginas HTML
│── public/             # Archivos públicos
│── routes/             # Rutas de la API
│   ├── clientes.js
│   ├── facturas.js
│   ├── pedidos.js
│   └── productos.js
│── .gitignore
│── index.js            # Archivo principal del servidor
│── package.json        # Dependencias del proyecto
│── package-lock.json
```

---

## 🗄️ Base de Datos

1. Abrir **phpMyAdmin** desde XAMPP.  
2. Crear la base de datos:

```sql
CREATE DATABASE tienda_online;
```

3. Importar el script incluido en el proyecto:  

- Ubicación: `db/tienda_online.sql`  
- Opción 1: Importar desde phpMyAdmin → pestaña **Importar**.  
- Opción 2: Desde consola:

```bash
mysql -u root -p tienda_online < db/tienda_online.sql
```

---

## ⚙️ Variables de entorno

Crea en la raíz del proyecto un archivo **.env** con la configuración de la base de datos:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tienda_online
DB_PORT=3306
PORT=3000
```

*(si tu usuario MySQL tiene contraseña, agrégala en `DB_PASSWORD`).*

---

## 📦 Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/MateoQuicenoM/Proyecto-tienda.git
```

2. Entrar al proyecto:

```bash
cd Proyecto-tienda
```

3. Instalar dependencias:

```bash
npm install
```

---

## ▶️ Ejecución del servidor

Iniciar el servidor con:

```bash
nodemon index.js
```

El backend quedará corriendo en:  
👉 `http://localhost:3000`

---

## 🧪 Endpoints principales (Postman)

- **GET** → `http://localhost:3000/productos`  
- **POST** → `http://localhost:3000/productos`  
- **PUT** → `http://localhost:3000/productos/:id`  
- **DELETE** → `http://localhost:3000/productos/:id`  

También existen rutas para **clientes**, **pedidos** y **facturas** en la carpeta `routes/`.

---

## ✅ Notas

- Script SQL: `db/tienda_online.sql`  
- Archivo principal: `index.js`  
- Servidor se ejecuta con: `nodemon index.js`  
- Editor recomendado: VS Code
