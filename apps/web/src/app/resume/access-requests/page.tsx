"use client";

import { useEffect, useState } from "react";
import {
  getOwnerAccessAuditLogs,
  getOwnerAccessRequests,
  ResumeAccessAuditLog,
  ResumeAccessRequest,
  reviewOwnerAccessRequest,
} from "@/lib/api";

const requestStatusClass: Record<ResumeAccessRequest["requestStatus"], string> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  revoked: "revoked",
  expired: "neutral",
};

const auditActionClass: Record<ResumeAccessAuditLog["action"], string> = {
  request: "pending",
  approve: "approved",
  reject: "rejected",
  revoke: "revoked",
  view: "info",
  export: "info",
  blocked: "rejected",
};

export default function ResumeAccessRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<"" | ResumeAccessRequest["requestStatus"]>("");
  const [requestSort, setRequestSort] = useState<"newest" | "oldest">("newest");
  const [auditActionFilter, setAuditActionFilter] = useState<"" | ResumeAccessAuditLog["action"]>("");
  const [auditSort, setAuditSort] = useState<"newest" | "oldest">("newest");
  const [requests, setRequests] = useState<ResumeAccessRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<ResumeAccessAuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setError(null);

    try {
      const [requestData, auditData] = await Promise.all([
        getOwnerAccessRequests(statusFilter || undefined),
        getOwnerAccessAuditLogs(),
      ]);
      setRequests(requestData);
      setAuditLogs(auditData);
    } catch {
      setError("Failed to load access request workflow data.");
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const review = async (requestId: string, decision: "approve" | "reject") => {
    const result = await reviewOwnerAccessRequest(requestId, {
      decision,
      note: decision === "approve" ? "Approved by resume owner" : "Rejected by resume owner",
    });

    if (!result.ok) {
      setError(result.message ?? "Unable to process review");
      return;
    }

    setMessage(`Request ${decision}d successfully.`);
    setError(null);
    await load();
  };

  const visibleRequests = [...requests].sort((a, b) => {
    const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return requestSort === "newest" ? -diff : diff;
  });

  const visibleAuditLogs = [...auditLogs]
    .filter((item) => (auditActionFilter ? item.action === auditActionFilter : true))
    .sort((a, b) => {
      const diff = new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime();
      return auditSort === "newest" ? -diff : diff;
    });

  return (
    <section className="stack gap-xl">
      <div>
        <p className="eyebrow">Governance</p>
        <h2 className="section-title">Resume Access Workflow</h2>
        <p className="subtle">Approve or reject recruiter access requests and inspect audit logs.</p>
      </div>

      {error ? <article className="card error-text">{error}</article> : null}
      {message ? <article className="card success-text">{message}</article> : null}

      <article className="card stack gap-sm">
        <h3>Access Requests</h3>
        <div className="inline-list">
          <select
            className="input"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "" | ResumeAccessRequest["requestStatus"])}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
          <select className="input" value={requestSort} onChange={(event) => setRequestSort(event.target.value as "newest" | "oldest")}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="legend-row">
          <span className="status-badge pending">pending</span>
          <span className="status-badge approved">approved</span>
          <span className="status-badge rejected">rejected</span>
          <span className="status-badge revoked">revoked</span>
          <span className="status-badge neutral">expired</span>
        </div>

        {visibleRequests.length === 0 ? (
          <div className="empty-state">
            <p className="subtle">No access requests yet. Recruiters will appear here after submitting requests.</p>
          </div>
        ) : null}
        {visibleRequests.map((request) => (
          <div key={request.accessRequestId} className="card stack gap-sm">
            <div className="inline-list">
              <h4>{request.resumeVersionName}</h4>
              <span className={`status-badge ${requestStatusClass[request.requestStatus]}`}>{request.requestStatus}</span>
              <span className="status-badge neutral">{request.requestedVisibility}</span>
            </div>
            <p className="subtle">
              Recruiter: {request.recruiterName} ({request.recruiterEmail}) · {request.companyName}
            </p>
            <p className="subtle">Role: {request.positionTitle ?? "Not specified"}</p>
            <p>{request.purpose}</p>
            {request.requestStatus === "pending" ? (
              <div className="inline-list">
                <button className="btn-primary" type="button" onClick={() => void review(request.accessRequestId, "approve")}>
                  Approve
                </button>
                <button className="btn-secondary" type="button" onClick={() => void review(request.accessRequestId, "reject")}>
                  Reject
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </article>

      <article className="card stack gap-sm">
        <h3>Audit Trail</h3>
        <div className="inline-list">
          <select
            className="input"
            value={auditActionFilter}
            onChange={(event) => setAuditActionFilter(event.target.value as "" | ResumeAccessAuditLog["action"])}
          >
            <option value="">All actions</option>
            <option value="request">request</option>
            <option value="approve">approve</option>
            <option value="reject">reject</option>
            <option value="revoke">revoke</option>
            <option value="view">view</option>
            <option value="export">export</option>
            <option value="blocked">blocked</option>
          </select>
          <select className="input" value={auditSort} onChange={(event) => setAuditSort(event.target.value as "newest" | "oldest")}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="legend-row">
          <span className="status-badge info">view/export</span>
          <span className="status-badge pending">request</span>
          <span className="status-badge approved">approve</span>
          <span className="status-badge rejected">reject/blocked</span>
          <span className="status-badge revoked">revoke</span>
        </div>

        {visibleAuditLogs.length === 0 ? (
          <div className="empty-state">
            <p className="subtle">No audit activity yet. Actions like request/approve/reject will be tracked here.</p>
          </div>
        ) : null}
        {visibleAuditLogs.map((log) => (
          <div key={log.auditId} className="card stack gap-sm">
            <div className="inline-list">
              <h4>{log.resumeVersionName}</h4>
              <span className={`status-badge ${auditActionClass[log.action]}`}>{log.action}</span>
              <span className="status-badge neutral">{new Date(log.eventTime).toLocaleString()}</span>
            </div>
            <p className="subtle">Recruiter: {log.recruiterEmail ?? "N/A"}</p>
            {log.metadata ? <pre>{JSON.stringify(log.metadata, null, 2)}</pre> : null}
          </div>
        ))}
      </article>
    </section>
  );
}
