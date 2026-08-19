type BrandLogoProps = {
  src?: string;
  className?: string;
};

export function BrandLogo({ src, className }: BrandLogoProps) {
  return (
    <img
      src={src || "/default-logo.png"}
      alt="Company Logo"
      className={className}
    />
  );
}