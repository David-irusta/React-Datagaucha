
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5033/api";

const request = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || 
      data?.message ||
      data?.error ||
      `Error HTTP ${response.status}`
    );
  }

  return data;
};

export const getBans = (token, currentPage = 1, pageSize = 10) =>
  request(
    `/ban?currentPage=${currentPage}&pageSize=${pageSize}`,
    token
  );

export const createBan = (ban, token) =>
  request("/ban", token, {
    method: "POST",
    body: JSON.stringify({
      userId: Number(ban.userId),
      reason: ban.reason.trim(),
    }),
  });

export const deleteBan = (id, token) =>
  request(`/ban/${id}`, token, {
    method: "DELETE",
  });
