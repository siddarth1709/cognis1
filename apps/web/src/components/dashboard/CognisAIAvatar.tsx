import { SparklesIcon } from "@/components/ui/Icons";

interface CognisAIAvatarProps {
  size?: "sm" | "md";
  interactive?: boolean;
  label?: string;
  variant?: "mark" | "companion";
}

/** A small, product-native mark for the Cognis reasoning surface. */
export function CognisAIAvatar({
  size = "md",
  interactive = false,
  label = "Cognis AI",
  variant = "mark",
}: CognisAIAvatarProps) {
  if (variant === "companion") {
    return (
      <span
        className={`cognis-ai-companion${interactive ? " cognis-ai-companion--interactive" : ""}`}
        aria-label={label}
        role="img"
      >
        <span className="cognis-ai-companion__head"><span className="cognis-ai-companion__visor">&gt;_</span></span>
        <span className="cognis-ai-companion__body" />
        <span className="cognis-ai-companion__terminal" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`cognis-ai-avatar cognis-ai-avatar--${size}${interactive ? " cognis-ai-avatar--interactive" : ""}`}
      aria-label={label}
      role="img"
    >
      <span className="cognis-ai-avatar__core"><SparklesIcon size={size === "sm" ? 12 : 14} /></span>
    </span>
  );
}
