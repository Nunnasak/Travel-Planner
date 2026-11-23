"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { sendJson, type ApiResult } from "@/lib/api-client";
import { NETWORK_ERROR, toThai } from "@/lib/messages";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import SelectMenu, { type MenuOption } from "@/components/ui/select-menu";
import type { MemberRole } from "@/core/schema/share.schema";
import type { SharedPerson, Sharing } from "@/lib/schedule";

type Props = { scheduleId: number; emptyDays: number[]; onClose: () => void };
const LISTED_DAYS = 5;
const ROLE_LABEL: Record<MemberRole, string> = { VIEWER: "ดูได้อย่างเดียว", EDITOR: "แก้ไขได้" };

const ROLE_OPTIONS: MenuOption<MemberRole>[] = [
  { value: "VIEWER", label: "ดูได้อย่างเดียว", description: "เปิดดูแผนได้ แต่แก้ไม่ได้" },
  { value: "EDITOR", label: "แก้ไขได้", description: "แก้แผนได้เหมือนเจ้าของ" },
];

const ACCESS_OPTIONS: MenuOption<"RESTRICTED" | "ANYONE">[] = [
  { value: "RESTRICTED", label: "เฉพาะคนที่เพิ่มไว้", description: "เฉพาะคนในรายชื่อด้านบนที่เปิดลิงก์ได้" },
  { value: "ANYONE", label: "ทุกคนที่มีลิงก์", description: "ใครเข้าสู่ระบบแล้วเปิดลิงก์ จะเข้าร่วมแผนได้" },
];

type Confirming = "reset" | "remove" | null;

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function dayList(days: number[]) {
  const shown = days.slice(0, LISTED_DAYS).join(", ");
  const rest = days.length - LISTED_DAYS;
  return rest > 0 ? `${shown} และอีก ${rest} วัน` : shown;
}

export default function ShareDialog({ scheduleId, emptyDays, onClose }: Props) {
  const router = useRouter();
  const [sharing, setSharing] = useState<Sharing | null>(null);
  const [loadError, setLoadError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [newRole, setNewRole] = useState<MemberRole>("VIEWER");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [confirming, setConfirming] = useState<Confirming>(null);
  const base = `/api/schedules/${scheduleId}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`${base}/sharing`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok) setSharing(data as Sharing);
        else setLoadError(toThai(data.message) ?? "โหลดรายชื่อคนที่เข้าถึงไม่สำเร็จ");
      })
      .catch(() => !cancelled && setLoadError(NETWORK_ERROR));
    return () => {
      cancelled = true;
    };
  }, [base]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) onClose();
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
        setError(result.data.message ?? "บันทึกไม่สำเร็จ ลองอีกครั้ง");
        return result;
      }
      setSharing(result.data as unknown as Sharing);
      after?.();
      router.refresh();
      return result;
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function addPerson(event: FormEvent) {
    event.preventDefault();
    setFieldError("");
    if (!identifier.trim()) return setFieldError("ใส่ชื่อผู้ใช้หรืออีเมล");
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
    setBusy(true);
    setError("");
    try {
      const result = await sendJson(method, `${base}/post`);
      if (!result.ok) return setError(result.data.message ?? "อัปเดตโพสต์ไม่สำเร็จ ลองอีกครั้ง");
      const post = method === "POST" ? (result.data as unknown as Sharing["post"]) : null;
      setSharing({ ...sharing, post });
      router.refresh();
    } catch {
      setError(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!sharing) return;
    const link = `${window.location.origin}${sharing.share_path}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied("คัดลอกลิงก์แล้ว");
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
          <span className="share-role-label">เจ้าของ</span>
        ) : manage ? (
          <>
            <SelectMenu
              label={`สิทธิ์ของ ${person.username}`}
              value={role}
              options={ROLE_OPTIONS}
              disabled={busy}
              onChange={(next) => run(sendJson("PATCH", `${base}/members/${person.user_id}`, { role: next }))}
            />
            <button
              type="button"
              className="share-remove"
              aria-label={`เอา ${person.username} ออก`}
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
          <h2 id="share-title">แชร์แผน</h2>
          <button type="button" className="filter-close" aria-label="ปิด" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {!sharing ? (
          <p className={loadError ? "form-error" : "share-hint"} role={loadError ? "alert" : "status"}>
            {loadError || "กำลังโหลด…"}
          </p>
        ) : (
          <>
            <section className="share-section">
              <h3>คนที่เข้าถึงได้</h3>
              {manage && (
                <form className="share-add" onSubmit={addPerson} noValidate>
                  <input
                    className="share-input"
                    placeholder="เพิ่มคนด้วยชื่อผู้ใช้หรืออีเมล"
                    aria-label="ชื่อผู้ใช้หรืออีเมล"
                    value={identifier}
                    aria-invalid={fieldError ? true : undefined}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setFieldError("");
                    }}
                  />
                  <SelectMenu label="สิทธิ์ของคนที่จะเพิ่ม" value={newRole} options={ROLE_OPTIONS} onChange={setNewRole} />
                  <button type="submit" className="btn-outline" disabled={busy}>เพิ่ม</button>
                </form>
              )}
              {fieldError && <p className="field-error">{fieldError}</p>}
              <ul className="share-people">
                {personRow(sharing.owner, "OWNER")}
                {sharing.members.map((member) => personRow(member, member.role))}
              </ul>
            </section>

            <section className="share-section">
              <h3>การเข้าถึงผ่านลิงก์</h3>
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
                    <SelectMenu
                      label="ใครเปิดลิงก์ได้"
                      variant="plain"
                      value={linkOpen ? "ANYONE" : "RESTRICTED"}
                      options={ACCESS_OPTIONS}
                      disabled={busy}
                      onChange={(next) =>
                        run(sendJson("PUT", `${base}/link`, { link_access: next === "ANYONE" ? "VIEWER" : "RESTRICTED" }))
                      }
                    />
                  ) : (
                    <strong>{linkOpen ? "ทุกคนที่มีลิงก์" : "เฉพาะคนที่เพิ่มไว้"}</strong>
                  )}
                  <span>
                    {linkOpen
                      ? "ใครเข้าสู่ระบบแล้วเปิดลิงก์ จะเข้าร่วมแผนนี้ได้"
                      : "เฉพาะคนในรายชื่อด้านบนที่เปิดลิงก์ได้"}
                  </span>
                </div>
                {linkOpen &&
                  (manage ? (
                    <SelectMenu
                      label="สิทธิ์ของคนที่เปิดผ่านลิงก์"
                      value={sharing.link_access as MemberRole}
                      options={ROLE_OPTIONS}
                      disabled={busy}
                      onChange={(next) => run(sendJson("PUT", `${base}/link`, { link_access: next }))}
                    />
                  ) : (
                    <span className="share-role-label">{ROLE_LABEL[sharing.link_access as MemberRole]}</span>
                  ))}
              </div>
              {manage && (
                <button
                  type="button"
                  className="share-reset"
                  disabled={busy}
                  onClick={() => setConfirming("reset")}
                >
                  สร้างลิงก์ใหม่
                </button>
              )}
            </section>

            <button type="button" className="btn-coral share-copy" onClick={copyLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
                <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
              </svg>
              คัดลอกลิงก์
            </button>
            {copied && <p className="share-hint" role="status">{copied}</p>}

            {manage && (
              <section className="share-public">
                <div className="share-public-text">
                  <strong>โพสต์ลงหน้าสำรวจทริป</strong>
                  {sharing.post ? (
                    <span>
                      โพสต์เมื่อ {new Date(sharing.post.updated_at).toLocaleString("th-TH")} ถ้าแก้แผนหลังจากนี้
                      คนอื่นจะยังไม่เห็นจนกว่าจะอัปเดตโพสต์{" "}
                      <a href={`/discover/${sharing.post.schedule_id}`} target="_blank" rel="noopener noreferrer">
                        ดูโพสต์
                      </a>
                    </span>
                  ) : (
                    <span>โพสต์สำเนาของแผนตามที่เป็นอยู่ตอนนี้ ทุกคนค้นเจอและคัดลอกไปใช้ได้</span>
                  )}
                  {emptyDays.length > 0 && (
                    <span className="share-blocked" id="post-blocked">
                      ทุกวันต้องมีอย่างน้อย 1 สถานที่ก่อนโพสต์ ยังว่าง: วันที่ {dayList(emptyDays)}
                    </span>
                  )}
                </div>
                <div className="share-public-actions">
                  {sharing.post && (
                    <button
                      type="button"
                      className="btn-outline danger"
                      disabled={busy}
                      onClick={() => setConfirming("remove")}
                    >
                      เอาโพสต์ออก
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={busy || emptyDays.length > 0}
                    aria-describedby={emptyDays.length > 0 ? "post-blocked" : undefined}
                    onClick={() => changePost("POST")}
                  >
                    {sharing.post ? "อัปเดตโพสต์" : "โพสต์"}
                  </button>
                </div>
              </section>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
          </>
        )}
      </div>

      {confirming === "reset" && (
        <ConfirmDialog
          title="สร้างลิงก์ใหม่ไหม?"
          message="ลิงก์เดิมจะใช้ไม่ได้ คนที่เข้าร่วมแล้วยังเข้าถึงได้เหมือนเดิม"
          confirmLabel="สร้างลิงก์ใหม่"
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            await run(sendJson("POST", `${base}/link/reset`), () => setCopied(""));
            setConfirming(null);
          }}
        />
      )}
      {confirming === "remove" && (
        <ConfirmDialog
          title="เอาโพสต์ออกไหม?"
          message="โพสต์จะหายไปจากหน้าสำรวจทริป แต่แผนของคุณยังอยู่เหมือนเดิม"
          confirmLabel="เอาโพสต์ออก"
          busy={busy}
          onCancel={() => setConfirming(null)}
          onConfirm={async () => {
            await changePost("DELETE");
            setConfirming(null);
          }}
        />
      )}
    </div>
  );
}
