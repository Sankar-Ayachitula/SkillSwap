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
    <div className="sessions-page">
      <h1>Sessions</h1>
      <div className="sessions-filters">
        <select
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
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          <option value="requester">Sent by me</option>
          <option value="responder">Received</option>
        </select>
      </div>
      {loading ? (
        <div className="sessions-loading">Loading sessions...</div>
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
    </div>
  );
}
