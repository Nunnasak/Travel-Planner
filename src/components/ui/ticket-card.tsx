import Link from "next/link";
import type { ReactNode } from "react";
import CategoryTags from "@/components/ui/category-tags";
import CoverImage from "@/components/ui/cover-image";
import RouteStops from "@/components/ui/route-stops";
import { coverTintClass } from "@/lib/categories";

type Props = {
  title: string;
  subtitle?: string | null;
  coverUrl: string | null;
  categories: string[];
  days: number;
  placeCount: number;
  badges?: string[];
  href?: string;
  eager?: boolean;
  onCoverError?: () => void;
  children?: ReactNode;
  className?: string;
};

export default function TicketCard({
  title,
  subtitle,
  coverUrl,
  categories,
  days,
  placeCount,
  badges = [],
  href,
  eager = false,
  onCoverError,
  children,
  className = "",
}: Props) {
  const body = (
    <>
      <div className={`ticket-cover ${coverUrl ? "" : `cover-x ${coverTintClass(categories)}`}`}>
        {coverUrl ? (
          <CoverImage key={coverUrl} src={coverUrl} alt="" sizes="140px" eager={eager} onError={onCoverError} />
        ) : (
          <span className="cover-badge">ไม่มีรูป</span>
        )}
      </div>

      <div className="ticket-main">
        {(categories.length > 0 || badges.length > 0) && (
          <div className="ticket-labels">
            {badges.map((badge) => (
              <span key={badge} className="ticket-badge">{badge}</span>
            ))}
            <CategoryTags categories={categories} max={2} className="ticket-tags" />
          </div>
        )}
        <h3>{title}</h3>
        {subtitle && <p className="ticket-sub">{subtitle}</p>}
        <RouteStops days={days} />
      </div>

      <div className="ticket-stub">
        <strong>{days}</strong>
        <span>วัน</span>
        <span className="ticket-places">
          {placeCount} จุดแวะ
        </span>
      </div>
    </>
  );

  return (
    <div className={`ticket-frame ${className}`.trim()}>
      {href ? (
        <Link href={href} className="ticket">{body}</Link>
      ) : (
        <div className="ticket">{body}</div>
      )}
      {children}
    </div>
  );
}
