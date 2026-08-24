import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getProjects } from "../api/api.js";

const PALETTE = [
  "#4a90d9",
  "#f2a93b",
  "#5bc48c",
  "#e0637a",
  "#8f7fe0",
  "#3fb6c9",
  "#e08a3f",
  "#6fae4a",
];
const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function buildMonths(rangeStart, rangeEnd) {
  const months = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const totalMs = rangeEnd - rangeStart;
  while (cursor <= rangeEnd) {
    const monthStart = new Date(cursor);
    const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const visibleStart = monthStart < rangeStart ? rangeStart : monthStart;
    const visibleEnd = monthEnd > rangeEnd ? rangeEnd : monthEnd;
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: MONTH_LABELS[cursor.getMonth()],
      startPct: ((visibleStart - rangeStart) / totalMs) * 100,
      widthPct: ((visibleEnd - visibleStart) / totalMs) * 100,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

export default function Timeline({ workspaceId }) {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId || !token) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getProjects(workspaceId, token)
      .then(({ projects }) => {
        if (!cancelled) setProjects(projects);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, token]);

  if (!workspaceId) {
    return (
      <div>
        <div className="main-header">
          <h1>Timeline</h1>
        </div>
        <p className="placeholder">Create a workspace to see a timeline.</p>
      </div>
    );
  }
  if (loading)
    return (
      <div className="main-header">
        <h1>Timeline</h1>
      </div>
    );
  if (error) {
    return (
      <div>
        <div className="main-header">
          <h1>Timeline</h1>
        </div>
        <p className="settings-error">{error}</p>
      </div>
    );
  }

  const dated = projects.filter((p) => p.start_date && p.end_date);
  const undated = projects.filter((p) => !p.start_date || !p.end_date);

  if (dated.length === 0) {
    return (
      <div>
        <div className="main-header">
          <h1>Timeline</h1>
        </div>
        <p className="placeholder">No projects have start/end dates set yet.</p>
      </div>
    );
  }

  const starts = dated.map((p) => new Date(p.start_date));
  const ends = dated.map((p) => new Date(p.end_date));
  const rangeStart = new Date(Math.min(...starts) - 3 * 86400000);
  const rangeEnd = new Date(Math.max(...ends) + 3 * 86400000);
  const totalMs = Math.max(rangeEnd - rangeStart, 1);
  const months = buildMonths(rangeStart, rangeEnd);

  const today = new Date();
  const todayPct =
    today >= rangeStart && today <= rangeEnd
      ? ((today - rangeStart) / totalMs) * 100
      : null;

  return (
    <div>
      <div className="main-header">
        <h1>Timeline</h1>
      </div>

      <div className="gantt">
        <div className="gantt-header">
          <div className="gantt-label-col" />
          <div className="gantt-track-col gantt-header-track">
            {months.map((m) => (
              <div
                key={m.key}
                className="gantt-month"
                style={{ left: `${m.startPct}%`, width: `${m.widthPct}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        <div className="gantt-body">
          {dated.map((p, i) => {
            const s = new Date(p.start_date);
            const e = new Date(p.end_date);
            const left = ((s - rangeStart) / totalMs) * 100;
            const width = Math.max(((e - s) / totalMs) * 100, 1.5);
            const color = PALETTE[i % PALETTE.length];
            return (
              <div className="gantt-row" key={p.id}>
                <div className="gantt-label-col">
                  <span className="gantt-dot" style={{ background: color }} />
                  <span className="gantt-name">{p.name}</span>
                </div>
                <div className="gantt-track-col">
                  {months.map((m) => (
                    <div
                      key={m.key}
                      className="gantt-gridline"
                      style={{ left: `${m.startPct}%` }}
                    />
                  ))}
                  {todayPct !== null && (
                    <div
                      className="gantt-today"
                      style={{ left: `${todayPct}%` }}
                    />
                  )}
                  <div
                    className="gantt-bar"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: color,
                    }}
                    title={`${p.name}: ${p.start_date} → ${p.end_date}`}
                  >
                    <span className="gantt-bar-label">{p.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {undated.length > 0 && (
        <p className="placeholder">
          {undated.length} project{undated.length > 1 ? "s" : ""} without dates:{" "}
          {undated.map((p) => p.name).join(", ")}
        </p>
      )}
    </div>
  );
}
