"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { sendJson, type ApiResult } from "@/lib/api-client";
import type { MemberRole } from "@/core/schema/share.schema";
import type { SharedPerson, Sharing } from "@/lib/schedule";

type Props = { scheduleId: number; onClose: () => void };
const ROLE_LABEL: Record<MemberRole, string> = { VIEWER: "Viewer", EDITOR: "Editor" };

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default function ShareDialog({ scheduleId, onClose }: Props) {
  const router = useRouter();
  const [sharing, setSharing] = useState<Sharing | null>(null);
  const [loadError, setLoadError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("VIEWER");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const base = `/api/schedules/${scheduleId}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`${base}/sharing`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) setSharing(data as Sharing);
        else setLoadError(data.message ?? "Couldn't load who has access.");
      })
      .catch(() => !cancelled && setLoadError("Cannot reach the server. Check your connection and try again."));
    return () => {
      cancelled = true;
    };
  }, [base]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function run(request: Promise<ApiResult>, after?: () => void) {
    setBusy(true);
    setError("");
    try {
      const result = await request;
      if (!result.ok) {
        setError(result.data.message ?? "Couldn't save that change.");
        return result;
      }
      setSharing(result.data as unknown as Sharing);
      after?.();
      router.refresh();
      return result;
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function addPerson(event: FormEvent) {
    event.preventDefault();
    setFieldError("");
    if (!identifier.trim()) return setFieldError("Enter a username or email.");
    const result = await run(sendJson("POST", `${base}/members`, { identifier, role: newRole }), () =>
      setIdentifier(""),
    );
    if (result && !result.ok && result.data.errors?.identifier) {
      setFieldError(result.data.errors.identifier);
      setError("");
    }
  }

  async function changePost(method: "POST" | "DELETE") {
    if (!sharing) return;
    if (method === "DELETE" && !confirm("Remove this plan from Discover? Your plan stays as it is.")) return;
    setBusy(true);
    setError("");
    try {
      const result = await sendJson(method, `${base}/post`);
      if (!result.ok) return setError(result.data.message ?? "Couldn't update Discover.");
      const post = method === "POST" ? (result.data as unknown as Sharing["post"]) : null;
      setSharing({ ...sharing, post });
      router.refresh();
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!sharing) return;
    const link = `${window.location.origin}${sharing.share_path}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied("Link copied");
    } catch {
      setCopied(link);
    }
  }

  const manage = sharing?.can_manage ?? false;
  const linkOpen = sharing && sharing.link_access !== "RESTRICTED";

  function personRow(person: SharedPerson | Sharing["owner"], role: MemberRole | "OWNER") {
    return (
      <li key={person.user_id} className="share-person">
        <span className="share-avatar" aria-hidden="true">{initial(person.username)}</span>
        <span className="share-person-name">
          <strong>
            {person.username}
            {person.is_you && " (you)"}
          </strong>
          {person.email && <span>{person.email}</span>}
        </span>
        {role === "OWNER" ? (
          <span className="share-role-label">Owner</span>
        ) : manage ? (
          <>
            <select
              className="select share-role"
              aria-label={`Role for ${person.username}`}
              value={role}
              disabled={busy}
              onChange={(e) =>
                run(sendJson("PATCH", `${base}/members/${person.user_id}`, { role: e.target.value }))
              }
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
            <button
              type="button"
              className="share-remove"
              aria-label={`Remove ${person.username}`}
              disabled={busy}
              onClick={() => run(sendJson("DELETE", `${base}/members/${person.user_id}`))}
            >
              ×
            </button>
          </>
        ) : (
          <span className="share-role-label">{ROLE_LABEL[role]}</span>
        )}
      </li>
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="modal-head">
          <h2 id="share-title">Share plan</h2>
          <button type="button" className="filter-close" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {!sharing ? (
          <p className={loadError ? "form-error" : "share-hint"} role={loadError ? "alert" : "status"}>
            {loadError || "Loading…"}
          </p>
        ) : (
          <>
            <section className="share-section">
              <h3>People with access</h3>
              {manage && (
                <form className="share-add" onSubmit={addPerson} noValidate>
                  <input
                    className="share-input"
                    placeholder="Add people by username or email"
                    aria-label="Username or email"
                    value={identifier}
                    aria-invalid={fieldError ? true : undefined}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setFieldError("");
                    }}
                  />
                  <select
                    className="select share-role"
                    aria-label="Role for new person"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as MemberRole)}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                  <button type="submit" className="btn-outline" disabled={busy}>Add</button>
                </form>
              )}
              {fieldError && <p className="field-error">{fieldError}</p>}
              <ul className="share-people">
                {personRow(sharing.owner, "OWNER")}
                {sharing.members.map((member) => personRow(member, member.role))}
              </ul>
            </section>

            <section className="share-section">
              <h3>General access</h3>
              <div className="share-access">
                <span className="share-globe" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    {linkOpen ? (
                      <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                      </>
                    ) : (
                      <>
                        <rect x="5" y="11" width="14" height="9" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </>
                    )}
                  </svg>
                </span>
                <div className="share-access-text">
                  {manage ? (
                    <select
                      className="select share-link-select"
                      aria-label="Who can open the link"
                      value={linkOpen ? "ANYONE" : "RESTRICTED"}
                      disabled={busy}
                      onChange={(e) =>
                        run(
                          sendJson("PUT", `${base}/link`, {
                            link_access: e.target.value === "ANYONE" ? "VIEWER" : "RESTRICTED",
                          }),
                        )
                      }
                    >
                      <option value="RESTRICTED">Only people added</option>
                      <option value="ANYONE">Anyone with the link</option>
                    </select>
                  ) : (
                    <strong>{linkOpen ? "Anyone with the link" : "Only people added"}</strong>
                  )}
                  <span>
                    {linkOpen
                      ? "Anyone who logs in with the link joins this plan."
                      : "Only people added above can open the link."}
                  </span>
                </div>
                {linkOpen &&
                  (manage ? (
                    <select
                      className="select share-role"
                      aria-label="Role for people with the link"
                      value={sharing.link_access}
                      disabled={busy}
                      onChange={(e) => run(sendJson("PUT", `${base}/link`, { link_access: e.target.value }))}
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="EDITOR">Editor</option>
                    </select>
                  ) : (
                    <span className="share-role-label">{ROLE_LABEL[sharing.link_access as MemberRole]}</span>
                  ))}
              </div>
              {manage && (
                <button
                  type="button"
                  className="share-reset"
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Make a new link? The old link will stop working.")) {
                      run(sendJson("POST", `${base}/link/reset`), () => setCopied(""));
                    }
                  }}
                >
                  Reset link
                </button>
              )}
            </section>

            <button type="button" className="btn-coral share-copy" onClick={copyLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
                <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
              </svg>
              Copy link
            </button>
            {copied && <p className="share-hint" role="status">{copied}</p>}

            {manage && (
              <section className="share-public">
                <div className="share-public-text">
                  <strong>Post to Discover</strong>
                  {sharing.post ? (
                    <span>
                      Posted {new Date(sharing.post.updated_at).toLocaleString()}. Changes you make later stay
                      private until you update the post.{" "}
                      <a href={`/discover/${sharing.post.schedule_id}`} target="_blank" rel="noopener noreferrer">
                        View post
                      </a>
                    </span>
                  ) : (
                    <span>Post a copy of this plan as it is now. Anyone can find and duplicate it.</span>
                  )}
                </div>
                <div className="share-public-actions">
                  {sharing.post && (
                    <button
                      type="button"
                      className="btn-outline danger"
                      disabled={busy}
                      onClick={() => changePost("DELETE")}
                    >
                      Remove
                    </button>
                  )}
                  <button type="button" className="btn-outline" disabled={busy} onClick={() => changePost("POST")}>
                    {sharing.post ? "Update post" : "Post"}
                  </button>
                </div>
              </section>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
