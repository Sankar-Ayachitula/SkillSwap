import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";
import Modal from "./Modal.jsx";
import "../css/SkillForm.css";

const CATEGORIES = [
  "Programming",
  "Music",
  "Languages",
  "Art & Design",
  "Cooking",
  "Fitness",
  "Photography",
  "Writing",
  "Math & Science",
  "Business",
  "Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const FORMATS = ["In-Person", "Video", "Async"];

export default function SkillForm({ skill, onClose, onSaved }) {
  const isEdit = Boolean(skill);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [format, setFormat] = useState("Video");
  const [availability, setAvailability] = useState("Flexible");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (skill) {
      setTitle(skill.title || "");
      setDescription(skill.description || "");
      setCategory(skill.category || "Programming");
      setExperienceLevel(skill.experienceLevel || "Beginner");
      setFormat(skill.format || "Video");
      setAvailability(skill.availability || "Flexible");
    }
  }, [skill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const body = {
        title,
        description,
        category,
        experienceLevel,
        format,
        availability,
      };
      if (isEdit) {
        await api.put(`/api/skills/${skill._id}`, body);
      } else {
        await api.post("/api/skills", body);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit skill" : "Add a skill"} onClose={onClose}>
      <h2>{isEdit ? "Edit skill" : "Add a skill"}</h2>
      {error && (
        <div className="skill-form-error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="skill-form-field">
          <label htmlFor="sf-title">Title</label>
          <input
            id="sf-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Development"
            required
            aria-required="true"
          />
        </div>
        <div className="skill-form-field">
          <label htmlFor="sf-desc">Description</label>
          <textarea
            id="sf-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what you can teach"
          />
        </div>
        <div className="skill-form-field">
          <label htmlFor="sf-cat">Category</label>
          <select
            id="sf-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="skill-form-field">
          <label htmlFor="sf-level">Experience level</label>
          <select
            id="sf-level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="skill-form-field">
          <label htmlFor="sf-format">Format</label>
          <select
            id="sf-format"
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
        <div className="skill-form-field">
          <label htmlFor="sf-avail">Availability</label>
          <input
            id="sf-avail"
            type="text"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Weekday evenings"
          />
        </div>
        <div className="skill-form-actions">
          <button
            type="button"
            className="skill-form-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="skill-form-btn-save"
            disabled={saving}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add skill"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

SkillForm.propTypes = {
  skill: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.string,
    experienceLevel: PropTypes.string,
    format: PropTypes.string,
    availability: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
