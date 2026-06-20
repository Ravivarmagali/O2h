import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const strength = (pw) => {
  if (!pw) return { label: "", color: "#e2e8f0", pct: 0 };
  if (pw.length < 6)  return { label: "Weak",   color: "#ef4444", pct: 33 };
  if (pw.length < 10) return { label: "Medium", color: "#f59e0b", pct: 66 };
  return               { label: "Strong", color: "#22c55e", pct: 100 };
};

export default function Register() {
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const pwStr    = strength(form.password);
  const pwMatch  = form.confirm && form.confirm === form.password;
  const pwNoMatch = form.confirm && form.confirm !== form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 6)       return setError("Password must be at least 6 characters.");
    setError(""); setLoading(true);
    try {
      const res = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, marginBottom: 12
          }}>✅</div>
          <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 24, margin: 0 }}>O2H Task Manager</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 5, fontSize: 14 }}>Create your free account</p>
        </div>

        <div className="card-clean" style={{ padding: "32px 30px" }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Get started</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 22 }}>Fill in your details below</p>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#b91c1c", borderRadius: 8, padding: "10px 14px",
              fontSize: 13, marginBottom: 16
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>👤</span>
                <input name="name" required autoFocus className="input-field" style={{ paddingLeft: 38 }}
                  placeholder="John Doe" value={form.name} onChange={onChange} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>📧</span>
                <input name="email" type="email" required className="input-field" style={{ paddingLeft: 38 }}
                  placeholder="you@example.com" value={form.email} onChange={onChange} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 6 }}>
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔒</span>
                <input name="password" type={showPw ? "text" : "password"} required
                  className="input-field" style={{ paddingLeft: 38, paddingRight: 44 }}
                  placeholder="Min. 6 characters" value={form.password} onChange={onChange} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: 16
                }}>{showPw ? "🙈" : "👁️"}</button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pwStr.pct}%`, background: pwStr.color, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: pwStr.color, fontWeight: 600 }}>{pwStr.label}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 22 }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔒</span>
                <input name="confirm" type={showPw ? "text" : "password"} required
                  className={`input-field${pwNoMatch ? " error" : ""}`}
                  style={{ paddingLeft: 38 }}
                  placeholder="Re-enter password" value={form.confirm} onChange={onChange} />
              </div>
              {pwNoMatch && <span style={{ fontSize: 11, color: "#ef4444" }}>Passwords don't match</span>}
              {pwMatch   && <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Passwords match</span>}
            </div>

            <button type="submit" className="btn-primary-grad"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account...</> : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#0369a1", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20 }}>
          © 2024 O2H Task Manager
        </p>
      </div>
    </div>
  );
}
