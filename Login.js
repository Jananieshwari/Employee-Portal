// frontend/src/pages/Login.js
import React, { useState } from "react";
import api, { setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";
import "../styless.css";

export default function Login() {
  const [tab, setTab] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  async function doLogin(e) {
    e.preventDefault();
    try {
      const path = tab === "admin" ? "/api/admin/login" : "/api/auth/login";
      const res = await api.post(path, { email, password });

      // backend returns token as access_token (your code)
      const token =
        res.data.access_token ||
        res.data.accessToken ||
        res.data.token ||
        res.data?.access_token;

      if (!token) throw new Error("No token returned from server");

      // Save token + role in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", tab === "admin" ? "admin" : "user");
      localStorage.setItem("user_email", email);

      // Set header on axios instance for subsequent requests
      setAuthToken(token);

      // redirect & refresh app state
      navigate(tab === "admin" ? "/admin" : "/user/personal");
      // reload is optional; but it ensures other components pick up auth
      window.location.reload();
    } catch (err) {
      setErr(err.response?.data?.msg || err.message || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="tabs">
          <button className={`tab ${tab === "user" ? "active" : ""}`} onClick={() => setTab("user")}>User Login</button>
          <button className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => setTab("admin")}>Admin Login</button>
        </div>

        <form onSubmit={doLogin} className="form">
          <input required placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input required placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn" type="submit">Login</button>
        </form>

        {err && <div className="notice error">{err}</div>}

        <div className="row between muted">
          <a href="/forgot-password">Forgot password?</a>
          
        </div>
      </div>
    </div>
  );
}
