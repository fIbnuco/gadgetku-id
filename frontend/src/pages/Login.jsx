
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ username, password })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Username atau kata sandi salah");
        return;
      }

      sessionStorage.setItem("adminLoggedIn", "true");
      navigate("/admin");

    } catch (error) {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>GadgetKu ID</h2>
        <p>Login Administrator</p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <label>Username</label>
        <input
          type="text"
          placeholder="Masukkan username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />

        <label>Kata Sandi</label>
        <input
          type="password"
          placeholder="Masukkan kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? (
            <span className="login-loading">
              <span className="login-spinner"></span>
              Memproses...
            </span>
          ) : (
            "Masuk"
          )}
        </button>
      </form>
    </div>
  );
}
