// import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./styles/base.css";
import "./styles/sidebar.css";
import "./styles/layout.css";
import "./styles/modal.css";
import "./styles/kanban.css";
import "./styles/landing.css";
import "./styles/auth.css";
import "./styles/task-modal.css";
import "./styles/timeline.css";
import "./styles/demo.css";
import "./styles/analytics.css";
import "./styles/misc.css";
import "./styles/responsive.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorkspaceSettings from "./components/WorkspaceSettings.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="workspaces/:id/settings"
            element={<WorkspaceSettings />}
          />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>,
);