import { formatAmount } from "../../../lib/format";
import { ArrowUpIcon } from "../icons";

type Tone = "brand" | "expense" | "netflow";

// The arrow colour follows the card, never the direction of the change (decided by the owner).
const TONES: Record<Tone, { square: string; arrow: string }> = {
  brand: { square: "bg-brand", arrow: "text-brand" },
  expense: { square: "bg-expense", arrow: "text-expense" },
  netflow: { square: "bg-netflow", arrow: "text-netflow" },
};

interface SummaryCardProps {
  title: string;
  value: number;
  /** DEMO: the comparison logic is not defined yet, so the page passes a fixed number. */
  percent: number;
  tone: Tone;
  /** White glyph drawn on the coloured square. */
  icon: string;
}

/**
 * Figma "Total Income / Total Expenses / Net Flow" cards: 221 x 114 when the Add panel is open
 * (they share the row equally, so they widen when it is closed).
 * NOTE: the glyphs are the closest existing assets; the real icons are not exported from Figma yet.
 */
export default function SummaryCard({ title, value, percent, tone, icon }: SummaryCardProps) {
  const colors = TONES[tone];
  return (
    <section className="relative h-[114px] rounded-[20.746px] bg-white shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <span
        className={`absolute left-[19px] top-[16px] flex size-[27.571px] items-center justify-center rounded-[3.523px] ${colors.square}`}
      >
        <img src={icon} alt="" className="max-h-[70%] max-w-[70%]" />
      </span>
      <h2 className="absolute left-[60px] top-[24px] whitespace-nowrap text-[10px] font-semibold leading-[normal]">{title}</h2>

      <div className="absolute left-[19px] top-[56px] flex items-center gap-[14px]">
        <p className="whitespace-nowrap text-[21px] font-semibold leading-[normal]">{formatAmount(value)}</p>
        <span className="flex h-[17px] items-center gap-[3px] whitespace-nowrap rounded-full bg-muted/20 px-[7px] text-[8px] font-semibold leading-[normal]">
          {percent}%
          <ArrowUpIcon className={`size-[8px] ${colors.arrow}`} strokeWidth={2.5} />
        </span>
      </div>

      <p className="absolute left-[19px] top-[91px] whitespace-nowrap text-[8px] font-normal leading-[normal] text-muted">
        Compare to Last Month
      </p>
    </section>
  );
}
