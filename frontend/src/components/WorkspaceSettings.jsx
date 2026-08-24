import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getWorkspace, getMembers } from "../api/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import MembersTab from "../components/MembersTab.jsx";

export default function WorkspaceSettings() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([getWorkspace(id, token), getMembers(id, token)])
      .then(([workspaceRes, membersRes]) => {
        if (cancelled) return;
        setWorkspace(workspaceRes.workspace);
        setMembers(membersRes.members);
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
  }, [id, token]);

  if (!user) {
    return (
      <div className="settings-page">
        <p className="settings-message">
          You need to be signed in to view this page.{" "}
          <Link to="/">Go back home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <Link to="/" className="settings-back">
          &larr; Back to Optim
        </Link>

        <h1>{workspace ? workspace.name : "Workspace"} settings</h1>

        <div className="settings-tabs">
          <span className="settings-tab active">Members</span>
        </div>

        {loading && <p className="settings-message">Loading members…</p>}
        {error && <p className="settings-message settings-error">{error}</p>}

        {!loading && !error && workspace && members && (
          <MembersTab
            workspaceId={id}
            myRole={workspace.myRole}
            ownerId={workspace.owner_id}
            initialMembers={members}
          />
        )}
      </div>
    </div>
  );
}
