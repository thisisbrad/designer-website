import AnimatedText from "./AnimatedText";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  id?: string;
  description?: string;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  id,
  description,
  className,
}: Props) {
  return (
    <div className={cn("mb-14 md:mb-20", className)}>
      <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-muted uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-accent" />
        {eyebrow}
      </p>
      <AnimatedText
        as="h2"
        id={id}
        className="font-display text-4xl font-medium tracking-tight text-balance md:text-6xl"
      >
        {title}
      </AnimatedText>
      {description && (
        <p className="mt-6 max-w-xl text-base text-muted md:text-lg">{description}</p>
      )}
    </div>
  );
}
