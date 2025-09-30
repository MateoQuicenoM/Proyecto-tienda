// URL de la API de productos
const API_URL = 'http://localhost:3000/productos';

// Función para obtener productos de la API y renderizarlos
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        
        // --- INICIO DE MODIFICACIÓN TEMPORAL PARA PRUEBA ---
        // **REEMPLAZAR POR LA LÓGICA REAL SI USAS UNA DB**
        const productsFromDB = await response.json(); 
        
        // Asumiendo que la DB devuelve 3 productos con IDs 1, 2, 3
        const products = productsFromDB.map(p => {
             // Aquí se ajusta el nombre de la imagen basado en el nombre del producto
             // Esta lógica es solo si *no* estás insertando el nombre de archivo en la DB.
             // La mejor práctica es que el campo 'fotografia' en la DB contenga 'Laptop-Gamer.jpg'
             let fotografia = 'https://placehold.co/200x200'; // Placeholder por defecto
             if (p.nombre.includes('Laptop Gamer')) {
                fotografia = 'Laptop-Gamer.jpg';
             } else if (p.nombre.includes('Mouse Inalámbrico')) {
                 fotografia = 'Mouse-Inalámbrico.jpg';
             } else if (p.nombre.includes('Teclado Mecánico')) {
                 fotografia = 'Teclado-Mecánico.jpg';
             }
             return { ...p, fotografia };
        });
        // --- FIN DE MODIFICACIÓN TEMPORAL PARA PRUEBA ---
        
        renderProducts(products); // Renderiza los productos
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('productos');
        container.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
    }
}

// Función para renderizar los productos en el HTML
function renderProducts(products) {
    const container = document.getElementById('productos');
    container.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    products.forEach(product => {
        // ✅ CORRECCIÓN CLAVE: Prefijamos con '/images/' la ruta de la fotografía
        // El tamaño de 200x200 es por el CSS y no es controlado por la etiqueta <img>.
        const imagePath = product.fotografia.startsWith('http') || product.fotografia.startsWith('https')
                          ? product.fotografia // Si es una URL completa (el placeholder)
                          : `/images/${product.fotografia}`; // Si es un nombre de archivo local
                          
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${imagePath || 'https://placehold.co/200x200'}" alt="${product.nombre}">
            <h3>${product.nombre}</h3>
            <p>${product.descripcion}</p>
            <p class="price">$${product.precio.toLocaleString('es-CO')}</p>
            <button onclick="addToCart(${product.id}, '${product.nombre}', ${product.precio})">Añadir al carrito</button>
        `;
        container.appendChild(productCard);
    });
}

// Función para añadir productos al carrito
function addToCart(productId, productName, productPrice) {
    // Obtener el carrito del localStorage o inicializarlo si no existe
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Buscar si el producto ya está en el carrito
    const existingProduct = carrito.find(item => item.id === productId);

    if (existingProduct) {
        // Si ya existe, incrementar la cantidad
        existingProduct.cantidad += 1;
    } else {
        // Si no existe, agregarlo con cantidad 1
        carrito.push({
            id: productId,
            nombre: productName,
            precio: productPrice,
            cantidad: 1
        });
    }

    // Guardar el carrito actualizado en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`✅ Producto añadido al carrito: ${productName}`);
}

// Cargar los productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', fetchProducts);