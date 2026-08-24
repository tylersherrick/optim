import { useState } from "react";
import NavItem from "./NavItem.jsx";
import {
  HomeIcon,
  KanbanIcon,
  TimelineIcon,
  CollabIcon,
  AnalyticsIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from "./icons.jsx";
import Logo from "./Logo.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "../theme/ThemeContext.jsx";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "kanban", label: "Kanban board", icon: <KanbanIcon /> },
  { key: "timeline", label: "Timeline", icon: <TimelineIcon /> },
  { key: "collab", label: "Collaborators", icon: <CollabIcon /> },
  { key: "analytics", label: "Analytics", icon: <AnalyticsIcon /> },
];

export default function Sidebar({ view, setView, onViewLanding }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleViewChange = (key) => {
    setView(key);
    setMenuOpen(false);
  };

  return (
    <div className={`sidebar ${menuOpen ? "mobile-menu-open" : ""}`}>
      <div className="sidebar-mobile-header">
        <button
          className="sidebar-logo-btn"
          onClick={onViewLanding}
          aria-label="View landing page"
        >
          <Logo />
        </button>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      <div className="mobile-menu">
        <div className="nav">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              active={view === item.key}
              onClick={() => handleViewChange(item.key)}
            />
          ))}
        </div>

        <div className="user">
          {user?.picture ? (
            <img
              className="avatar"
              src={user.picture}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar" />
          )}

          <div className="user-info">
            <span className="user-name">{user?.name ?? "Guest"}</span>
            {user?.email && <span className="user-email">{user.email}</span>}
          </div>

          <button
            className="logout-btn"
            onClick={toggleTheme}
            aria-label={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          <button
            className="logout-btn"
            onClick={logout}
            aria-label="Log out"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
}