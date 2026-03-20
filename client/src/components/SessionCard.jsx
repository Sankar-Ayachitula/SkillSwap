import { useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../utils/AuthContext.jsx";
import "../css/SessionCard.css";

function formatDate(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SessionCard({
  session,
  onAccept,
  onDecline,
  onCancel,
  onComplete,
  onDelete,
  onFeedback,
}) {
  const { user } = useContext(AuthContext);
  const userId = user?._id;
  const isRequester = session.requesterId?.toString() === userId;
  const isResponder = session.responderId?.toString() === userId;

  const statusClass = `session-status-${session.status.toLowerCase()}`;

  const canAccept =
    isResponder && session.status === "Pending" && onAccept;
  const canDecline =
    isResponder && session.status === "Pending" && onDecline;
  const canCancel =
    (session.status === "Pending" || session.status === "Accepted") &&
    onCancel;
  const canComplete =
    session.status === "Accepted" && onComplete;
  const canDelete =
    isRequester &&
    ["Pending", "Declined", "Cancelled"].includes(session.status) &&
    onDelete;

  const hasFeedback = session.feedback && Object.keys(session.feedback).length > 0;
  const myFeedbackKey = isRequester
    ? "requesterFeedback"
    : "responderFeedback";
  const canLeaveFeedback =
    session.status === "Completed" &&
    !session.feedback?.[myFeedbackKey]?.rating &&
    onFeedback;

  return (
    <div className="session-card">
      <div className="session-card-top">
        <div className="session-card-skills">
          <div className="session-card-swap">
            <strong>{session.skillRequested?.title || "Unknown skill"}</strong>
            <span className="session-card-arrow">&harr;</span>
            <strong>{session.skillOffered?.title || "Unknown skill"}</strong>
          </div>
        </div>
        <span className={`session-card-status ${statusClass}`}>
          {session.status}
        </span>
      </div>
      <div className="session-card-meta">
        <span>{formatDate(session.scheduledDate)}</span>
        <span>{session.duration}h</span>
        <span>{session.format}</span>
      </div>
      <div className="session-card-people">
        {session.requester?.name || "Unknown"} &rarr;{" "}
        {session.responder?.name || "Unknown"}
      </div>
      {(canAccept ||
        canDecline ||
        canCancel ||
        canComplete ||
        canDelete ||
        canLeaveFeedback) && (
        <div className="session-card-actions">
          {canAccept && (
            <button
              className="session-btn-accept"
              onClick={() => onAccept(session._id)}
            >
              Accept
            </button>
          )}
          {canDecline && (
            <button
              className="session-btn-decline"
              onClick={() => onDecline(session._id)}
            >
              Decline
            </button>
          )}
          {canCancel && (
            <button
              className="session-btn-cancel"
              onClick={() => onCancel(session._id)}
            >
              Cancel
            </button>
          )}
          {canComplete && (
            <button
              className="session-btn-complete"
              onClick={() => onComplete(session._id)}
            >
              Mark completed
            </button>
          )}
          {canDelete && (
            <button
              className="session-btn-delete"
              onClick={() => onDelete(session._id)}
            >
              Delete
            </button>
          )}
          {canLeaveFeedback && (
            <button
              className="session-btn-feedback"
              onClick={() => onFeedback(session)}
            >
              Leave feedback
            </button>
          )}
        </div>
      )}
      {hasFeedback && (
        <div className="session-card-feedback">
          <h4>Feedback</h4>
          {session.feedback.requesterFeedback?.rating && (
            <div className="session-feedback-item">
              <strong>{session.requester?.name}:</strong>{" "}
              {session.feedback.requesterFeedback.rating}/5
              {session.feedback.requesterFeedback.comment &&
                ` - ${session.feedback.requesterFeedback.comment}`}
            </div>
          )}
          {session.feedback.responderFeedback?.rating && (
            <div className="session-feedback-item">
              <strong>{session.responder?.name}:</strong>{" "}
              {session.feedback.responderFeedback.rating}/5
              {session.feedback.responderFeedback.comment &&
                ` - ${session.feedback.responderFeedback.comment}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SessionCard.propTypes = {
  session: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    requesterId: PropTypes.string,
    responderId: PropTypes.string,
    status: PropTypes.string.isRequired,
    scheduledDate: PropTypes.string,
    duration: PropTypes.number,
    format: PropTypes.string,
    skillRequested: PropTypes.shape({ title: PropTypes.string }),
    skillOffered: PropTypes.shape({ title: PropTypes.string }),
    requester: PropTypes.shape({ name: PropTypes.string }),
    responder: PropTypes.shape({ name: PropTypes.string }),
    feedback: PropTypes.object,
  }).isRequired,
  onAccept: PropTypes.func,
  onDecline: PropTypes.func,
  onCancel: PropTypes.func,
  onComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onFeedback: PropTypes.func,
};
