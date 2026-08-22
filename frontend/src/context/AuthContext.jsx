import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

// ==========================================
// NORMALIZE USER
// ==========================================

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,

    _id:
      user._id ||
      user.id,

    id:
      user.id ||
      user._id,
  };
};

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================
  // LOAD CURRENT USER
  // ==========================================

  const loadUser = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);

      return;
    }

    try {
      const data = await api(
        "/auth/me",
        {
          method: "GET",
        }
      );

      const normalizedUser =
        normalizeUser(data.user);

      setUser(normalizedUser);

      // Save a small cached copy
      localStorage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );
    } catch (error) {
      console.error(
        "Authentication restore error:",
        error
      );

      // Token is actually invalid/expired
      if (
        error.status === 401 ||
        error.status === 403 ||
        error.status === 404
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setUser(null);
      } else {
        /*
          Backend/network temporarily failed.
          Do NOT destroy the login session.
        */

        const cachedUser =
          localStorage.getItem(
            "user"
          );

        if (cachedUser) {
          try {
            setUser(
              normalizeUser(
                JSON.parse(
                  cachedUser
                )
              )
            );
          } catch {
            setUser(null);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD AUTH WHEN APP STARTS
  // ==========================================

  useEffect(() => {
    loadUser();
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    email,
    password
  ) => {
    try {
      const data = await api(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      if (!data.token) {
        throw new Error(
          "Login succeeded but no authentication token was received."
        );
      }

      const normalizedUser =
        normalizeUser(
          data.user
        );

      // Save JWT
      localStorage.setItem(
        "token",
        data.token
      );

      // Save cached user
      localStorage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );

      setUser(
        normalizedUser
      );

      return {
        ...data,
        user:
          normalizedUser,
      };
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      throw error;
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };

  // ==========================================
  // UPDATE USER IN CONTEXT
  // ==========================================

  const updateAuthUser = (
    updatedUser
  ) => {
    const mergedUser =
      normalizeUser({
        ...user,
        ...updatedUser,
      });

    setUser(
      mergedUser
    );

    localStorage.setItem(
      "user",
      JSON.stringify(
        mergedUser
      )
    );
  };

  // ==========================================
  // CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loadUser,
        updateAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
  return useContext(
    AuthContext
  );
};