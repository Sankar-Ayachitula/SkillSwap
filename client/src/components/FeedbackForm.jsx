import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";
import "../css/FeedbackForm.css";

export default function FeedbackForm({ session, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.put(`/api/sessions/${session._id}/feedback`, {
        rating,
        comment,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-form" onClick={(e) => e.stopPropagation()}>
        <h2>Leave feedback</h2>
        {error && <div className="feedback-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="feedback-field">
            <label>Rating</label>
            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`feedback-star ${n <= rating ? "active" : ""}`}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                >
                  *
                </button>
              ))}
            </div>
          </div>
          <div className="feedback-field">
            <label htmlFor="fb-comment">Comment (optional)</label>
            <textarea
              id="fb-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the session?"
            />
          </div>
          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="feedback-btn-submit"
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

FeedbackForm.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func.isRequired,
};
