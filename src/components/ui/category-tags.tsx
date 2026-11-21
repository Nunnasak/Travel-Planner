import { categoryInfo } from "@/lib/categories";

type Props = { categories: string[]; max?: number; className?: string };

export default function CategoryTags({ categories, max = categories.length, className = "tag-row" }: Props) {
  const shown = categories.slice(0, max);
  const hidden = categories.length - shown.length;
  return (
    <span className={className}>
      {shown.map((key) => (
        <span key={key} className="tag-chip">{categoryInfo(key).label}</span>
      ))}
      {hidden > 0 && <span className="tag-chip">+{hidden}</span>}
    </span>
  );
}
