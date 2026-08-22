import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Wait until authentication status is checked
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading SocialSphere...
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// =====================================================
// APPLICATION LAYOUT
// =====================================================

function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  // Hide navbar on authentication pages
  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="app-layout">

      {/* =================================================
          GLOBAL NAVBAR
      ================================================= */}

      {user && !hideNavbar && (
        <Navbar />
      )}

      {/* =================================================
          APPLICATION ROUTES
      ================================================= */}

      <Routes>

        {/* ===============================================
            ROOT
        =============================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

        {/* ===============================================
            LOGIN
        =============================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ===============================================
            REGISTER
        =============================================== */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ===============================================
            HOME
        =============================================== */}

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* ===============================================
            SEARCH / DISCOVER
        =============================================== */}

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        {/* ===============================================
            NOTIFICATIONS
        =============================================== */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* ===============================================
            USER PROFILE
        =============================================== */}

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ===============================================
            UNKNOWN ROUTES
        =============================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/home"
              replace
            />
          }
        />

      </Routes>
    </div>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;