import { useState } from "react";
import {
  KanbanIcon,
  TimelineIcon,
  CollabIcon,
  ShieldIcon,
  QuoteIcon,
  ChevronDownIcon,
} from "../components/icons.jsx";

import Logo from "../components/Logo.jsx";

import DemoTour from "../components/DemoTour.jsx";

const NAV_LINKS = ["Product", "Solutions", "Resources"];

const LOGOS = [
  "Fullstack",
  "Grain & Berry",
  "Kids Next Door",
  "Ed, Edd, n Eddy",
  "Filler Name",
];

const FEATURES = [
  {
    icon: KanbanIcon,
    title: "Shared boards",
    body: "Every project lives in one board, visible to your whole team in real time.",
  },
  {
    icon: TimelineIcon,
    title: "Smart timelines",
    body: "See dependencies and deadlines before they become a problem.",
  },
  {
    icon: CollabIcon,
    title: "One workspace",
    body: "Chats, files, and decisions stay attached to the work, not scattered across tools.",
  },
  {
    icon: ShieldIcon,
    title: "Built-in governance",
    body: "Roles and permissions keep the right people looking at the right things.",
  },
];

const SHOWCASE_TABS = [
  {
    key: "boards",
    label: "Boards",
    render: () => (
      <div className="showcase-card">
        <div className="showcase-card-top">
          <span>Site redesign</span>
          <span className="badge on-track">On track</span>
        </div>
        <div className="meta">12 tasks &middot; updated 2h ago</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: "70%" }} />
        </div>
      </div>
    ),
  },
  {
    key: "timeline",
    label: "Timeline",
    render: () => (
      <div className="showcase-card showcase-timeline">
        <div className="timeline-row">
          <span>Discovery</span>
          <div className="timeline-track">
            <div
              className="timeline-bar"
              style={{ left: "0%", width: "20%" }}
            />
          </div>
        </div>
        <div className="timeline-row">
          <span>Design</span>
          <div className="timeline-track">
            <div
              className="timeline-bar"
              style={{ left: "18%", width: "30%" }}
            />
          </div>
        </div>
        <div className="timeline-row">
          <span>Build</span>
          <div className="timeline-track">
            <div
              className="timeline-bar"
              style={{ left: "45%", width: "40%" }}
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "team",
    label: "Team",
    render: () => (
      <div className="showcase-card showcase-team">
        {["James", "Avonda", "Tyler", "Lucas"].map((name) => (
          <div className="team-row" key={name}>
            <div className="team-avatar" />
            <span>{name}</span>
          </div>
        ))}
      </div>
    ),
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: ["Boards", "Timelines", "Integrations", "What's new"],
  },
  {
    title: "Use cases",
    links: [
      "Product launches",
      "Marketing campaigns",
      "Goal tracking",
      "Onboarding",
    ],
  },
  {
    title: "Resources",
    links: ["Help center", "Templates", "Community"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Trust and security"],
  },
];

export default function LandingPage({ onGetStarted, loggedIn = false }) {
  const [activeTab, setActiveTab] = useState(SHOWCASE_TABS[0].key);
  const [showDemo, setShowDemo] = useState(false);
  const activeShowcase = SHOWCASE_TABS.find((tab) => tab.key === activeTab);

  return (
    <div className="landing">
      <div className="landing-inner">
        <nav className="landing-nav">
          <Logo badge />
          <div className="landing-links">
            {NAV_LINKS.map((link) => (
              <span key={link} className="landing-link">
                {link} <ChevronDownIcon />
              </span>
            ))}
          </div>
          <div className="landing-nav-actions">
            {loggedIn ? (
              <button className="btn-primary pill" onClick={onGetStarted}>
                Go to app
              </button>
            ) : (
              <>
                <button className="btn-ghost pill" onClick={onGetStarted}>
                  Log in
                </button>
                <button className="btn-primary pill" onClick={onGetStarted}>
                  Get started
                </button>
              </>
            )}
          </div>
        </nav>

        <section className="landing-hero">
          <h1>The workspace for teams that ship together</h1>
          <p>
            Optim brings your boards, timelines, and people into one connected
            view, so nothing gets lost between chats.
          </p>
          <div className="landing-hero-actions">
            <button className="btn-primary pill" onClick={onGetStarted}>
              Get started
            </button>
            <button
              className="btn-ghost pill"
              onClick={() => setShowDemo(true)}
            >
              See how it works
            </button>
          </div>
        </section>

        <section className="landing-logos">
          <p className="landing-logos-label">Trusted by teams at</p>
          <div className="landing-logos-row">
            {LOGOS.map((logo) => (
              <span key={logo}>{logo}</span>
            ))}
          </div>
        </section>

        <section className="landing-features">
          <h2>Built for how your team actually works</h2>
          <div className="feature-grid">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div className="feature-card" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-showcase">
          <h2>See Optim in action</h2>
          <div className="showcase-panel">
            <div className="showcase-tabs">
              {SHOWCASE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`showcase-tab${activeTab === tab.key ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="showcase-body">{activeShowcase.render()}</div>
          </div>
        </section>

        <section className="landing-testimonial">
          <QuoteIcon />
          <p>
            Optim cut our status-meeting time in half. Everyone already knows
            where things stand.
          </p>

          <span>Lincoln, Head of Devs in Philadelphia</span>
        </section>

        <section className="landing-cta">
          <h2>Bring your team into Optim</h2>
          <button className="btn-primary pill" onClick={onGetStarted}>
            Get started
          </button>
        </section>
      </div>

      <footer className="landing-footer">
        <div className="landing-footer-columns">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} Optim</span>
          <div>
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </footer>

      {showDemo && <DemoTour onClose={() => setShowDemo(false)} />}
    </div>
  );
}
