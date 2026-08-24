import { useState } from "react";
import { inviteMember, removeMember } from "../api/api.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function MembersTab({
  workspaceId,
  myRole,
  ownerId,
  initialMembers,
}) {
  const { token } = useAuth();
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const isAdmin = myRole === "admin";

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setInviteError("");
    try {
      const { member } = await inviteMember(workspaceId, email.trim(), token);
      setMembers((prev) => [...prev, member]);
      setEmail("");
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    try {
      await removeMember(workspaceId, userId, token);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="members-tab">
      {isAdmin && (
        <form className="invite-form" onSubmit={handleInvite}>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={inviting}>
            {inviting ? "Inviting…" : "Invite member"}
          </button>
        </form>
      )}
      {inviteError && <p className="invite-error">{inviteError}</p>}

      <ul className="member-list">
        {members.map((member) => (
          <li className="member-row" key={member.id}>
            {member.avatar_url ? (
              <img
                className="member-avatar"
                src={member.avatar_url}
                alt={member.name}
              />
            ) : (
              <div className="member-avatar" />
            )}
            <div className="member-info">
              <span className="member-name">{member.name}</span>
              <span className="member-email">{member.email}</span>
            </div>
            <span className={`role-badge ${member.role}`}>
              {member.role === "admin" ? "Admin" : "Member"}
            </span>
            {isAdmin && member.id !== ownerId && (
              <button
                className="remove-btn"
                onClick={() => handleRemove(member.id)}
                disabled={removingId === member.id}
              >
                {removingId === member.id ? "Removing…" : "Remove"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
