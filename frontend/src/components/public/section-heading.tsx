import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
      {eyebrow && <span className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</span>}
      <h2 className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description && <p className={cn("max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>{description}</p>}
    </div>
  );
}
