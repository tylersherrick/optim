import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../api/client.js";
import styles from "./WorkspaceSwitcher.module.css";

// Ticket 9: workspace switcher dropdown in the navbar.
export default function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  useEffect(() => {
    let cancelled = false;
    api
      .get("/workspaces")
      .then((data) => {
        if (!cancelled) setWorkspaces(data.workspaces);
      })
      .catch(() => {
        // Auth/network errors surface elsewhere in the app; the switcher
        // just falls back to showing no workspaces rather than crashing.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = workspaces.find((w) => String(w.id) === workspaceId);
  const label = current
    ? current.name
    : loading
      ? "Loading…"
      : "Select workspace";

  function selectWorkspace(id) {
    setOpen(false);
    navigate(`/workspaces/${id}`);
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <button className={styles.trigger} onClick={() => setOpen((o) => !o)}>
        {label}
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <div className={styles.menu}>
          {workspaces.length === 0 && !loading && (
            <div className={styles.empty}>No workspaces yet</div>
          )}
          {workspaces.map((w) => {
            const isActive = String(w.id) === workspaceId;
            return (
              <button
                key={w.id}
                onClick={() => selectWorkspace(w.id)}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
              >
                {w.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
