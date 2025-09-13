// registro.js - registrar cliente
const apiUrl = "http://localhost:3000/clientes/registro";

document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevoCliente = {
  nombre: document.getElementById("nombre").value,
  email: document.getElementById("correo").value,
  password: document.getElementById("password").value,
  documento: document.getElementById("documento").value,
  fechaNacimiento: document.getElementById("fechaNacimiento").value
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente)
    });

    const data = await res.json();
    alert(data.message || "Registrado con éxito ✅");
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("Error al registrar");
  }
});
