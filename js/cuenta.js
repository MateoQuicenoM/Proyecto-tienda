// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos el usuario del localStorage (asumiendo que auth.js ya verificó la sesión)
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const form = document.getElementById('cuentaForm');
    const nombreInput = document.getElementById('nombre');
    const documentoInput = document.getElementById('documento');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const correoInput = document.getElementById('correo');
    const direccionInput = document.getElementById('direccion');
    const telefonoInput = document.getElementById('telefono');
    const historialPedidosSection = document.getElementById('historialPedidos');

    // Llenar los campos con los datos del usuario (los campos inmutables son de solo lectura)
    nombreInput.value = usuario.nombre || '';
    nombreInput.readOnly = true;
    documentoInput.value = usuario.documento || '';
    documentoInput.readOnly = true;
    fechaNacimientoInput.value = usuario.fechaNacimiento || '';
    fechaNacimientoInput.readOnly = true;
    correoInput.value = usuario.email || '';
    direccionInput.value = usuario.direccion || '';
    telefonoInput.value = usuario.telefono || '';

    // Lógica para actualizar los datos de la cuenta
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosActualizados = {
            direccion: direccionInput.value,
            telefono: telefonoInput.value
        };
        
        try {
            const res = await fetch(`${API_URL}/clientes/${usuario.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!res.ok) {
                throw new Error('Error al actualizar los datos');
            }

            const data = await res.json();
            // Actualizar los datos del usuario en localStorage
            const usuarioActualizado = { ...usuario, ...datosActualizados };
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

            alert('Datos actualizados con éxito.');
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al actualizar los datos. Inténtalo de nuevo.');
        }
    });

    // Lógica para cargar el historial de pedidos
    async function cargarHistorialPedidos() {
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