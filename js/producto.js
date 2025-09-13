// producto.js - mostrar/editar un producto específico
const apiUrl = "http://localhost:3000/productos";
const productoId = localStorage.getItem("productoEdit");

document.addEventListener("DOMContentLoaded", async () => {
  if (productoId) {
    try {
      const res = await fetch(`${apiUrl}/${productoId}`);
      const producto = await res.json();

      document.getElementById("nombre").value = producto.nombre;
      document.getElementById("fotografia").value = producto.fotografia;
      document.getElementById("precio").value = producto.precio;
      document.getElementById("descripcion").value = producto.descripcion;
      document.getElementById("stock").value = producto.stock;
    } catch (err) {
      console.error(err);
      alert("Error cargando producto");
    }
  }
});

document.getElementById("productoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value,
    fotografia: document.getElementById("fotografia").value,
    precio: document.getElementById("precio").value,
    descripcion: document.getElementById("descripcion").value,
    stock: document.getElementById("stock").value,
  };

  try {
    let res;
    if (productoId) {
      res = await fetch(`${apiUrl}/${productoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    } else {
      res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    }

    const data = await res.json();
    alert(data.message);
    localStorage.removeItem("productoEdit");
    window.location.href = "productos.html";
  } catch (err) {
    console.error(err);
    alert("Error guardando producto");
  }
});
