// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();

    // Evento para el botón "Vaciar Carrito"
    const vaciarBtn = document.getElementById('btnVaciarCarrito');
    if (vaciarBtn) {
        vaciarBtn.addEventListener('click', () => {
            localStorage.removeItem('carrito');
            renderizarCarrito();
        });
    }

    // Evento para el botón "Ir a Pedido"
    const pedidoBtn = document.getElementById('btnIrAPedido');
    if (pedidoBtn) {
        pedidoBtn.addEventListener('click', () => {
            window.location.href = 'pedido.html';
        });
    }
});

// Función para renderizar el carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const totalElement = document.getElementById('total-compra');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p>El carrito está vacío.</p>';
        totalElement.textContent = '$0';
        return;
    }

    let total = 0;
    const itemsHtml = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `
            <div class="carrito-item">
                <p><strong>Producto:</strong> ${item.nombre}</p>
                <p><strong>Cantidad:</strong> ${item.cantidad}</p>
                <p><strong>Precio:</strong> $${item.precio.toLocaleString('es-CO')}</p>
                <p><strong>Subtotal:</strong> $${subtotal.toLocaleString('es-CO')}</p>
                <button onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
            </div>
        `;
    }).join('');

    contenedor.innerHTML = itemsHtml;
    totalElement.textContent = `$${total.toLocaleString('es-CO')}`;
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(productId) {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const nuevoCarrito = carrito.filter(item => item.id !== productId);
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    renderizarCarrito();
}
