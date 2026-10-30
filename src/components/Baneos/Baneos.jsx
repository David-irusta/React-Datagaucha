import { useCallback, useEffect, useState } from "react";
import "./Baneos.css";
import { getBans, createBan, deleteBan } from "../../services/banService";

const Baneos = () => {
  const [baneos, setBaneos] = useState([]);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () =>
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  const cargarBaneos = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError(
        "Todavía no hay un token JWT. Necesitamos conectar el inicio de sesión para consultar los baneos."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getBans(token, 1, 10);
      setBaneos(response?.payload ?? []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los baneos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBaneos();
  }, [cargarBaneos]);


const crearBaneo = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  const token = localStorage.getItem("token");
  const usuarioLogueadoId = localStorage.getItem("userId");
  const usuarioABanearId = Number(userId);

  if (!token || !usuarioLogueadoId) {
    setError("Debés iniciar sesión nuevamente.");
    return;
  }

  if (
    !userId ||
    !Number.isInteger(usuarioABanearId) ||
    usuarioABanearId <= 0 ||
    !reason.trim()
  ) {
    setError("Ingresá un ID de usuario válido y el motivo del baneo.");
    return;
  }

  if (usuarioABanearId === Number(usuarioLogueadoId)) {
    setError("No podés banear al usuario que tiene la sesión iniciada.");
    return;
  }

  setLoading(true);

  try {
    const response = await createBan({ userId, reason }, token);

    setMessage(response?.message || "Baneo creado correctamente.");
    setUserId("");
    setReason("");

    await cargarBaneos();
  } catch (err) {
    setError(err.message || "No se pudo crear el baneo.");
  } finally {
    setLoading(false);
  }
};


  const eliminarBaneo = async (id) => {
    const token = getToken();

    if (!token) {
      setError("Primero necesitamos obtener un token JWT válido.");
      return;
    }

    if (!window.confirm("¿Seguro que querés eliminar este baneo?")) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await deleteBan(id, token);

      setMessage(response?.message || "Baneo eliminado correctamente.");
      await cargarBaneos();
    } catch (err) {
      setError(err.message || "No se pudo eliminar el baneo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="baneos-container">
      <h1>Administración de baneos</h1>

      {error && <p role="alert" className="baneo-error">{error}</p>}
      {message && <p className="baneo-message">{message}</p>}

      <form className="baneo-form" onSubmit={crearBaneo}>
        <label htmlFor="userId">ID del usuario</label>
        <input
          id="userId"
          type="number"
          min="1"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label htmlFor="reason">Motivo del baneo</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          Crear baneo
        </button>
      </form>

      <section className="baneos-lista">
        <h2>Baneos registrados</h2>

        <button type="button" onClick={cargarBaneos} disabled={loading}>
          Actualizar lista
        </button>

        {loading && <p>Cargando...</p>}

        {!loading && baneos.length === 0 && !error && (
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