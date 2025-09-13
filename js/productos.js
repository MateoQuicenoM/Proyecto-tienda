// URL de la API de productos
const API_URL = 'http://localhost:3000/productos';

// Función para obtener productos de la API y renderizarlos
async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const products = await response.json();
        renderProducts(products);
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
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.fotografia || 'https://placehold.co/200x200'}" alt="${product.nombre}">
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
