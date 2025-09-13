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
      // ✅ Crea un objeto 'usuario' de manera segura
      const usuario = {
        id: data.id, 
        nombre: data.nombre,
        email: data.email,
        // Agrega otras propiedades si tu backend las devuelve, como 'documento' o 'telefono'
      };
      
      localStorage.setItem("usuario", JSON.stringify(usuario));
      alert(data.message);
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
    
  } catch (err) {
    console.error(err);
    alert("Error al iniciar sesión. Inténtalo de nuevo.");
  }
});