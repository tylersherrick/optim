const DOT_COLORS = ["#8fb996", "#4a5468", "#2f3542", "#c7c4bd"];

const STATUS_LABELS = {
  planning: "Planning",
  active: "On track",
  completed: "Completed",
  archived: "Archived",
};

const STATUS_CLASSES = {
  planning: "at-risk",
  active: "on-track",
  completed: "on-track",
  archived: "at-risk",
};

export default function BoardCard({ board, onClick, onDelete }) {
  const badgeClass = STATUS_CLASSES[board.status] ?? "at-risk";
  const badgeText = STATUS_LABELS[board.status] ?? board.status;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${board.name}"? This can't be undone.`)) {
      onDelete(board.id);
    }
  };

  return (
    <div className="card" onClick={onClick}>
      <div className="card-top">
        <h3>{board.name}</h3>
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="meta">
        {board.tasks} tasks &middot; updated {board.updated}
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${board.progress}%` }}
        />
      </div>
      <div className="card-bottom">
        <div className="avatars">
          {Array.from({ length: board.avatars }).map((_, i) => (
            <div
              key={i}
              className="dot"
              style={{ background: DOT_COLORS[i % DOT_COLORS.length] }}
            />
          ))}
        </div>
        <button
          className="delete-btn"
          onClick={handleDelete}
          aria-label="Delete board"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export function NewBoardCard({ onClick }) {
  return (
    <div className="card new-board" onClick={onClick}>
      <div className="plus">+</div>
      <div>Start a new board</div>
    </div>
  );
}
