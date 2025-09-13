// URL base de la API
const API_URL = 'http://localhost:3000/pedidos';

document.getElementById("pedidoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Obtener los datos del usuario y del carrito del localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Si el usuario no está logueado o el carrito está vacío, se detiene la ejecución
    if (!usuario) {
        return alert("❌ Por favor, inicia sesión para confirmar el pedido.");
    }
    if (carrito.length === 0) {
        return alert("❌ No puedes hacer un pedido con el carrito vacío.");
    }

    // 2. Preparar los datos para el servidor
    const cliente_id = usuario.clienteId;
    const metodo_pago = document.getElementById('metodoPago').value;

    // Formatear los productos con la cantidad y el precio unitario
    const productos = carrito.map(item => {
        return {
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio // ✨ ¡Ahora enviamos el precio unitario! ✨
        };
    });

    // 3. Enviar la solicitud al servidor
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cliente_id,
                productos,
                metodo_pago
            })
        });

        const data = await res.json();
        
        // Si la respuesta es exitosa
        if (res.ok) {
            alert(data.message);
            localStorage.removeItem('carrito'); // Limpiar el carrito
            // Redireccionar a la página de la factura
            window.location.href = `factura.html?pedidoId=${data.pedidoId}`;
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Error al confirmar el pedido. Por favor, inténtalo de nuevo.");
    }
});