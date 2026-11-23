import Image from "next/image";
import { UPLOAD_PATH } from "@/core/schema/image.schema";

const OPTIMIZED_HOSTS = ["images.unsplash.com"];

function canOptimize(src: string) {
  if (src.startsWith(UPLOAD_PATH)) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

type Props = { src: string; alt: string; sizes: string; eager?: boolean; onError?: () => void };

export default function CoverImage({ src, alt, sizes, eager, onError }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      unoptimized={!canOptimize(src)}
      draggable={false}
      onError={onError}
      className="cover-image"
    />
  );
}
