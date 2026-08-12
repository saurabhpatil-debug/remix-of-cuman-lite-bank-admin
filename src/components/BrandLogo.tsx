import logoAsset from "@/assets/logo.png.asset.json";

export function BrandLogo({
  className = "h-8",
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <img
      src={logoAsset.url}
      alt="CUMAN LITE"
      className={`${className} w-auto rounded-md object-contain ${showWordmark ? "" : "aspect-square"}`}
    />
  );
}
