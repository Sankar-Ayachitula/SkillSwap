import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../utils/AuthContext.jsx";
import "../css/AuthPage.css";

export default function AuthPage({ onSuccess }) {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{isLogin ? "Welcome back" : "Create account"}</h1>
        <p>
          {isLogin
            ? "Sign in to continue to SkillSwap."
            : "Join SkillSwap to start exchanging skills."}
        </p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? "No account yet? " : "Already have an account? "}
          <button onClick={toggleMode}>
            {isLogin ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

AuthPage.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
