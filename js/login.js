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
        
        if (res.ok) {
            // Se guarda la información del usuario devuelta por el backend
            // El backend debe devolver un objeto con la clave 'cliente', por ejemplo: { "message": "...", "cliente": { ... } }
            localStorage.setItem("usuario", JSON.stringify(data.cliente)); 
            alert(data.message);
            window.location.href = "cuenta.html"; // Redirige a la página de la cuenta
        } else {
            alert(data.error);
        }
        
    } catch (err) {
        console.error(err);
        alert("Error al iniciar sesión. Inténtalo de nuevo.");
    }
});