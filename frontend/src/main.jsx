// import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorkspaceSettings from "./components/WorkspaceSettings.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
    </ThemeProvider>
  </GoogleOAuthProvider>,
);
