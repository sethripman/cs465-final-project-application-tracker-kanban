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
    <form className="app-form" onSubmit={handleSubmit}>
      <label>
        Company
        <input
          type="text"
          value={values.company}
          onChange={(event) => updateField("company", event.target.value)}
          required
        />
      </label>

      <label>
        Role Title
        <input
          type="text"
          value={values.roleTitle}
          onChange={(event) => updateField("roleTitle", event.target.value)}
          required
        />
      </label>

      <label>
        Location
        <input
          type="text"
          value={values.location}
          onChange={(event) => updateField("location", event.target.value)}
        />
      </label>

      <label>
        Job URL
        <input
          type="url"
          value={values.url}
          onChange={(event) => updateField("url", event.target.value)}
        />
      </label>

      <label>
        Salary Range
        <input
          type="text"
          value={values.salaryRange}
          onChange={(event) => updateField("salaryRange", event.target.value)}
        />
      </label>

      <label>
        Status
        <select
          value={values.status}
          onChange={(event) =>
            updateField("status", event.target.value as ApplicationStatus)
          }
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
        />
      </label>

      <label>
        Notes
        <textarea
          value={values.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          rows={4}
        />
      </label>

      {error ? <p className="text-error">{error}</p> : null}

      <div className="app-form-actions">
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