// URL de la API de productos
const API_URL = 'http://localhost:3000/productos';

// Función para obtener productos de la API y renderizarlos
async function fetchAndRenderProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('productosDestacados');
        if (container) {
            container.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
        }
    }
}

// Función para renderizar los productos en el HTML
function renderProducts(products) {
    const container = document.getElementById('productosDestacados');
    
    if (!container) {
        console.error("Contenedor 'productosDestacados' no encontrado.");
        return;
    }

    container.innerHTML = ''; // Limpiar el contenedor antes de renderizar

    products.forEach(product => {
        
        let finalFotografia = product.fotografia;
        
        // ⭐ CORRECCIÓN 1: Lógica para asignar un nombre de archivo local si la API no lo proporciona
        // Esto es necesario porque el campo 'fotografia' venía vacío, causando el placeholder.
        if (!finalFotografia || finalFotografia === 'https://placehold.co/200x200') {
             if (product.nombre.includes('Laptop Gamer')) {
                 finalFotografia = 'Laptop-Gamer.jpg';
             } else if (product.nombre.includes('Mouse Inalámbrico')) {
                 finalFotografia = 'Mouse-Inalámbrico.jpg';
             } else if (product.nombre.includes('Teclado Mecánico')) {
                 finalFotografia = 'Teclado-Mecánico.jpg';
             }
        }

        // ⭐ CORRECCIÓN 2: Lógica para construir la ruta de la imagen local con /images/
        let imageSource = 'https://placehold.co/200x200'; // Valor por defecto
        
        if (finalFotografia) {
            const isExternalUrl = finalFotografia.startsWith('http') || finalFotografia.startsWith('https');
            
            if (isExternalUrl) {
                imageSource = finalFotografia; // Es una URL completa o el placeholder
            } else {
                // Es un nombre de archivo local (ej. 'Laptop-Gamer.jpg'). Construimos la ruta.
                imageSource = `/images/${finalFotografia}`;
            }
        }
        
        const productCard = document.createElement('div');
        // ✅ CORRECCIÓN 3: Se usa 'producto-card' para aplicar el CSS correctamente
        productCard.className = 'producto-card'; 
        productCard.innerHTML = `
            <img src="${imageSource}" alt="${product.nombre}">
            <h3>${product.nombre}</h3>
            <p>${product.descripcion}</p>
            <p class="price">$${product.precio.toLocaleString('es-CO')}</p>
            <button onclick="addToCart(${product.id}, '${product.nombre}', ${product.precio})">Añadir al carrito</button>
        `;
        container.appendChild(productCard);
    });
}

// Función para añadir productos al carrito (sin cambios)
function addToCart(productId, productName, productPrice) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existingProduct = carrito.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.cantidad += 1;
    } else {
        carrito.push({
            id: productId,
            nombre: productName,
            precio: productPrice,
            cantidad: 1
        });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`✅ Producto añadido al carrito: ${productName}`);
}

// ⭐ CORRECCIÓN 4: Asignar evento al botón dentro de DOMContentLoaded (práctica segura)
document.addEventListener('DOMContentLoaded', () => {
    const loadButton = document.getElementById('loadProductsBtn');
    if (loadButton) {
        loadButton.addEventListener('click', fetchAndRenderProducts);
    }
});