
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5033/api";

export const login = async (userName, password) => {
  const response = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || "No se pudo iniciar sesión."
    );
  }

  const token = data?.payload?.token;

  if (!token) {
    throw new Error("La API no devolvió un token JWT.");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("userId", String(data.payload.id));
  localStorage.setItem("userName", data.payload.userName);

  return data.payload;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};
