import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type {
  ApplicationStatus,
  CreateApplicationInput,
  JobApplication,
  UpdateApplicationInput,
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

type UpdateApplicationResponse = {
  application: JobApplication;
};

function toDateTimeLocalValue(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

export default function BoardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      // minimal for now
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

  async function handleUpdateApplication(
    id: string,
    values: ApplicationFormValues
  ) {
    const payload: UpdateApplicationInput = {
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

    const data = await apiFetch<UpdateApplicationResponse>(
      `/applications/${id}`,
      {
        method: "PATCH",
        body: payload,
      }
    );

    setApplications((prev) =>
      prev.map((application) =>
        application.id === id ? data.application : application
      )
    );

    setEditingId(null);
  }

  async function handleDeleteApplication(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    await apiFetch<{ message: string }>(`/applications/${id}`, {
      method: "DELETE",
    });

    setApplications((prev) =>
      prev.filter((application) => application.id !== id)
    );
  }

  async function handleQuickStatusChange(
    id: string,
    status: ApplicationStatus
  ) {
    const data = await apiFetch<UpdateApplicationResponse>(
      `/applications/${id}`,
      {
        method: "PATCH",
        body: { status },
      }
    );

    setApplications((prev) =>
      prev.map((application) =>
        application.id === id ? data.application : application
      )
    );
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
          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setEditingId(null);
            }}
          >
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
                    {items.map((application) => {
                      const isEditing = editingId === application.id;

                      return (
                        <article
                          key={application.id}
                          style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "0.75rem",
                            background: "#fff",
                          }}
                        >
                          {isEditing ? (
                            <>
                              <h3 style={{ marginTop: 0 }}>Edit Application</h3>
                              <ApplicationForm
                                submitLabel="Save Changes"
                                initialValues={{
                                  company: application.company,
                                  roleTitle: application.roleTitle,
                                  location: application.location ?? "",
                                  url: application.url ?? "",
                                  salaryRange: application.salaryRange ?? "",
                                  status: application.status,
                                  appliedDate: toDateTimeLocalValue(
                                    application.appliedDate
                                  ),
                                  notes: application.notes ?? "",
                                }}
                                onSubmit={(values) =>
                                  handleUpdateApplication(application.id, values)
                                }
                                onCancel={() => setEditingId(null)}
                              />
                            </>
                          ) : (
                            <>
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

                              {application.url ? (
                                <p style={{ margin: "0 0 0.5rem 0" }}>
                                  <strong>Link:</strong>{" "}
                                  <a
                                    href={application.url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Job Posting
                                  </a>
                                </p>
                              ) : null}

                              {application.appliedDate ? (
                                <p style={{ margin: "0 0 0.5rem 0" }}>
                                  <strong>Applied:</strong>{" "}
                                  {new Date(
                                    application.appliedDate
                                  ).toLocaleString()}
                                </p>
                              ) : null}

                              {application.notes ? (
                                <p style={{ margin: "0 0 0.75rem 0" }}>
                                  <strong>Notes:</strong> {application.notes}
                                </p>
                              ) : null}

                              <div
                                style={{
                                  display: "grid",
                                  gap: "0.5rem",
                                  marginTop: "0.75rem",
                                }}
                              >
                                <label>
                                  <span style={{ display: "block", marginBottom: "0.25rem" }}>
                                    Change Status
                                  </span>
                                  <select
                                    value={application.status}
                                    onChange={(event) =>
                                      void handleQuickStatusChange(
                                        application.id,
                                        event.target.value as ApplicationStatus
                                      )
                                    }
                                    style={{ width: "100%" }}
                                  >
                                    {APPLICATION_STATUSES.map((nextStatus) => (
                                      <option key={nextStatus} value={nextStatus}>
                                        {STATUS_LABELS[nextStatus]}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0.5rem",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingId(application.id);
                                      setShowCreateForm(false);
                                    }}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleDeleteApplication(application.id)
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </article>
                      );
                    })}
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