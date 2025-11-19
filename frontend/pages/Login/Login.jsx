import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        setError(data.message || "Login failed");
        return;
    }

    login(data.token);
    toast.success("Logged in successfully!");
    setTimeout(() => navigate("/"), 1000);

  }

  return (
    <div className="auth-container">
      <h1>Login</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-btn primary">
          Login
        </button>
      </form>

      <div className="oauth-container">
        <button className="auth-btn google disabled" disabled>
          Continue with Google (coming soon)
        </button>
      </div>

      <p className="auth-note">
        New here?{" "}
        <span className="auth-link" onClick={() => navigate("/signup")}>
          Create an account
        </span>
      </p>
    </div>
  );
}
