import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../utils/api.js";
import Modal from "./Modal.jsx";
import "../css/FeedbackForm.css";

function StarIcon({ filled }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27 5.06 16.7 6 11.21l-4-3.9 5.53-.8L10 1.5z" />
    </svg>
  );
}

StarIcon.propTypes = {
  filled: PropTypes.bool.isRequired,
};

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
    <Modal title="Leave feedback" onClose={onClose}>
      <h2>Leave feedback</h2>
      {error && (
        <div className="feedback-error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="feedback-field">
          <legend className="feedback-label">Rating</legend>
          <div className="feedback-stars" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`feedback-star ${n <= rating ? "active" : ""}`}
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} out of 5`}
                aria-pressed={n <= rating}
              >
                <StarIcon filled={n <= rating} />
              </button>
            ))}
          </div>
        </fieldset>
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
    </Modal>
  );
}

FeedbackForm.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitted: PropTypes.func.isRequired,
};
