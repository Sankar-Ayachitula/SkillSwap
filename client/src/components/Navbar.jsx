import { useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../utils/AuthContext.jsx";
import "../css/Navbar.css";

export default function Navbar({ currentPage, onNavigate }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    onNavigate("login");
  };

  if (!user) return null;

  return (
    <header className="navbar" role="banner">
      <button
        className="navbar-brand"
        onClick={() => onNavigate("browse")}
        aria-label="SkillSwap home"
      >
        Skill<span>Swap</span>
      </button>
      <nav className="navbar-links" aria-label="Main navigation">
        <button
          className={currentPage === "browse" ? "active" : ""}
          onClick={() => onNavigate("browse")}
          aria-current={currentPage === "browse" ? "page" : undefined}
        >
          Browse
        </button>
        <button
          className={currentPage === "my-skills" ? "active" : ""}
          onClick={() => onNavigate("my-skills")}
          aria-current={currentPage === "my-skills" ? "page" : undefined}
        >
          My Skills
        </button>
        <button
          className={currentPage === "sessions" ? "active" : ""}
          onClick={() => onNavigate("sessions")}
          aria-current={currentPage === "sessions" ? "page" : undefined}
        >
          Sessions
        </button>
        <button
          className={currentPage === "profile" ? "active" : ""}
          onClick={() => onNavigate("profile")}
          aria-current={currentPage === "profile" ? "page" : undefined}
        >
          Profile
        </button>
      </nav>
      <div className="navbar-user">
        <span className="navbar-user-name">{user.name}</span>
        <button
          className="navbar-logout"
          onClick={handleLogout}
          aria-label="Log out"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
