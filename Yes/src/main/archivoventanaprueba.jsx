import { useState } from "react";

function NuevoCliente({ show, onClose }) {
  const [cliente, setCliente] = useState({
    ci: "",
    nombre: "",
    telefono: "",
    direccion: "",
  });

  const handleChange = (e) =>
    setCliente({ ...cliente, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:3000/registro/cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // importante
      },
      credentials: "include", // si usas cookies/sesiones
      body: JSON.stringify({
        ci: cliente.ci,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    direccion: cliente.direccion
      }
      ) // 🔹 convertimos objeto a JSON
    })
      .then((res) => res.json())
      .then((data) => console.log("Respuesta del backend:", data))
      .catch((err) => console.error("Error:", err));
    console.log("Datos enviados:", cliente);
    onClose(); // cerrar modal desde el padre
  };

  if (!show) return null; // si show es false, no renderiza nada

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "300px",
        }}
      >
        <h2>Nuevo Cliente</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="ci"
            placeholder="CI"
            value={cliente.ci}
            onChange={handleChange}
            required
          />
          <input
            name="nombre"
            placeholder="Nombre"
            value={cliente.nombre}
            onChange={handleChange}
            required
          />
          <input
            name="telefono"
            placeholder="Teléfono"
            value={cliente.telefono}
            onChange={handleChange}
            required
          />
          <input
            name="direccion"
            placeholder="Dirección"
            value={cliente.direccion}
            onChange={handleChange}
            required
          />
          <div style={{ marginTop: "10px" }}>
            <button type="submit">Guardar</button>
            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: "10px" }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoCliente;
