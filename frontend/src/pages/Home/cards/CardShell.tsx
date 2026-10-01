import type { ReactNode } from "react";

interface CardShellProps {
  title: string;
  area: string; // matches an `.area-*` class in index.css
  children?: ReactNode;
}

/** Common card frame. Visual styling (radius, gradient, padding) will come from Figma. */
export default function CardShell({ title, area, children }: CardShellProps) {
  return (
    <section className={`area-${area} rounded-xl border border-white/20 p-4`}>
      <h2 className="mb-3 font-semibold">{title}</h2>
      {children}
    </section>
  );
}
