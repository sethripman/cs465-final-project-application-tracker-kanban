import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type {
  ApplicationStatus,
  CreateApplicationInput,
  JobApplication,
} from "../types";
import { APPLICATION_STATUSES, STATUS_LABELS } from "../constants";
import ApplicationForm, {
  type ApplicationFormValues,
} from "../components/ApplicationForm";

type ApplicationsResponse = {
  applications: JobApplication[];
};

type CreateApplicationResponse = {
  application: JobApplication;
};

export default function BoardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function loadApplications() {
    try {
      setError("");
      const data = await apiFetch<ApplicationsResponse>("/applications");
      setApplications(data.applications);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  const groupedApplications = useMemo(() => {
    const groups: Record<ApplicationStatus, JobApplication[]> = {
      SAVED: [],
      APPLIED: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
    };

    for (const application of applications) {
      groups[application.status].push(application);
    }

    return groups;
  }, [applications]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch {
      // keep minimal for now
    }
  }

  async function handleCreateApplication(values: ApplicationFormValues) {
    const payload: CreateApplicationInput = {
      company: values.company,
      roleTitle: values.roleTitle,
      location: values.location || "",
      url: values.url || "",
      salaryRange: values.salaryRange || "",
      status: values.status,
      appliedDate: values.appliedDate
        ? new Date(values.appliedDate).toISOString()
        : "",
      notes: values.notes || "",
    };

    const data = await apiFetch<CreateApplicationResponse>("/applications", {
      method: "POST",
      body: payload,
    });

    setApplications((prev) => [...prev, data.application]);
    setShowCreateForm(false);
  }

  return (
    <main style={{ padding: "1.5rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Job Tracker Board</h1>
          <p style={{ marginTop: "0.5rem" }}>Logged in as {user?.email}</p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? "Close Form" : "Add Application"}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showCreateForm ? (
        <section
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h2>Create Application</h2>
          <ApplicationForm
            submitLabel="Create Application"
            onSubmit={handleCreateApplication}
            onCancel={() => setShowCreateForm(false)}
          />
        </section>
      ) : null}

      {loading ? <p>Loading applications...</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {!loading && !error ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          {APPLICATION_STATUSES.map((status) => {
            const items = groupedApplications[status];

            return (
              <div
                key={status}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "#f8f8f8",
                  minHeight: "250px",
                }}
              >
                <h2 style={{ marginTop: 0 }}>
                  {STATUS_LABELS[status]} ({items.length})
                </h2>

                {items.length === 0 ? (
                  <p style={{ color: "#666" }}>No applications</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    {items.map((application) => (
                      <article
                        key={application.id}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "0.75rem",
                          background: "#fff",
                        }}
                      >
                        <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
                          {application.company}
                        </h3>
                        <p style={{ margin: "0 0 0.5rem 0" }}>
                          <strong>Role:</strong> {application.roleTitle}
                        </p>

                        {application.location ? (
                          <p style={{ margin: "0 0 0.5rem 0" }}>
                            <strong>Location:</strong> {application.location}
                          </p>
                        ) : null}

                        {application.salaryRange ? (
                          <p style={{ margin: "0 0 0.5rem 0" }}>
                            <strong>Salary:</strong> {application.salaryRange}
                          </p>
                        ) : null}

                        {application.notes ? (
                          <p style={{ margin: 0 }}>
                            <strong>Notes:</strong> {application.notes}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}