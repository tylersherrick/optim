import { useEffect, useState } from "react";
import { getAnalytics } from "../api/api.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Analytics({ projectId }) {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId || !token) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getAnalytics(projectId, token)
      .then((res) => {
        if (!cancelled) setData(res);
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
  }, [projectId, token]);

  if (!projectId) {
    return (
      <div>
        <div className="main-header">
          <h1>Analytics</h1>
        </div>
        <p className="settings-message">
          Select a project from Home first to see its analytics.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <div className="main-header">
          <h1>Analytics</h1>
        </div>
        <p className="settings-message">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="main-header">
          <h1>Analytics</h1>
        </div>
        <p className="settings-error">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { velocity, cycleTime, workload } = data;
  const maxVelocity = Math.max(1, ...velocity.map((w) => w.completed));
  const maxWorkload = Math.max(
    1,
    ...workload.map((w) => Number(w.open_task_count)),
  );

  return (
    <div>
      <div className="main-header">
        <h1>Analytics</h1>
      </div>

      <div className="analytics-grid">
        <div className="card analytics-stat">
          <p className="meta">Average cycle time</p>
          <h2>
            {cycleTime.averageHours != null
              ? formatHours(cycleTime.averageHours)
              : "—"}
          </h2>
          <p className="meta">
            {cycleTime.taskCount} task{cycleTime.taskCount === 1 ? "" : "s"}{" "}
            completed
          </p>
        </div>

        <div className="card analytics-stat">
          <p className="meta">Completed (last 6 weeks)</p>
          <h2>{velocity.reduce((sum, w) => sum + w.completed, 0)}</h2>
        </div>
      </div>

      <div className="card analytics-section">
        <h3>Velocity</h3>
        {velocity.length === 0 ? (
          <p className="meta">No completed tasks yet.</p>
        ) : (
          <div className="analytics-bars">
            {velocity.map((w) => (
              <div className="analytics-bar-row" key={w.week_start}>
                <span className="analytics-bar-label">
                  {formatWeek(w.week_start)}
                </span>
                <div className="progress-track analytics-bar-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(w.completed / maxVelocity) * 100}%` }}
                  />
                </div>
                <span className="analytics-bar-value">{w.completed}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card analytics-section">
        <h3>Workload</h3>
        {workload.length === 0 ? (
          <p className="meta">No project members yet.</p>
        ) : (
          <div className="analytics-bars">
            {workload.map((w) => (
              <div className="analytics-bar-row" key={w.id}>
                <span className="analytics-bar-label">{w.name}</span>
                <div className="progress-track analytics-bar-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(Number(w.open_task_count) / maxWorkload) * 100}%`,
                    }}
                  />
                </div>
                <span className="analytics-bar-value">{w.open_task_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatHours(hours) {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${Math.round((hours / 24) * 10) / 10}d`;
}

function formatWeek(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
