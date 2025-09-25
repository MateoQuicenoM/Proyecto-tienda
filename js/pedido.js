// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Asumimos que el usuario ya está logueado gracias a auth.js
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    const pedidoForm = document.getElementById('pedidoForm');
    
    pedidoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const metodoPago = document.getElementById('metodoPago').value;
        const productos = JSON.parse(localStorage.getItem('carrito')) || [];

        if (productos.length === 0) {
            alert('Tu carrito está vacío. Agrega productos para realizar un pedido.');
            return;
        }

        // Mapea los productos del carrito para que el backend los entienda (solo id y cantidad)
        const productosParaApi = productos.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad
        }));

        const nuevoPedido = {
            cliente_id: usuario.id,
            metodo_pago: metodoPago,
            productos: productosParaApi
        };

        try {
            const res = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoPedido)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al crear el pedido: ${errorText}`);
            }

            const data = await res.json();
            alert('Pedido confirmado con éxito. Número de pedido: ' + data.pedido_id);
            localStorage.removeItem('carrito'); // Limpia el carrito
            window.location.href = `factura.html?pedidoId=${data.pedido_id}`; // Redirige a la factura
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al confirmar el pedido. Inténtalo de nuevo más tarde.');
        }
    });
});