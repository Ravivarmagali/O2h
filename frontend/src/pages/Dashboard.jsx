import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTasks, getStats, updateTask, deleteTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";

const STATUS_BADGE = {
  "Pending":     "badge-status badge-pending",
  "In Progress": "badge-status badge-inprogress",
  "Completed":   "badge-status badge-completed",
};

const STAT_CONFIG = [
  { key: "total",      label: "Total Tasks",  icon: "📋", color: "#0369a1", filter: "All"         },
  { key: "pending",    label: "Pending",       icon: "⏳", color: "#b45309", filter: "Pending"     },
  { key: "inProgress", label: "In Progress",   icon: "🔄", color: "#1d4ed8", filter: "In Progress" },
  { key: "completed",  label: "Completed",     icon: "✅", color: "#15803d", filter: "Completed"   },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [tasks, setTasks]         = useState([]);
  const [stats, setStats]         = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Filters
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [sort, setSort]           = useState("desc");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 5;

  const fetchStats = async () => {
    try { const r = await getStats(); setStats(r.data); } catch {}
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = {
        search, sort, page, limit: LIMIT,
        ...(statusFilter !== "All" && { status: statusFilter }),
      };
      const r = await getTasks(params);
      setTasks(r.data.tasks);
      setTotal(r.data.total);
      setTotalPages(r.data.totalPages);
    } catch {
      setError("Failed to load tasks. Is the backend running?");
    } finally { setLoading(false); }
  }, [search, statusFilter, sort, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleStatusFilter = (f) => { setStatus(f); setPage(1); };
  const handleSort = (v) => { setSort(v); setPage(1); };

  const handleComplete = async (id) => {
    try { await updateTask(id, { status: "Completed" }); fetchTasks(); fetchStats(); } catch {}
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try { await deleteTask(id); fetchTasks(); fetchStats(); } catch {}
  };

  return (
    <>
      {/* Navbar */}
      <nav className="app-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>
            O2H Task Manager
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            👋 <strong style={{ color: "#fff" }}>{user?.name}</strong>
          </span>
          <Link to="/add" className="btn-primary-grad" style={{ background: "rgba(255,255,255,0.15)", fontSize: 13 }}>
            + Add Task
          </Link>
          <button onClick={logout} style={{
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13
          }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {STAT_CONFIG.map(({ key, label, icon, color, filter }) => (
            <div key={key} className="stat-card"
              style={{ borderTop: `3px solid ${color}` }}
              onClick={() => { handleStatusFilter(filter); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
                  <p style={{ fontSize: 30, fontWeight: 700, color, margin: 0 }}>{stats[key]}</p>
                </div>
                <span style={{ fontSize: 26, opacity: 0.8 }}>{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
          {/* Search */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}
            style={{
              padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
              fontSize: 13, background: "#f8fafc", outline: "none", cursor: "pointer"
            }}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Sort */}
          <select value={sort} onChange={(e) => handleSort(e.target.value)}
            style={{
              padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
              fontSize: 13, background: "#f8fafc", outline: "none", cursor: "pointer"
            }}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b" }}>
            {total} task{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 14
          }}>⚠️ {error}</div>
        )}

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0",
              borderTop: "3px solid #0369a1", borderRadius: "50%",
              animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ color: "#64748b", fontSize: 14 }}>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>No tasks found</h3>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              {search ? `No results for "${search}"` : "Get started by creating your first task."}
            </p>
            <Link to="/add" className="btn-primary-grad">+ Add Task</Link>
          </div>
        ) : (
          <>
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>{task.title}</h3>
                      <span className={STATUS_BADGE[task.status] || "badge-status"}>{task.status}</span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                    <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
                      🗓 {new Date(task.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {task.status !== "Completed" && (
                      <button onClick={() => handleComplete(task.id)} style={{
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        color: "#15803d", borderRadius: 7, padding: "6px 12px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer"
                      }}>✓ Complete</button>
                    )}
                    <button onClick={() => handleDelete(task.id)} style={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      color: "#b91c1c", borderRadius: 7, padding: "6px 12px",
                      fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 24 }}>
              <button className="pagination-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === "..." ? (
                  <span key={`dot-${i}`} style={{ color: "#94a3b8", fontSize: 13 }}>…</span>
                ) : (
                  <button key={p} className={`pagination-btn${page === p ? " active" : ""}`}
                    onClick={() => setPage(p)}>{p}</button>
                ))
              }

              <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <button className="pagination-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>

              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>
                Page {page} of {totalPages}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
