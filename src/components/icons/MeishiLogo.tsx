import Image from "next/image";

type Props = {
  size?: number;
  className?: string;
};

export function MeishiLogo({ size = 40, className = "" }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        alt="MeishiLink"
        height={size}
        src="/brand/logo-master.png"
        width={size}
        unoptimized
      />
    </span>
  );
}
