"use client";
import CategoryTags from "@/components/ui/category-tags";
import CoverImage from "@/components/ui/cover-image";
import { coverTintClass } from "@/lib/categories";

type Props = {
  name: string;
  description: string;
  days: number;
  categories: string[];
  coverUrl: string | null;
  onCoverError: () => void;
};

export default function PlanCardPreview({ name, description, days, categories, coverUrl, onCoverError }: Props) {
  return (
    <div className="plan-card preview-card" aria-label="Preview of the plan card">
      <div className={`plan-cover ${coverUrl ? "" : `cover-x ${coverTintClass(categories)}`}`}>
        {coverUrl ? (
          <CoverImage key={coverUrl} src={coverUrl} alt="" sizes="320px" onError={onCoverError} />
        ) : (
          <span className="cover-badge">IMG</span>
        )}
        <CategoryTags categories={categories} max={2} />
      </div>
      <div className="plan-body">
        <h3>{name.trim() || "Untitled plan"}</h3>
        <p className="plan-desc">{description.trim() || "No description yet."}</p>
        <p className="plan-meta">
          {days} {days === 1 ? "day" : "days"} · 0 places · Private
        </p>
      </div>
    </div>
  );
}
