import type { ComponentPropsWithoutRef, ReactNode } from "react";

type MarqueeProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  reverse?: boolean;
  repeat?: number;
};

export function VerticalMarquee({ children, reverse = false, repeat = 3, className = "", ...props }: MarqueeProps) {
  return (
    <div {...props} className={`login-testimonial-column ${reverse ? "is-reversed" : ""} ${className}`}>
      {Array.from({ length: repeat }, (_, index) => (
        <div key={index} className="login-testimonial-set" aria-hidden={index > 0 || undefined}>{children}</div>
      ))}
    </div>
  );
}

export function TestimonialsStage({ children, label }: { children: ReactNode; label: string }) {
  return <section className="login-testimonial-stage" aria-label={label}><div className="login-testimonial-perspective">{children}</div></section>;
}
