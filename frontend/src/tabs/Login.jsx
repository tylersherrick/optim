import { useState } from "react";
import { useNavigate } from "react-router";
// import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="login-screen">
      <h1>Optim</h1>
      <p>Sign in to continue</p>
      <GoogleLogin
        onSuccess={onGoogleSuccess}
        onError={() => setError("Google sign-in failed")}
      />
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}
