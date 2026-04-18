import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";
import SkillCard from "./SkillCard.jsx";
import SkillForm from "./SkillForm.jsx";
import "../css/MySkills.css";

export default function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSkill, setEditSkill] = useState(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/skills/my");
      setSkills(data);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await api.delete(`/api/skills/${id}`);
      fetchSkills();
    } catch {
      /* silent */
    }
  };

  const handleEdit = (skill) => {
    setEditSkill(skill);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditSkill(null);
    fetchSkills();
  };

  const handleClose = () => {
    setShowForm(false);
    setEditSkill(null);
  };

  return (
    <section className="my-skills-page" aria-labelledby="my-skills-heading">
      <div className="my-skills-header">
        <h1 id="my-skills-heading">My skills</h1>
        <button className="my-skills-add-btn" onClick={() => setShowForm(true)}>
          + Add skill
        </button>
      </div>
      {loading ? (
        <div className="my-skills-empty" role="status" aria-label="Loading">
          Loading...
        </div>
      ) : skills.length === 0 ? (
        <div className="my-skills-empty">
          You have not added any skills yet. Click &quot;+ Add skill&quot; above
          to share what you can teach and start exchanging with others.
        </div>
      ) : (
        <div className="my-skills-grid">
          {skills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              showUser={false}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {showForm && (
        <SkillForm
          skill={editSkill}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
