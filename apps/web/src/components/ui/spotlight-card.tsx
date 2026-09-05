import { useRef, type PointerEvent, type ReactNode } from "react";

type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  as?: "article" | "section";
};

export function SpotlightCard({ children, className = "", as: Element = "article" }: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  function moveSpotlight(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
  }

  return <Element ref={ref as never} onPointerMove={moveSpotlight} className={`dashboard-spotlight ${className}`}>{children}</Element>;
}
