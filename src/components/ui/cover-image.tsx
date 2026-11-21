import Image from "next/image";

const OPTIMIZED_HOSTS = ["images.unsplash.com"];

function canOptimize(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

type Props = { src: string; alt: string; sizes: string; priority?: boolean };

export default function CoverImage({ src, alt, sizes, priority }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!canOptimize(src)}
      className="cover-image"
    />
  );
}
