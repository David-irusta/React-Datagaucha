import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./Baneos.css";

const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:5033/api"
).replace(/\/+$/, "");

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

// Convertir fecha para el input datetime-local.
const convertirFechaLocal = (fecha) => {
  if (!fecha) return "";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const Baneos = () => {
  const { idBan } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const baneo = location.state?.baneo;
  const editando = Boolean(idBan);

  const [userId, setUserId] = useState(
    baneo?.userId?.toString() || ""
  );
  const [reason, setReason] = useState(baneo?.reason || "");
  const [bannedAt, setBannedAt] = useState(
    convertirFechaLocal(baneo?.bannedAt)
  );
  const [expiresAt, setExpiresAt] = useState(
    convertirFechaLocal(baneo?.expiresAt)
  );
  const [loading, setLoading] = useState(false);

  // Cargar los datos recibidos desde Home.
  useEffect(() => {
    if (baneo) {
      setUserId(baneo.userId?.toString() || "");
      setReason(baneo.reason || "");
      setBannedAt(convertirFechaLocal(baneo.bannedAt));
      setExpiresAt(convertirFechaLocal(baneo.expiresAt));
    }
  }, [baneo]);

  useEffect(() => {
    if (editando && !baneo) {
      navigate("/error", { replace: true });
    }
  }, [editando, baneo, navigate]);

  const guardarBaneo = async (e) => {
    e.preventDefault();

    const usuarioABanearId = Number(userId);

    if (
      !editando &&
      (!userId ||
        !Number.isInteger(usuarioABanearId) ||
        usuarioABanearId <= 0)
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

    if (!bannedAt) {
      Swal.fire({
        icon: "warning",
        title: "Fecha obligatoria",
        text: "Debés ingresar la fecha desde.",
      });
      return;
    }

    const fechaInicio = new Date(bannedAt);

    if (Number.isNaN(fechaInicio.getTime())) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "La fecha desde no es válida.",
      });
      return;
    }

    let fechaFin = null;

    if (expiresAt) {
      fechaFin = new Date(expiresAt);

      if (
        Number.isNaN(fechaFin.getTime()) ||
        fechaFin <= fechaInicio
      ) {
        Swal.fire({
          icon: "warning",
          title: "Fechas inválidas",
          text: "La fecha hasta debe ser posterior a la fecha desde.",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const datos = {
        reason: reason.trim(),
        bannedAt: fechaInicio.toISOString(),
        expiresAt: fechaFin
          ? fechaFin.toISOString()
          : null,
      };

      let response;

      if (editando) {
        // Actualizar un baneo existente.
        response = await request(`/ban/${idBan}`, {
          method: "PUT",
          body: JSON.stringify(datos),
        });
      } else {
        // Crear un nuevo baneo.
        response = await request("/ban", {
          method: "POST",
          body: JSON.stringify({
            userId: usuarioABanearId,
            ...datos,
          }),
        });
      }

      await Swal.fire({
        icon: "success",
        title: editando ? "Baneo actualizado" : "Baneo creado",
        text:
          response?.message ||
          (editando
            ? "Los datos se modificaron correctamente."
            : "Usuario baneado correctamente."),
      });

      navigate("/home");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: editando
          ? "No se pudo actualizar el baneo"
          : "No se pudo crear el baneo",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="baneos-container">
      <h1>Administración de baneos</h1>

      <form className="baneo-form" onSubmit={guardarBaneo}>
        <h2>
          {editando ? "Editar baneo" : "Crear nuevo baneo"}
        </h2>

        <label htmlFor="userId">ID del usuario</label>
        <input id="userId" type="number" min="1" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Ingresá el ID del usuario" disabled={editando} required
        />

        <label htmlFor="reason">Motivo del baneo</label>
        <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Ingresá el motivo del baneo" required
        />

        <label htmlFor="bannedAt">Fecha desde</label>
        <input id="bannedAt" type="datetime-local" value={bannedAt} onChange={(e) => setBannedAt(e.target.value)} required
        />

        <label htmlFor="expiresAt">Fecha hasta</label>
        <input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
        />

        <small>
          Dejá la fecha hasta vacía si el baneo no tiene vencimiento.
        </small>

        <button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : editando
              ? "Guardar cambios"
              : "Crear baneo"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/home")}
          disabled={loading}
        >
          Cancelar
        </button>
      </form>
    </main>
  );
};

export default Baneos;