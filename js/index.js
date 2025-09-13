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
    container.innerHTML = '<p>Error al cargar los productos. Inténtalo de nuevo más tarde.</p>';
  }
}

// Función para renderizar los productos en el HTML
function renderProducts(products) {
  const container = document.getElementById('productosDestacados');
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

// Asignar evento al botón para cargar los productos
document.getElementById('loadProductsBtn').addEventListener('click', fetchAndRenderProducts);
