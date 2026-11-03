import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Home.css";

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5033/api").replace(/\/+$/, "");

const Home = () => {
  const navigate = useNavigate();
  const [baneos, setBaneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState("");
  const [motivosVisibles, setMotivosVisibles] = useState({});

  // Comunicarse con la API.
  const request = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const texto = await response.text();
    let data = null;

    try {
      data = texto ? JSON.parse(texto) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `Error HTTP ${response.status}`
      );
    }
    return data;
  };

  // Convertir fecha para datetime-local.
  const convertirFechaLocal = (fecha) => {
    if (!fecha) return "";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  };

  // Mostrar fechas en la tabla.
  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return "Fecha inválida";

    return date.toLocaleString("es-AR");
  };

  // Obtener baneos.
  const cargarBaneos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await request(
        "/ban?currentPage=1&pageSize=10"
      );

      setBaneos(response?.payload ?? []);
      return true;
    } catch (err) {
      setError(err.message || "No se pudieron cargar los baneos.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBaneos();
  }, [cargarBaneos]);

  // Mostrar u ocultar motivo.
  const alternarMotivo = (id) => {
    setMotivosVisibles((actuales) => ({
      ...actuales,
      [id]: !actuales[id],
    }));
  };

  const editarBaneo = (baneo) => {
    navigate(`/bans/${baneo.id}`, {
      state: { baneo },
    });
  };

  // Eliminar baneo.
  const eliminarBaneo = async (id) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar este baneo?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!resultado.isConfirmed) return;

    setAccionando(true);

    try {
      await request(`/ban/${id}`, {
        method: "DELETE",
      });

      await cargarBaneos();

      await Swal.fire({
        icon: "success",
        title: "Baneo eliminado",
        text: "El registro se eliminó correctamente.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "No se pudo eliminar el baneo.",
      });
    } finally {
      setAccionando(false);
    }
  };

  return (
    <main className="home-container">
      <h1>Inicio</h1>
      <p>Panel de administración de DataGaucha</p>

      <section className="home-baneos">
        <div className="home-baneos-header">
          <h2>Usuarios baneados</h2>

          <button type="button" className="btn-comun" onClick={() => navigate("/bans")} disabled={accionando}
          >
            Crear baneo
          </button>
        </div>

        {loading && <p>Cargando usuarios baneados...</p>}

        {!loading && error && (
          <p className="home-error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && baneos.length === 0 && (
          <p>No hay usuarios baneados.</p>
        )}

        {!loading && !error && baneos.length > 0 && (
          <div className="home-tabla-contenedor">
            <table className="home-tabla">
              <thead>
                <tr>
                  <th>ID del baneo</th>
                  <th>ID del usuario</th>
                  <th>Usuario</th>
                  <th>Fecha desde</th>
                  <th>Fecha hasta</th>
                  <th>Motivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {baneos.map((baneo) => (
                  <tr key={baneo.id}>
                    <td>{baneo.id}</td>
                    <td>{baneo.userId}</td>
                    <td>{baneo.userName || "Sin nombre"}</td>
                    <td>{formatearFecha(baneo.bannedAt)}</td>
                    <td>
                      {baneo.expiresAt
                        ? formatearFecha(baneo.expiresAt)
                        : "Sin vencimiento"}
                    </td>

                    <td>
                      <button type="button" className="btn-motivo" onClick={() => alternarMotivo(baneo.id)} aria-expanded={!!motivosVisibles[baneo.id]}
                      >
                        {motivosVisibles[baneo.id]  ? "Ocultar motivo"  : "Ver motivo"}
                      </button>
                    </td>

                    <td className="button-Home">
                      <button type="button" className="btn-editar" onClick={() => editarBaneo(baneo)} disabled={accionando}> Editar </button>

                      <button type="button" className="btn-eliminar" onClick={() => eliminarBaneo(baneo.id)} disabled={accionando}> Eliminar </button>
                    </td>
                  </tr>
                ))}

                {baneos.map((baneo) =>
                  motivosVisibles[baneo.id] ? (
                    <tr key={`motivo-${baneo.id}`} className="fila-motivo">
                      <td colSpan="7">
                        <div className="motivo-contenido">
                          <strong>Motivo del baneo:</strong>
                          <p>{baneo.reason || "Sin motivo registrado."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;