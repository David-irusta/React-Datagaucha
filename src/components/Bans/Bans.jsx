import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "./Bans.css";
import "../Errors/Errors.css";
import Errors from "../Errors/Errors";

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

const convertLocalDate = (date) => {
  if (!date) return "";

  const dateObject = new Date(date);

  if (Number.isNaN(dateObject.getTime())) return "";

  const offset = dateObject.getTimezoneOffset() * 60000;

  return new Date(dateObject.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const Bans = () => {
  const { idBan } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const ban = location.state?.ban;
  const editBan = Boolean(idBan);

  const [userId, setUserId] = useState(
    ban?.userId?.toString() || ""
  );
  const [reason, setReason] = useState(ban?.reason || "");
  const [bannedAt, setBannedAt] = useState(
    convertLocalDate(ban?.bannedAt)
  );
  const [expiresAt, setExpiresAt] = useState(
    convertLocalDate(ban?.expiresAt)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ban) {
      setUserId(ban.userId?.toString() || "");
      setReason(ban.reason || "");
      setBannedAt(convertLocalDate(ban.bannedAt));
      setExpiresAt(convertLocalDate(ban.expiresAt));
    }
  }, [ban]);

  useEffect(() => {
    if (editBan && !ban) {
      setError("No se encontraron los datos del baneo que quieres editar");
    }
  }, [editBan, ban]);

  const saveBan = async (e) => {
    e.preventDefault();
    setError("");

    const userBanID = Number(userId);

    if (
      !editBan &&
      (!userId ||
        !Number.isInteger(userBanID) ||
        userBanID <= 0)
    ) {
      setError("Debes ingresar un ID valido");
      return;
    }

    if (!reason.trim()) {
      setError("Debés ingresar el motivo del baneo.");
      return;
    }

    if (!bannedAt) {
      setError("Debes ingresar una fecha");
      return;
    }

    const startDate = new Date(bannedAt);

    if (Number.isNaN(startDate.getTime())) {
      setError("Debés ingresar una fecha inicial válida.");
      return;
    }

    let endDate = null;

    if (expiresAt) {
      endDate = new Date(expiresAt);

      if (
        Number.isNaN(endDate.getTime()) ||
        endDate <= startDate
      ) {
        setError("La fecha de caducidad debe ser posterior a la de inicio.");
        return;
      }
    }

    setLoading(true);

    try {
      const data = {
        reason: reason.trim(),
        bannedAt: startDate.toISOString(),
        expiresAt: endDate
          ? endDate.toISOString()
          : null,
      };

      let response;

      if (editBan) {
        response = await request(`/ban/${idBan}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        response = await request("/ban", {
          method: "POST",
          body: JSON.stringify({
            userId: userBanID,
            ...data,
          }),
        });
      }

      await Swal.fire({
        icon: "success",
        title: editBan ? "Baneo actualizado" : "Baneo creado",
        text:
          response?.message ||
          (editBan
            ? "Los datos se modificaron correctamente."
            : "Usuario baneado correctamente."),
      });

      navigate("/home");
    } catch (error) {
      setError(
        error.message ||
        (editBan
          ? "No se pudo actualizar el baneo."
          : "No se pudo crear el baneo.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bans-container">
      {editBan && !ban && (
        <div className="error-404">
        </div>
        )}
      {(!editBan || ban) && (
        <form className="ban-form" onSubmit={saveBan}>
          <h2>
            {editBan ? "Editar baneo" : "Crear nuevo baneo"}
          </h2>
          <Errors mensaje={error} />
          <label htmlFor="userId">ID del usuario</label>
          <input id="userId" type="number" min="1" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Ingresá el ID del usuario" disabled={editBan} required
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
              : editBan
                ? "Guardar cambios"
                : "Crear baneo"}
          </button>
          <button type="button" onClick={() => navigate("/home")} disabled={loading}
          >
            Cancelar
          </button>
        </form>
      )}
    </main>
  );
};

export default Bans;