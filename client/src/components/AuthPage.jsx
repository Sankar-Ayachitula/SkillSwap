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
    <section className="auth-page" aria-label="Authentication">
      <div className="auth-hero">
        <h1 className="auth-brand">
          Skill<span>Swap</span>
        </h1>
        <p className="auth-tagline">
          Teach what you know. Learn what you need.
        </p>
        <p className="auth-description">
          A peer-to-peer skill exchange platform for students. Post a skill you
          can teach, browse what others offer, propose a swap, and meet up.
        </p>
        <ul className="auth-features">
          <li>Exchange skills instead of paying for lessons</li>
          <li>Find students with complementary expertise</li>
          <li>Schedule sessions and track your hours</li>
          <li>Rate and review your swap partners</li>
        </ul>
      </div>
      <div className="auth-card">
        <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
        <p>
          {isLogin
            ? "Sign in to continue to SkillSwap."
            : "Join SkillSwap to start exchanging skills."}
        </p>
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} noValidate>
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
                aria-required="true"
                autoComplete="name"
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
              aria-required="true"
              autoComplete="email"
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
              aria-required="true"
              autoComplete={isLogin ? "current-password" : "new-password"}
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
          <button type="button" onClick={toggleMode}>
            {isLogin ? "Register" : "Sign in"}
          </button>
        </div>
      </div>
    </section>
  );
}

AuthPage.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
