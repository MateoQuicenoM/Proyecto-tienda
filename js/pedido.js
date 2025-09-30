// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Carga y parsing seguro del objeto de usuario
    const usuarioString = localStorage.getItem('usuario');
    let usuario = null;

    if (usuarioString && usuarioString !== 'undefined') {
        try {
            usuario = JSON.parse(usuarioString); 
        } catch (e) {
            console.error('Error al parsear el objeto de usuario:', e);
        }
    }
    
    // ----------------------------------------------------
    
    // El código vuelve a su estado original (solo con las correcciones de sintaxis).
    // Esto mostrará el error en consola, forzando la corrección del login.
    if (!usuario || !usuario.id) {
        console.error("El objeto de usuario es inválido o no se ha cargado el ID. El problema REAL está en el script de LOGIN.");
    }
    
    const pedidoForm = document.getElementById('pedidoForm');
    
    pedidoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 🛑 PROTECCIÓN CRÍTICA: Detener la función si el objeto es null/inválido
        // Si esto se dispara, significa que el login no guardó el ID de Mateo (2).
        if (!usuario || !usuario.id) {
            alert('Error de sesión: No se pudo obtener su ID. Por favor, inicie sesión de nuevo para completar el pedido.');
            return; 
        }

        // ----------------------------------------------------

        const metodoPago = document.getElementById('metodoPago').value;
        const productos = JSON.parse(localStorage.getItem('carrito')) || [];

        if (productos.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de confirmar el pedido.');
            return;
        }

        const productosParaApi = productos.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio 
        }));

        const nuevoPedido = {
            // Ahora intentará usar el ID real (Mateo: 2) si el login funciona.
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
            
            // ✅ CORRECCIÓN FINAL: Usar 'data.pedidoId'
            alert('Pedido confirmado con éxito. Número de pedido: ' + data.pedidoId);
            localStorage.removeItem('carrito');
            window.location.href = `factura.html?pedidoId=${data.pedidoId}`; 
            
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al confirmar el pedido. Revisa la consola del navegador y la terminal del servidor para más detalles.');
        }
    });
});