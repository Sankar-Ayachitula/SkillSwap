import PropTypes from "prop-types";
import "../css/SkillCard.css";

export default function SkillCard({
  skill,
  showUser,
  onEdit,
  onDelete,
  onSwap,
}) {
  return (
    <article className="skill-card" aria-label={skill.title}>
      <div className="skill-card-header">
        <h3 className="skill-card-title">{skill.title}</h3>
        <span className="skill-card-category">{skill.category}</span>
      </div>
      {skill.description && (
        <p className="skill-card-desc">{skill.description}</p>
      )}
      <div className="skill-card-meta">
        <span className="skill-card-tag">{skill.experienceLevel}</span>
        <span className="skill-card-tag">{skill.format}</span>
        {skill.availability && (
          <span className="skill-card-tag">{skill.availability}</span>
        )}
      </div>
      {showUser && skill.user && (
        <div className="skill-card-footer">
          <span className="skill-card-user">
            <strong>{skill.user.name}</strong>
          </span>
          {skill.user.overallRating > 0 && (
            <span
              className="skill-card-rating"
              aria-label={`Rating: ${skill.user.overallRating.toFixed(1)} out of 5`}
            >
              {skill.user.overallRating.toFixed(1)} / 5
            </span>
          )}
        </div>
      )}
      {(onEdit || onDelete) && (
        <div className="skill-card-actions">
          {onEdit && (
            <button
              className="skill-card-btn-edit"
              onClick={() => onEdit(skill)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="skill-card-btn-delete"
              onClick={() => onDelete(skill._id)}
            >
              Delete
            </button>
          )}
        </div>
      )}
      {onSwap && (
        <div className="skill-card-actions">
          <button className="skill-card-btn-swap" onClick={() => onSwap(skill)}>
            Propose swap
          </button>
        </div>
      )}
    </article>
  );
}

SkillCard.propTypes = {
  skill: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    experienceLevel: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
    availability: PropTypes.string,
    user: PropTypes.shape({
      name: PropTypes.string,
      overallRating: PropTypes.number,
    }),
  }).isRequired,
  showUser: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSwap: PropTypes.func,
};
