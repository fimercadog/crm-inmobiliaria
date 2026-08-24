import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  level?: 1 | 2;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", level = 2, className }: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
      {eyebrow && <span className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</span>}
      <Heading className="font-(family-name:--font-display) text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {description && <p className={cn("max-w-2xl text-muted-foreground", align === "center" && "mx-auto")}>{description}</p>}
    </div>
  );
}
