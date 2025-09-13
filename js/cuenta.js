// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario está logueado y si su ID existe
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    // Si el usuario no existe o no tiene un ID, redirigir al login
    if (!usuario || !usuario.id) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('cuentaForm');
    const nombreInput = document.getElementById('nombre');
    const documentoInput = document.getElementById('documento');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const correoInput = document.getElementById('correo');
    const historialPedidosSection = document.getElementById('historialPedidos');

    // 2. Cargar los datos del usuario en el formulario (verificando que existan)
    nombreInput.value = usuario.nombre || '';
    documentoInput.value = usuario.documento || '';
    fechaNacimientoInput.value = usuario.fechaNacimiento || '';
    correoInput.value = usuario.email || '';

    // 3. Actualizar datos del usuario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updatedData = {
            nombre: nombreInput.value,
            documento: documentoInput.value,
            fechaNacimiento: fechaNacimientoInput.value,
            email: correoInput.value
        };

        try {
            const res = await fetch(`${API_URL}/clientes/${usuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al actualizar: ${errorText}`);
            }

            const result = await res.json();
            alert(result.message);

            // Actualizar localStorage con los nuevos datos
            const updatedUsuario = { ...usuario, ...updatedData };
            localStorage.setItem('usuario', JSON.stringify(updatedUsuario));

        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar la cuenta.');
        }
    });

    // 4. Cargar historial de pedidos
    async function cargarHistorialPedidos() {
        // Verificar que el elemento HTML exista antes de intentar modificarlo
        if (!historialPedidosSection) {
            console.error('Error: No se encontró el elemento con ID "historialPedidos" en el HTML.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/pedidos/cliente/${usuario.id}`);
            if (!res.ok) {
                throw new Error('Error al cargar pedidos');
            }
            const pedidos = await res.json();

            if (pedidos.length === 0) {
                historialPedidosSection.innerHTML = '<p>No tienes pedidos anteriores.</p>';
                return;
            }

            historialPedidosSection.innerHTML = '';
            pedidos.forEach(pedido => {
                const pedidoDiv = document.createElement('div');
                pedidoDiv.className = 'pedido-card';
                pedidoDiv.innerHTML = `
                    <h3>Pedido #${pedido.pedido_id}</h3>
                    <p>Fecha: ${new Date(pedido.fecha).toLocaleDateString()}</p>
                    <p>Total: $${pedido.total.toLocaleString('es-CO')}</p>
                    <button onclick="window.location.href='factura.html?pedidoId=${pedido.pedido_id}'">Ver Factura</button>
                `;
                historialPedidosSection.appendChild(pedidoDiv);
            });

        } catch (error) {
            console.error('Error:', error);
            historialPedidosSection.innerHTML = '<p>Error al cargar el historial de pedidos.</p>';
        }
    }
    cargarHistorialPedidos();
});