
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Baneos.css";

const API_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:5033/api").replace(/\/$/, "");

// Función centralizada para realizar peticiones HTTP.
const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Error HTTP ${response.status}`
    );
  }

  return data;
};

const Baneos = () => {
  const [baneos, setBaneos] = useState([]);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  // READ: obtener todos los baneos de la página actual.
  const cargarBaneos = useCallback(async () => {
    setLoading(true);

    try {
      const response = await request(
        "/ban?currentPage=1&pageSize=10"
      );

      setBaneos(response?.payload ?? []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al cargar los baneos",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBaneos();
  }, [cargarBaneos]);

  // CREATE: crear un nuevo baneo.
  const crearBaneo = async (e) => {
    e.preventDefault();

    const usuarioABanearId = Number(userId);

    if (
      !userId ||
      !Number.isInteger(usuarioABanearId) ||
      usuarioABanearId <= 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "ID inválido",
        text: "Ingresá un ID de usuario válido.",
      });
      return;
    }

    if (!reason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Motivo obligatorio",
        text: "Debés ingresar el motivo del baneo.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await request("/ban", {
        method: "POST",
        body: JSON.stringify({
          userId: usuarioABanearId,
          reason: reason.trim(),
        }),
      });

      setUserId("");
      setReason("");

      await cargarBaneos();

      await Swal.fire({
        icon: "success",
        title: "Baneo creado",
        text: response?.message || "Usuario baneado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo crear el baneo",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // UPDATE: editar el motivo de un baneo.
  const editarBaneo = async (baneo) => {
    const resultado = await Swal.fire({
      title: "Editar baneo",
      text: `Usuario: ${baneo.userName || baneo.userId}`,
      input: "textarea",
      inputLabel: "Motivo del baneo",
      inputValue: baneo.reason,
      inputPlaceholder: "Ingresá el nuevo motivo...",
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "El motivo del baneo es obligatorio.";
        }

        if (value.trim().length > 500) {
          return "El motivo no puede superar los 500 caracteres.";
        }
      },
    });

    if (!resultado.isConfirmed) return;

    setLoading(true);

    try {
      const response = await request(`/ban/${baneo.id}`, {
        method: "PUT",
        body: JSON.stringify({
          reason: resultado.value.trim(),
        }),
      });

      await cargarBaneos();

      await Swal.fire({
        icon: "success",
        title: "Baneo actualizado",
        text: response?.message || "Baneo editado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo editar el baneo",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // DELETE: eliminar un baneo.
  const eliminarBaneo = async (id) => {
    const resultado = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar este baneo?",
      text: "Esta acción eliminará el registro del baneo.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!resultado.isConfirmed) return;

    setLoading(true);

    try {
      const response = await request(`/ban/${id}`, {
        method: "DELETE",
      });

      await cargarBaneos();

      await Swal.fire({
        icon: "success",
        title: "Baneo eliminado",
        text: response?.message || "Baneo eliminado correctamente.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar el baneo",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="baneos-container">
      <h1>Administración de baneos</h1>

      {/* FORMULARIO PARA CREAR BANEOS */}
      <form className="baneo-form" onSubmit={crearBaneo}>
        <h2>Crear nuevo baneo</h2>

        <label htmlFor="userId">ID del usuario</label>
        <input
          id="userId"
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Ingresá el ID del usuario"
          required
        />

        <label htmlFor="reason">Motivo del baneo</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          placeholder="Ingresá el motivo del baneo"
          required
        />

        <button type="submit" disabled={loading}>
          Crear baneo
        </button>
      </form>

      {/* LISTADO DE BANEOS */}
      <section className="baneos-lista">
        <h2>Baneos registrados</h2>

        <button
          type="button"
          onClick={cargarBaneos}
          disabled={loading}
        >
          Actualizar lista
        </button>

        {loading && <p>Cargando...</p>}

        {!loading && baneos.length === 0 && (
          <p>No hay baneos registrados.</p>
        )}

        {baneos.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>ID del baneo</th>
                <th>Usuario</th>
                <th>Motivo</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {baneos.map((baneo) => (
                <tr key={baneo.id}>
                  <td>{baneo.id}</td>
                  <td>{baneo.userName || baneo.userId}</td>
                  <td>{baneo.reason}</td>
                  <td>
                    {baneo.bannedAt
                      ? new Date(baneo.bannedAt).toLocaleString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => editarBaneo(baneo)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => eliminarBaneo(baneo.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default Baneos;
