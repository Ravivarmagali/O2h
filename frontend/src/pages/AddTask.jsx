import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

export default function AddTask() {
  const navigate      = useNavigate();
  const { user, logout } = useAuth();
  const [form, setForm]       = useState({ title: "", description: "", status: "Pending" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await createTask(form); navigate("/"); }
    catch (err) { setError(err.response?.data?.message || "Failed to create task."); }
    finally { setLoading(false); }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="app-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>O2H Task Manager</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            👋 <strong style={{ color: "#fff" }}>{user?.name}</strong>
          </span>
          <Link to="/" style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", borderRadius: 8, padding: "7px 14px", textDecoration: "none", fontSize: 13
          }}>← Dashboard</Link>
          <button onClick={logout} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 620, margin: "40px auto", padding: "0 20px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 20, fontSize: 13, color: "#64748b" }}>
          <Link to="/" style={{ color: "#0369a1", textDecoration: "none" }}>Dashboard</Link>
          <span>/</span>
          <span style={{ color: "#1e293b", fontWeight: 500 }}>Add Task</span>
        </div>

        <div className="card-clean" style={{ padding: "32px 30px" }}>
          <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>New Task</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Fill in the details to create a task</p>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              color: "#b91c1c", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Title</label>
              <input name="title" required autoFocus className="input-field"
                placeholder="e.g. Fix login bug" value={form.title} onChange={onChange} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Description</label>
              <textarea name="description" required className="input-field"
                style={{ minHeight: 110, resize: "vertical" }}
                placeholder="Describe the task in detail..."
                value={form.description} onChange={onChange} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label className="form-label">Status</label>
              <select name="status" className="input-field" value={form.status} onChange={onChange}>
                <option value="Pending">⏳ Pending</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="btn-primary-grad" style={{ padding: "10px 24px" }} disabled={loading}>
                {loading ? <><span className="spinner" /> Saving...</> : "Add Task"}
              </button>
              <button type="button" onClick={() => navigate("/")} style={{
                background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8,
                padding: "10px 20px", fontSize: 14, cursor: "pointer", color: "#475569", fontWeight: 500
              }}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
