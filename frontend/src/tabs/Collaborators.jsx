import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { getWorkspace, getMembers } from "../api/api.js";
import MembersTab from "../components/MembersTab.jsx";

export default function Collaborators({ workspaceId }) {
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!workspaceId || !token) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      getWorkspace(workspaceId, token),
      getMembers(workspaceId, token),
    ])
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
  }, [workspaceId, token]);

  if (!workspaceId) {
    return (
      <div>
        <div className="main-header">
          <h1>Collaborators</h1>
        </div>
        <p className="placeholder">
          Create a workspace to invite collaborators.
        </p>
      </div>
    );
  }
  if (loading)
    return (
      <div className="main-header">
        <h1>Collaborators</h1>
      </div>
    );
  if (error) {
    return (
      <div>
        <div className="main-header">
          <h1>Collaborators</h1>
        </div>
        <p className="settings-error">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="main-header">
        <h1>Collaborators</h1>
      </div>
      {workspace && members && (
        <MembersTab
          workspaceId={workspaceId}
          myRole={workspace.myRole}
          ownerId={workspace.owner_id}
          initialMembers={members}
        />
      )}
    </div>
  );
}
