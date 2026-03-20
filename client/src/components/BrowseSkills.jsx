import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";
import { AuthContext } from "../utils/AuthContext.jsx";
import SkillCard from "./SkillCard.jsx";
import SwapForm from "./SwapForm.jsx";
import "../css/BrowseSkills.css";

const CATEGORIES = [
  "",
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

export default function BrowseSkills({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [swapTarget, setSwapTarget] = useState(null);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const qs = params.toString();
      const data = await api.get(`/api/skills${qs ? `?${qs}` : ""}`);
      setSkills(data);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(fetchSkills, 300);
    return () => clearTimeout(timer);
  }, [fetchSkills]);

  const otherSkills = skills.filter(
    (s) => s.userId?.toString() !== user?._id?.toString()
  );

  return (
    <div className="browse-page">
      <h1>Browse skills</h1>
      <div className="browse-filters">
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.filter(Boolean).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="browse-loading">Loading skills...</div>
      ) : otherSkills.length === 0 ? (
        <div className="browse-empty">
          No skills found. Try adjusting your filters.
        </div>
      ) : (
        <div className="browse-grid">
          {otherSkills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              showUser={true}
              onSwap={setSwapTarget}
            />
          ))}
        </div>
      )}
      {swapTarget && (
        <SwapForm
          targetSkill={swapTarget}
          onClose={() => setSwapTarget(null)}
          onCreated={() => {
            setSwapTarget(null);
            onNavigate("sessions");
          }}
        />
      )}
    </div>
  );
}

BrowseSkills.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
