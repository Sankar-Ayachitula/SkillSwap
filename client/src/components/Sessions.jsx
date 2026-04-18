import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api.js";
import SessionCard from "./SessionCard.jsx";
import FeedbackForm from "./FeedbackForm.jsx";
import "../css/Sessions.css";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [feedbackSession, setFeedbackSession] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (roleFilter) params.set("role", roleFilter);
      const qs = params.toString();
      const data = await api.get(`/api/sessions${qs ? `?${qs}` : ""}`);
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, roleFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/api/sessions/${id}/status`, { status });
      fetchSessions();
    } catch {
      /* silent */
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/api/sessions/${id}/complete`);
      fetchSessions();
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await api.delete(`/api/sessions/${id}`);
      fetchSessions();
    } catch {
      /* silent */
    }
  };

  return (
    <section className="sessions-page" aria-labelledby="sessions-heading">
      <h1 id="sessions-heading">Sessions</h1>
      <div className="sessions-filters">
        <label htmlFor="sessions-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="sessions-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Completed">Completed</option>
          <option value="Declined">Declined</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <label htmlFor="sessions-role" className="sr-only">
          Filter by role
        </label>
        <select
          id="sessions-role"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="requester">Sent by me</option>
          <option value="responder">Received</option>
        </select>
      </div>
      {loading ? (
        <div className="sessions-loading" role="status" aria-label="Loading">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="sessions-empty">
          No sessions found. Browse skills and propose a swap to get started.
        </div>
      ) : (
        <div className="sessions-list">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              onAccept={(id) => handleStatus(id, "Accepted")}
              onDecline={(id) => handleStatus(id, "Declined")}
              onCancel={(id) => handleStatus(id, "Cancelled")}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFeedback={setFeedbackSession}
            />
          ))}
        </div>
      )}
      {feedbackSession && (
        <FeedbackForm
          session={feedbackSession}
          onClose={() => setFeedbackSession(null)}
          onSubmitted={() => {
            setFeedbackSession(null);
            fetchSessions();
          }}
        />
      )}
    </section>
  );
}
