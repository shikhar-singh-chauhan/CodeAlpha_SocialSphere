const API_URL = "http://localhost:5000/api";

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
    );
  } catch (error) {
    const networkError = new Error(
      "Unable to connect to the server."
    );

    networkError.status = 0;

    throw networkError;
  }

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Something went wrong"
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export default api;