// ไปเรื่อย map-pin logo (teal pin, white wave, yellow destination dot)
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 152" aria-hidden="true" className={className}>
      <path
        d="M 60 0 C 93 0 120 27 120 60 C 120 92 90 118 70 146 C 66 152 54 152 50 146 C 30 118 0 92 0 60 C 0 27 27 0 60 0 Z"
        fill="#19B5A5"
      />
      <path
        d="M 24 66 C 32 42 48 42 60 60 C 72 78 88 78 96 54"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="96" cy="54" r="9" fill="#FFC93C" />
    </svg>
  );
}