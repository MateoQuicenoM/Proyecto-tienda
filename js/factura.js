// URL base de la API
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    const facturaContainer = document.getElementById('factura');
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedidoId');

    if (!pedidoId) {
        facturaContainer.innerHTML = '<p>No se encontró un pedido. Por favor, realiza una compra.</p>';
        return;
    }

    try {
        // Llama al endpoint de facturas usando el ID del pedido
        const res = await fetch(`${API_URL}/facturas/${pedidoId}`);
        if (!res.ok) {
            // Si la factura no existe (404), aquí se lanza el error
            throw new Error('Error al obtener los datos de la factura');
        }
        const factura = await res.json();

        renderFactura(factura);
    } catch (error) {
        console.error('Error:', error);
        facturaContainer.innerHTML = '<p>Ocurrió un error al cargar la factura. Inténtalo de nuevo más tarde.</p>';
    }
});

function renderFactura(factura) {
    const container = document.getElementById('factura');
    const productosHtml = factura.productos.map(p => `
        <div class="producto-factura">
            <p><strong>Producto:</strong> ${p.nombre}</p>
            <p><strong>Cantidad:</strong> ${p.cantidad}</p>
            <p><strong>Precio Unitario:</strong> $${p.precio_unitario.toLocaleString('es-CO')}</p>
            <p><strong>Subtotal:</strong> $${(p.cantidad * p.precio_unitario).toLocaleString('es-CO')}</p>
        </div>
    `).join('');

    container.innerHTML = `
        <h2>Detalles de la Factura</h2>
        <p><strong>ID de Factura:</strong> ${factura.factura_id}</p>
        <p><strong>Fecha:</strong> ${new Date(factura.fecha).toLocaleDateString()}</p>
        <p><strong>Cliente:</strong> ${factura.cliente}</p>
        <h3>Productos:</h3>
        ${productosHtml}
        <hr>
        <div class="totales">
            <p><strong>Subtotal:</strong> $${factura.subtotal.toLocaleString('es-CO')}</p>
            <p><strong>Impuesto (19%):</strong> $${factura.impuesto.toLocaleString('es-CO')}</p>
            <p><strong>Envío:</strong> $${factura.envio.toLocaleString('es-CO')}</p>
            <p><strong>Total:</strong> $${factura.total.toLocaleString('es-CO')}</p>
        </div>
    `;
}