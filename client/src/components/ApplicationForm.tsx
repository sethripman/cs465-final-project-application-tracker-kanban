import { useState } from "react";
import type { ApplicationStatus } from "../types";
import { APPLICATION_STATUSES, STATUS_LABELS } from "../constants";

export type ApplicationFormValues = {
  company: string;
  roleTitle: string;
  location: string;
  url: string;
  salaryRange: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes: string;
};

type ApplicationFormProps = {
  initialValues?: Partial<ApplicationFormValues>;
  submitLabel?: string;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  onCancel?: () => void;
};

const defaultValues: ApplicationFormValues = {
  company: "",
  roleTitle: "",
  location: "",
  url: "",
  salaryRange: "",
  status: "SAVED",
  appliedDate: "",
  notes: "",
};

export default function ApplicationForm({
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: ApplicationFormProps) {
  const [values, setValues] = useState<ApplicationFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof ApplicationFormValues>(
    field: K,
    value: ApplicationFormValues[K]
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
      <label>
        Company
        <input
          type="text"
          value={values.company}
          onChange={(event) => updateField("company", event.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Role Title
        <input
          type="text"
          value={values.roleTitle}
          onChange={(event) => updateField("roleTitle", event.target.value)}
          required
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Location
        <input
          type="text"
          value={values.location}
          onChange={(event) => updateField("location", event.target.value)}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Job URL
        <input
          type="url"
          value={values.url}
          onChange={(event) => updateField("url", event.target.value)}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Salary Range
        <input
          type="text"
          value={values.salaryRange}
          onChange={(event) => updateField("salaryRange", event.target.value)}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Status
        <select
          value={values.status}
          onChange={(event) =>
            updateField("status", event.target.value as ApplicationStatus)
          }
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        >
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Applied Date
        <input
          type="datetime-local"
          value={values.appliedDate}
          onChange={(event) => updateField("appliedDate", event.target.value)}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      <label>
        Notes
        <textarea
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          rows={4}
          style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
        />
      </label>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>

        {onCancel ? (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}