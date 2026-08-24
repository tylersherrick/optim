import { useEffect, useRef, useState } from "react";

const DEMO_MEMBERS = [
  { id: "avonda", name: "Avonda F.", role: "Tech Lead", color: "#504d63" },
  { id: "lucas", name: "Lucas G.", role: "Backend", color: "#4a5765" },
  { id: "james", name: "James T.", role: "Frontend", color: "#819aa3" },
  { id: "tyler", name: "Tyler S.", role: "Design", color: "#8fb87a" },
];

const DEMO_COLUMNS = [
  { id: "todo", name: "To Do", dot: "#819aa3" },
  { id: "inprogress", name: "In Progress", dot: "#d9a54a" },
  { id: "done", name: "Done", dot: "#8fb87a" },
];

const INITIAL_CARDS = [
  {
    id: "c1",
    num: "ENG-114",
    title: "Payment webhook drops events under load",
    col: "todo",
    assignee: null,
  },
  {
    id: "c2",
    num: "ENG-109",
    title: "Saved board filters per user",
    col: "todo",
    assignee: "james",
  },
  {
    id: "c3",
    num: "ENG-101",
    title: "One-click quick-assign from board",
    col: "inprogress",
    assignee: "lucas",
  },
  {
    id: "c4",
    num: "ENG-098",
    title: "Google OAuth token exchange endpoint",
    col: "done",
    assignee: "lucas",
  },
];

const initials = (n) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .replace(".", "");
const memberById = (id) => DEMO_MEMBERS.find((m) => m.id === id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function DemoTour({ onClose }) {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [caption, setCaption] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [popMember, setPopMember] = useState(null);
  const [glowCard, setGlowCard] = useState(null);
  const [done, setDone] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2400);
  };

  const flyTo = async (cardId, targetSelector) => {
    const root = rootRef.current;
    if (!root) return;
    const src = root.querySelector(`#${cardId}`);
    const tgt = root.querySelector(targetSelector);
    if (!src || !tgt) return;
    const s = src.getBoundingClientRect();
    const t = tgt.getBoundingClientRect();
    const clone = src.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.zIndex = 999;
    clone.style.left = `${s.left}px`;
    clone.style.top = `${s.top}px`;
    clone.style.width = `${s.width}px`;
    clone.style.pointerEvents = "none";
    clone.style.boxShadow = "0 14px 34px rgba(46,55,66,.3)";
    clone.style.transition = "all 1.1s cubic-bezier(.5,.05,.3,1)";
    clone.style.transform = "rotate(2deg) scale(1.02)";
    document.body.appendChild(clone);
    src.style.opacity = "0.35";
    await wait(60);
    clone.style.left = `${t.left + t.width / 2 - s.width / 2}px`;
    clone.style.top = `${t.top + Math.min(t.height / 2, 60) - 20}px`;
    clone.style.transform = "rotate(0deg) scale(.92)";
    await wait(1150);
    clone.remove();
    src.style.opacity = "1";
  };

  const run = async () => {
    setDone(false);
    setCards(INITIAL_CARDS);
    await wait(500);

    setCaption("It's 4:45 on a Friday. A critical bug just landed.");
    await wait(2400);

    setCaption("Avonda drags it onto Lucas. One motion — assigned.");
    await wait(500);
    await flyTo("c1", '[data-member="lucas"]');
    setCards((cs) =>
      cs.map((c) => (c.id === "c1" ? { ...c, assignee: "lucas" } : c)),
    );
    setPopMember("lucas");
    setGlowCard("c1");
    showToast("ENG-114 assigned to Lucas");
    setTimeout(() => setPopMember(null), 600);
    setTimeout(() => setGlowCard(null), 1200);
    await wait(2200);

    setCaption("Saturday morning: Lucas drags it to In Progress.");
    await wait(500);
    await flyTo("c1", '[data-col="inprogress"]');
    setCards((cs) =>
      cs.map((c) => (c.id === "c1" ? { ...c, col: "inprogress" } : c)),
    );
    setGlowCard("c1");
    showToast("ENG-114 moved to In Progress");
    setTimeout(() => setGlowCard(null), 1200);
    await wait(2400);

    setCaption("No modal. No dropdown. The board is the interface.");
    await wait(2600);
    setCaption("");
    setDone(true);
  };

  return (
    <div
      className="demo-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="demo-modal" ref={rootRef}>
        <div className="demo-topbar">
          <span className="demo-logo">Optim — live demo</span>
          <button className="demo-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="demo-body">
          <aside className="demo-rail">
            <h4>Team</h4>
            {DEMO_MEMBERS.map((m) => (
              <div
                key={m.id}
                data-member={m.id}
                className={`demo-member ${popMember === m.id ? "pop" : ""}`}
              >
                <div className="demo-av" style={{ background: m.color }}>
                  {initials(m.name)}
                </div>
                <div className="demo-info">
                  <div className="demo-name">{m.name}</div>
                  <div className="demo-role">{m.role}</div>
                </div>
              </div>
            ))}
          </aside>

          <div className="demo-board">
            {DEMO_COLUMNS.map((col) => (
              <div key={col.id} data-col={col.id} className="demo-col">
                <div className="demo-col-head">
                  <span className="demo-dot" style={{ background: col.dot }} />
                  {col.name}
                </div>
                {cards
                  .filter((c) => c.col === col.id)
                  .map((c) => {
                    const a = c.assignee ? memberById(c.assignee) : null;
                    return (
                      <div
                        id={c.id}
                        key={c.id}
                        className={`demo-card ${glowCard === c.id ? "glow" : ""}`}
                      >
                        <div className="demo-card-title">{c.title}</div>
                        <div className="demo-card-meta">
                          <span className="demo-tasknum">{c.num}</span>
                          {a ? (
                            <span className="demo-assignee">
                              <span
                                className="demo-mini"
                                style={{ background: a.color }}
                              >
                                {initials(a.name)}
                              </span>
                              {a.name.split(" ")[0]}
                            </span>
                          ) : (
                            <span className="demo-assignee unassigned">
                              <span className="demo-mini">+</span>Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {caption && <div className="demo-caption show">{caption}</div>}
        {toastMsg && (
          <div className="demo-toast show">
            <span className="demo-toast-tick">✓</span>
            {toastMsg}
          </div>
        )}

        {done && (
          <div className="demo-footer">
            <button className="btn-secondary" onClick={run}>
              Replay
            </button>
            <button className="btn-primary" onClick={onClose}>
              Get started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
