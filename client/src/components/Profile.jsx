import { useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../utils/AuthContext.jsx";
import { api } from "../utils/api.js";
import "../css/Profile.css";

export default function Profile({ onNavigate }) {
  const { user, updateProfile, deleteAccount } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.get("/api/sessions/stats");
        setStats(data);
      } catch {
        /* silent */
      }
    };
    loadStats();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);
    try {
      await updateProfile({ name, bio });
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      )
    )
      return;
    try {
      await deleteAccount();
      onNavigate("login");
    } catch {
      setMessage({ type: "error", text: "Failed to delete account." });
    }
  };

  if (!user) return null;

  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <h1 id="profile-heading">Profile</h1>
      <div className="profile-stats" role="region" aria-label="Your statistics">
        <div className="profile-stat">
          <div className="profile-stat-value">
            {user.overallRating > 0 ? user.overallRating.toFixed(1) : "--"}
          </div>
          <div className="profile-stat-label">Rating</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">{user.hoursTeaught || 0}</div>
          <div className="profile-stat-label">Hours taught</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-value">{user.hoursReceived || 0}</div>
          <div className="profile-stat-label">Hours received</div>
        </div>
        {stats && (
          <div className="profile-stat">
            <div className="profile-stat-value">
              {stats.completedSessions || 0}
            </div>
            <div className="profile-stat-label">Completed</div>
          </div>
        )}
      </div>
      <div className="profile-card">
        <div aria-live="polite" aria-atomic="true">
          {message.text && (
            <div
              className={`profile-message profile-message-${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              {message.text}
            </div>
          )}
        </div>
        <form onSubmit={handleSave} noValidate>
          <div className="profile-form-field">
            <label htmlFor="prof-email">Email</label>
            <input
              id="prof-email"
              type="email"
              value={user.email}
              disabled
              aria-describedby="email-note"
            />
            <span id="email-note" className="sr-only">
              Email cannot be changed
            </span>
          </div>
          <div className="profile-form-field">
            <label htmlFor="prof-name">Name</label>
            <input
              id="prof-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
            />
          </div>
          <div className="profile-form-field">
            <label htmlFor="prof-bio">Bio</label>
            <textarea
              id="prof-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
            />
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="profile-btn-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="profile-btn-delete"
              onClick={handleDelete}
            >
              Delete account
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

Profile.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
