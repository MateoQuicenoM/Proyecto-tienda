document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('loginLink');
    const registroLink = document.getElementById('registroLink');
    const logoutLink = document.getElementById('logoutLink');

    const checkAuthStatus = () => {
        const usuario = localStorage.getItem('usuario');
        const path = window.location.pathname;
        // Agregamos todas las rutas que requieren que el usuario esté logueado
        const paginasProtegidas = ['/cuenta.html', '/pedido.html', '/factura.html'];

        if (!usuario && paginasProtegidas.includes(path)) {
            // Si el usuario no está logueado y está en una página protegida, lo redirigimos
            window.location.href = 'login.html';
            return;
        }

        // Lógica para mostrar/ocultar los enlaces de navegación según el estado de la sesión
        if (usuario) {
            // Usuario logueado: Ocultar Login y Registro, mostrar Cerrar Sesión
            if (loginLink) loginLink.style.display = 'none';
            if (registroLink) registroLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'inline';
        } else {
            // Usuario no logueado: Mostrar Login y Registro, ocultar Cerrar Sesión
            if (loginLink) loginLink.style.display = 'inline';
            if (registroLink) registroLink.style.display = 'inline';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    };

    const logout = () => {
        localStorage.removeItem('usuario');
        // Redirigimos a la página principal después de cerrar la sesión
        window.location.href = 'index.html'; 
    };

    // Asignamos el evento de clic al enlace de cerrar sesión
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Ejecutamos la función de verificación al cargar la página
    checkAuthStatus();
});