import type { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  icon: ReactNode;
  /** Right side of the header (e.g. the Edit Profile button). */
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Common frame of the Settings cards: white, radius 20.75, header row (64px) with a grey icon square,
 * a title and a divider. Unlike the Home cards these are plain CSS boxes (they stretch to the content width).
 */
export default function SettingsCard({ title, icon, action, children }: SettingsCardProps) {
  return (
    <section className="rounded-[20.746px] bg-white shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <header className="flex h-[64px] items-center justify-between border-b border-muted/20 pl-[32px] pr-[24px]">
        <div className="flex items-center gap-[17px]">
          <span className="flex size-[33px] shrink-0 items-center justify-center rounded-[6px] bg-muted/20 text-ink">
            {icon}
          </span>
          <h2 className="whitespace-nowrap text-[15px] font-semibold leading-[normal]">{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
