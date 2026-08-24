import { useEffect, useRef, useState } from "react";

const STATUSES = ["planning", "active", "completed", "archived"];

export default function NewBoardModal({ open, onClose, onCreate, error }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("planning");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
      setStatus("planning");
      setStartDate("");
      setEndDate("");
    }
  }, [open]);

  if (!open) return null;

  const handleCreate = () => {
    const name = inputRef.current.value.trim();
    if (!name) return;
    onCreate({
      name,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
    });
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <h2>New board</h2>
        <input
          ref={inputRef}
          type="text"
          placeholder="Board name"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <label className="modal-label">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="modal-label">
          Start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="modal-label">
          End date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleCreate}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
