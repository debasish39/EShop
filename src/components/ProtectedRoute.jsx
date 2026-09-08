import React, {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import Spinner from "./Spinner";

export default function ProtectedRoute({
  children,
}) {
  /* =====================================
     STATES
  ===================================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const location = useLocation();

  /* =====================================
     CHECK AUTH
  ===================================== */

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token =
          localStorage.getItem("token");

        /* =====================================
           NO TOKEN
        ===================================== */

        if (!token) {
          setLoading(false);
          return;
        }

        /* =====================================
           VERIFY TOKEN
        ===================================== */

        const backendUrl =
          import.meta.env.VITE_BACKEND_URL;

        const res = await fetch(
          `${backendUrl}/api/auth/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        /* =====================================
           SUCCESS
        ===================================== */

        if (data.success) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error(
          "Authentication verification failed:",
          error
        );

        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  /* =====================================
     LOADING
  ===================================== */

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          text-white
        "
      >
        <Spinner />
      </div>
    );
  }

  /* =====================================
     NOT AUTHENTICATED
  ===================================== */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/phone-login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  /* =====================================
     AUTHENTICATED
  ===================================== */

  return <>{children}</>;
}