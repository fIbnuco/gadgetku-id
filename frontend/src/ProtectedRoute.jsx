
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/admin/check",
          {
            method: "GET",
            credentials: "include"
          }
        );

        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkLogin();
  }, []);

  if (isAuthenticated === null) {
    return <p>Memeriksa login...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
