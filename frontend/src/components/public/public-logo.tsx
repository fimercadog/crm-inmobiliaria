import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils";

type PublicLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  inverted?: boolean;
};

function LogoMark({ className, inverted = false }: Pick<PublicLogoProps, "className" | "inverted">) {
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={cn("size-11 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="96" height="96" rx="26" fill={inverted ? "white" : "#101820"} />
      <path
        d="M24 43L48 24L72 43"
        stroke="#A7E8D1"
        strokeWidth="6.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M33 70V45H52.5C62.65 45 68.5 50.1 68.5 57.2C68.5 64.5 62.75 70 52.5 70H33Z" fill={inverted ? "#101820" : "white"} />
      <path d="M45 61.7H52.9C56.85 61.7 59.2 59.95 59.2 57.2C59.2 54.5 56.85 52.8 52.9 52.8H45V61.7Z" fill={inverted ? "white" : "#101820"} />
      <path d="M33 70H45V52.8H33V70Z" fill="#A7E8D1" />
    </svg>
  );
}

export function PublicLogo({ className, markClassName, textClassName, inverted = false }: PublicLogoProps) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-3", className)} aria-label={`${SITE_CONFIG.name} inicio`}>
      <LogoMark className={markClassName} inverted={inverted} />
      <span className={cn("flex flex-col leading-none", textClassName)}>
        <span className="font-(family-name:--font-display) text-xl font-semibold tracking-tight">{SITE_CONFIG.name}</span>
        <span className={cn("mt-1 text-[0.58rem] font-extrabold tracking-[0.32em] uppercase", inverted ? "text-white/45" : "text-(--realty-blue)")}>
          Real Estate
        </span>
      </span>
    </Link>
  );
}
