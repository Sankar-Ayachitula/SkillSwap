import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";
import Modal from "./Modal.jsx";
import "../css/SwapForm.css";

const FORMATS = ["In-Person", "Video", "Async"];

export default function SwapForm({ targetSkill, onClose, onCreated }) {
  const [mySkills, setMySkills] = useState([]);
  const [skillOfferedId, setSkillOfferedId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState("1");
  const [format, setFormat] = useState("Video");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadMySkills = async () => {
      try {
        const data = await api.get("/api/skills/my");
        setMySkills(data);
        if (data.length > 0) setSkillOfferedId(data[0]._id);
      } catch {
        setMySkills([]);
      }
    };
    loadMySkills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.post("/api/sessions", {
        responderId: targetSkill.userId,
        skillRequestedId: targetSkill._id,
        skillOfferedId,
        scheduledDate,
        duration: parseFloat(duration),
        format,
      });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal title="Propose a swap" onClose={onClose}>
      <h2>Propose a swap</h2>
      <p className="swap-form-target">
        Requesting: <strong>{targetSkill.title}</strong>
        {targetSkill.user && <> from {targetSkill.user.name}</>}
      </p>
      {error && (
        <div className="swap-form-error" role="alert">
          {error}
        </div>
      )}
      {mySkills.length === 0 ? (
        <p className="swap-form-empty">
          You need to add at least one skill before proposing a swap.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="swap-form-field">
            <label htmlFor="sw-offer">Skill you offer in return</label>
            <select
              id="sw-offer"
              value={skillOfferedId}
              onChange={(e) => setSkillOfferedId(e.target.value)}
            >
              {mySkills.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div className="swap-form-field">
            <label htmlFor="sw-date">Proposed date and time</label>
            <input
              id="sw-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div className="swap-form-field">
            <label htmlFor="sw-dur">Duration (hours)</label>
            <select
              id="sw-dur"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="0.5">0.5</option>
              <option value="1">1</option>
              <option value="1.5">1.5</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div className="swap-form-field">
            <label htmlFor="sw-fmt">Format</label>
            <select
              id="sw-fmt"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="swap-form-actions">
            <button
              type="button"
              className="swap-form-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="swap-form-btn-send"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send proposal"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

SwapForm.propTypes = {
  targetSkill: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};
