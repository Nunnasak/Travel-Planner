"use client";
import TicketCard from "@/components/ui/ticket-card";

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
    <div className="preview-card" aria-label="ตัวอย่างการ์ดแผน">
      <TicketCard
        title={name.trim() || "แผนที่ยังไม่มีชื่อ"}
        subtitle={description.trim() || "ยังไม่มีคำอธิบาย"}
        coverUrl={coverUrl}
        categories={categories}
        days={days}
        placeCount={0}
        badges={["ส่วนตัว"]}
        onCoverError={onCoverError}
      />
    </div>
  );
}
