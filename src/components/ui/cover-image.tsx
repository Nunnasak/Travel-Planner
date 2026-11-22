import Image from "next/image";

const OPTIMIZED_HOSTS = ["images.unsplash.com"];

export const CARD_IMAGE_SIZES =
  "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1500px) 33vw, 25vw";

function canOptimize(src: string) {
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
