import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage({ onBack }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ username, password });
      } else {
        await register({ username, password, name, email });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-logo">
        <Logo />
      </div>

      <div className="login-card">
        <h1>Welcome to Optim</h1>
        <p>To get started, please sign in</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-in failed")}
          />
        </div>

        <div className="login-divider">or</div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="modal-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>

        <button
          className="login-toggle"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Log in"}
        </button>

        <button className="login-back" onClick={onBack}>
          Back to home
        </button>
      </div>

      <div className="login-page-footer">
        <span>Support</span>
        <span>Terms</span>
        <span>Privacy</span>
      </div>
    </div>
  );
}
