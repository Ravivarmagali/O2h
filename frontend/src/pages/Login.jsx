import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, marginBottom: 14
          }}>✅</div>
          <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 26, margin: 0 }}>O2H Task Manager</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", marginTop: 6, fontSize: 14 }}>
            Organise your work. Stay on track.
          </p>
        </div>

        {/* Card */}
        <div className="card-clean" style={{ padding: "36px 32px" }}>
          <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#b91c1c", borderRadius: 8, padding: "10px 14px",
              fontSize: 13, marginBottom: 18
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>📧</span>
                <input
                  name="email" type="email" required autoFocus
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔒</span>
                <input
                  name="password" type={showPw ? "text" : "password"} required
                  className="input-field"
                  style={{ paddingLeft: 38, paddingRight: 44 }}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={onChange}
                />
                <button type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", fontSize: 16
                  }}
                >{showPw ? "🙈" : "👁️"}</button>
              </div>
            </div>

            <button type="submit" className="btn-primary-grad" style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#0369a1", fontWeight: 600, textDecoration: "none" }}>
              Create one free
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 24 }}>
          © 2024 O2H Task Manager
        </p>
      </div>
    </div>
  );
}
