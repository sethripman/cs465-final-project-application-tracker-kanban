import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { JobApplication } from "../types";

type ApplicationsResponse = {
  applications: JobApplication[];
};

export default function BoardPage() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    void loadApplications();
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore for now
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Job Tracker Board</h1>
          <p>Logged in as {user?.email}</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <section>
        <h2>Your Applications</h2>

        {loading ? <p>Loading applications...</p> : null}
        {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

        {!loading && !error && applications.length === 0 ? (
          <p>No job applications yet.</p>
        ) : null}

        {!loading && !error && applications.length > 0 ? (
          <ul>
            {applications.map((application) => (
              <li key={application.id}>
                <strong>{application.company}</strong> — {application.roleTitle} (
                {application.status})
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}