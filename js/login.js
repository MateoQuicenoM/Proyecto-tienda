// login.js - iniciar sesión
const apiUrl = "http://localhost:3000/clientes/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("correo").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        // 💡 DIAGNÓSTICO: Muestra la respuesta completa del servidor
        console.log("Respuesta completa del servidor:", data);
        
        if (res.ok) {
            
            // 🛑 CORRECCIÓN CLAVE: Determinar cuál es el objeto de usuario
            // Si data.cliente existe, úsalo. Si no, usa el objeto data completo.
            let usuarioAguardar = data.cliente || data; 
            
            // ⚠️ VERIFICACIÓN CRÍTICA: Nos aseguramos de que el objeto tenga la propiedad 'id'
            if (!usuarioAguardar || !usuarioAguardar.id) {
                // Si llegamos aquí, el servidor no envió el ID.
                console.error("El servidor confirmó el login, pero no devolvió el ID del cliente. Revisa el código del servidor.");
                alert("Error: No se pudieron cargar los datos de la sesión (ID del cliente ausente).");
                return;
            }
            
            // ✅ GUARDADO CORRECTO: Guardamos el objeto cliente que SÍ contiene el ID.
            localStorage.setItem("usuario", JSON.stringify(usuarioAguardar)); 
            
            alert(data.message || "Inicio de sesión exitoso.");
            window.location.href = "cuenta.html"; // Redirige a la página de la cuenta
            
        } else {
            alert(data.error || "Credenciales incorrectas.");
        }
        
    } catch (err) {
        console.error(err);
        alert("Error al iniciar sesión. Inténtalo de nuevo.");
    }
});