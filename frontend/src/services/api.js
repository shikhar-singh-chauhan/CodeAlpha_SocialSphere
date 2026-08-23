const API_URL = "https://codealpha-socialsphere-huah.onrender.com/api";

const api = async (
  endpoint,
  options = {}
) => {
  const token =
    localStorage.getItem(
      "token"
    );

  // ==========================================
  // DETECT FORMDATA
  // ==========================================

  const isFormData =
    options.body instanceof FormData;

  // ==========================================
  // HEADERS
  // ==========================================

  const headers = {
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),

    ...(isFormData
      ? {}
      : {
          "Content-Type":
            "application/json",
        }),

    ...(options.headers || {}),
  };

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    const networkError =
      new Error(
        "Unable to connect to the server."
      );

    networkError.status = 0;

    throw networkError;
  }

  // ==========================================
  // PARSE RESPONSE
  // ==========================================

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }

  // ==========================================
  // ERROR RESPONSE
  // ==========================================

  if (!response.ok) {
    const error =
      new Error(
        data.message ||
          "Something went wrong"
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
};

export default api;