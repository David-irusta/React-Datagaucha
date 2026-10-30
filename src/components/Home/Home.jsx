import { useCallback, useEffect, useState } from "react";
import { getBans } from "../../services/banService";
import "./Home.css";

const Home = () => {
  const [baneos, setBaneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarBaneos = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debés iniciar sesión para consultar los baneos.");
      setLoading(false);
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

  return (
    <main className="home-container">
      <h1>Inicio</h1>
      <p>Panel de administración de DataGaucha</p>

      <section className="home-baneos">
        <div className="home-baneos-header">
          <h2>Usuarios baneados</h2>

          <button
            type="button"
            onClick={cargarBaneos}
            disabled={loading}
          >
            Actualizar
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
                  <th>Motivo</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {baneos.map((baneo) => (
                  <tr key={baneo.id}>
                    <td>{baneo.id}</td>
                    <td>{baneo.userId}</td>
                    <td>{baneo.userName || "Sin nombre"}</td>
                    <td>{baneo.reason}</td>
                    <td>
                      {baneo.bannedAt
                        ? new Date(baneo.bannedAt).toLocaleString()
                        : "Sin fecha"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Home;