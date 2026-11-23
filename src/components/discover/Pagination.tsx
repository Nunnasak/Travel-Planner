import Link from "next/link";

export default function Pagination({
  page, totalPages, params,
}: { page: number; totalPages: number; params: URLSearchParams }) {
  if (totalPages <= 1) return null;

  const href = (n: number) => {
    const p = new URLSearchParams(params);
    p.set("page", String(n));
    return `/discover?${p}`;
  };
  const step = (to: number, label: string, text: string, disabled: boolean) =>
    disabled
      ? <span key={label} className="pg pg-disabled" aria-hidden>{text}</span>
      : <Link key={label} href={href(to)} className="pg" aria-label={label}>{text}</Link>;

  const count = Math.min(4, totalPages);
  const start = Math.max(1, Math.min(page - 1, totalPages - count + 1));

  return (
    <nav className="pagination" aria-label="เปลี่ยนหน้า">
      {step(1, "หน้าแรก", "«", page === 1)}
      {step(page - 1, "หน้าก่อนหน้า", "<", page === 1)}
      {Array.from({ length: count }, (_, i) => start + i).map((n) => (
        <Link key={n} href={href(n)} className="pg" aria-current={n === page ? "page" : undefined}>{n}</Link>
      ))}
      {step(page + 1, "หน้าถัดไป", ">", page === totalPages)}
      {step(totalPages, "หน้าสุดท้าย", "»", page === totalPages)}
    </nav>
  );
}