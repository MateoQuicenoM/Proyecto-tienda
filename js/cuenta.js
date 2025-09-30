// URL base de la API
const API_URL = 'http://localhost:3000';

// Función para calcular la edad exacta
function calcularEdad(fechaNacimientoString) {
    if (!fechaNacimientoString) return 'N/A';
    
    const hoy = new Date();
    // Creamos la fecha a partir del string de la API (ej: "2005-02-28T05:00:00.000Z")
    const fechaNacimiento = new Date(fechaNacimientoString); 
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    // Ajuste si aún no ha cumplido años este mes
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    return edad;
}

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioLocalStorage = JSON.parse(localStorage.getItem('usuario'));

    // 1. Verificación de sesión
    if (!usuarioLocalStorage || !usuarioLocalStorage.id) {
        alert("Debes iniciar sesión para ver tu cuenta.");
        window.location.href = "login.html";
        return;
    }

    const clienteId = usuarioLocalStorage.id;

    // 2. Obtener referencias a los elementos del DOM
    const form = document.getElementById('cuentaForm');
    const nombreInput = document.getElementById('nombre');
    const documentoInput = document.getElementById('documento');
    const fechaNacimientoInput = document.getElementById('fechaNacimiento');
    const emailInput = document.getElementById('email'); 
    const direccionInput = document.getElementById('direccion');
    const telefonoInput = document.getElementById('telefono');
    const historialPedidosSection = document.getElementById('historialPedidos');
    const edadActual = document.getElementById('edadActual'); 

    // 3. Cargar datos completos del cliente desde la API
    try {
        const res = await fetch(`${API_URL}/clientes/${clienteId}`);
        if (!res.ok) {
            throw new Error('Error al cargar los datos del cliente.');
        }
        const clienteData = await res.json();
        
        // 4. Rellenar campos del formulario
        if (nombreInput) nombreInput.value = clienteData.nombre || '';
        // ✅ N° de Documento
        if (documentoInput) documentoInput.value = clienteData.numero_documento || ''; 
        if (emailInput) emailInput.value = clienteData.email || '';
        
        // Campos editables
        if (direccionInput) direccionInput.value = clienteData.direccion || '';
        if (telefonoInput) telefonoInput.value = clienteData.telefono || '';
        
        // 5. Manejar la fecha de nacimiento y calcular la edad
        if (fechaNacimientoInput && clienteData.fecha_nacimiento) {
            // Formato YYYY-MM-DD para input type="date"
            const fecha = new Date(clienteData.fecha_nacimiento);
            const fechaFormato = fecha.toISOString().split('T')[0];
            fechaNacimientoInput.value = fechaFormato;

            // ✅ Mostrar la edad
            if (edadActual) {
                const edad = calcularEdad(clienteData.fecha_nacimiento);
                edadActual.textContent = `Edad actual: ${edad} años`;
            }
        }
        
        // Establecer campos de solo lectura
        if (nombreInput) nombreInput.readOnly = true;
        if (documentoInput) documentoInput.readOnly = true;
        if (fechaNacimientoInput) fechaNacimientoInput.readOnly = true;
        if (emailInput) emailInput.readOnly = true;


    } catch (error) {
        console.error('Error cargando datos de la cuenta:', error);
        alert('No se pudieron cargar los datos personales. Asegúrate que la API está corriendo.');
    }

    // 6. Lógica para actualizar los datos de la cuenta
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datosActualizados = {
                direccion: direccionInput.value,
                telefono: telefonoInput.value
            };
            
            try {
                const res = await fetch(`${API_URL}/clientes/${clienteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosActualizados)
                });

                const data = await res.json();

                if (res.ok) {
                    const usuarioActualizado = { ...usuarioLocalStorage, ...datosActualizados };
                    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
                    alert(data.message);
                } else {
                    alert('Error al actualizar: ' + (data.error || data.message || 'Error desconocido'));
                }
            } catch (error) {
                console.error('Error al enviar la actualización:', error);
                alert('Hubo un error de conexión al guardar los datos.');
            }
        });
    }

    // 7. Lógica para cargar el historial de pedidos
    async function cargarHistorialPedidos() {
        if (!historialPedidosSection) return;

        try {
            const res = await fetch(`${API_URL}/pedidos/cliente/${clienteId}`); 
            
            if (!res.ok) {
                // Revisa la consola de Node.js si esto arroja un 500 o 404
                throw new Error('Error al cargar pedidos. Revisa que tu archivo principal (app.js/server.js) esté montando la ruta /pedidos.');
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
                    <p>Total: $${(pedido.total || 0).toLocaleString('es-CO')}</p>
                    <button onclick="window.location.href='factura.html?pedidoId=${pedido.pedido_id}'">Ver Factura</button>
                `;
                historialPedidosSection.appendChild(pedidoDiv);
            });

        } catch (error) {
            console.error('Error:', error);
            historialPedidosSection.innerHTML = `<p>Error al cargar el historial de pedidos: ${error.message}</p>`;
        }
    }

    cargarHistorialPedidos();
});