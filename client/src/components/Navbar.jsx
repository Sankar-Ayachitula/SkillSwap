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
    <nav className="navbar">
      <div
        className="navbar-brand"
        role="button"
        tabIndex={0}
        onClick={() => onNavigate("browse")}
        onKeyDown={(e) => e.key === "Enter" && onNavigate("browse")}
      >
        Skill<span>Swap</span>
      </div>
      <div className="navbar-links">
        <button
          className={currentPage === "browse" ? "active" : ""}
          onClick={() => onNavigate("browse")}
        >
          Browse
        </button>
        <button
          className={currentPage === "my-skills" ? "active" : ""}
          onClick={() => onNavigate("my-skills")}
        >
          My Skills
        </button>
        <button
          className={currentPage === "sessions" ? "active" : ""}
          onClick={() => onNavigate("sessions")}
        >
          Sessions
        </button>
        <button
          className={currentPage === "profile" ? "active" : ""}
          onClick={() => onNavigate("profile")}
        >
          Profile
        </button>
      </div>
      <div className="navbar-user">
        <span className="navbar-user-name">{user.name}</span>
        <button className="navbar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  currentPage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
