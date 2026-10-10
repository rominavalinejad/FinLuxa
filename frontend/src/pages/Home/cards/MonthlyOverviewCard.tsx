import { monthlyCardBg, monthlyIcon } from "../../../assets";
import AssetBox from "../../../components/AssetBox";
import CardBackground from "../../../components/CardBackground";
import type { MonthlyOverviewPoint } from "../../../types/home";

/*
 * Figma "Monthly Overview Card": 490.62 x 188.52.
 * NOTE: built from the Figma screenshot (the Figma tool limit was reached), so every position
 * below is a measurement (about +-2px), not a value read from the file. To be re-checked.
 */
const COLORS = { income: "#1bb77b", expense: "#d22225", net: "#9672f9", muted: "#939393" };

// Chart geometry, relative to the card.
const BASELINE_Y = 152.5; // the "0" line
const PLOT_HEIGHT = 80.2; // distance from "0" to the top tick
const TICK_INTERVALS = 3; // 0 + 3 ticks, e.g. 0 / 20M / 40M / 60M
const AXIS_LABEL_RIGHT_X = 35.3;
const FIRST_CENTER_X = 56.6;
const CENTER_PITCH = 79.4;
const BAR_WIDTH = 10;
const BAR_GAP = 2;
const MONTH_LABEL_Y = 169.7;

const LEGEND = [
  { label: "Income", color: COLORS.income },
  { label: "Expense", color: COLORS.expense },
  { label: "Net Flow", color: COLORS.net },
];

const trim = (value: number) => String(Number(value.toFixed(1)));

/** Dynamic Y axis that always starts at 0: a "nice" step so that 3 steps cover the largest value. */
function niceStep(max: number): number {
  if (max <= 0) return 1;
  const raw = max / TICK_INTERVALS;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const multiplier of [1, 2, 2.5, 5, 10]) {
    if (multiplier * magnitude >= raw) return multiplier * magnitude;
  }
  return 10 * magnitude;
}

function formatTick(value: number): string {
  if (value === 0) return "0";
  if (value >= 1e9) return `${trim(value / 1e9)}B`;
  if (value >= 1e6) return `${trim(value / 1e6)}M`;
  if (value >= 1e3) return `${trim(value / 1e3)}K`;
  return String(value);
}

function shortMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1, 1));
}

export default function MonthlyOverviewCard({ data }: { data: MonthlyOverviewPoint[] }) {
  const maxValue = Math.max(0, ...data.flatMap((point) => [point.income, point.expense]));
  const step = niceStep(maxValue);
  const top = step * TICK_INTERVALS;
  const toY = (value: number) => BASELINE_Y - (value / top) * PLOT_HEIGHT;
  const centers = data.map((_, index) => FIRST_CENTER_X + index * CENTER_PITCH);

  // PENDING: wording when the 6 months span two years
  const firstYear = data[0]?.period.year;
  const lastYear = data[data.length - 1]?.period.year;
  const yearLabel = firstYear === lastYear ? `(${firstYear})` : `(${firstYear}–${lastYear})`;

  return (
    <section className="area-monthly relative">
      <CardBackground src={monthlyCardBg} />

      {/* Header: the grey square is drawn here, only the glyph is an asset */}
      <span className="absolute left-[20.93px] top-[18.66px] block size-[27.571px] rounded-[3.523px] bg-muted" />
      <AssetBox src={monthlyIcon} left={20.93} top={18.66} width={27.571} height={27.571} />
      <h2 className="absolute left-[60.54px] top-[25.37px] whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        Monthly Overview
      </h2>
      <p className="absolute left-[202.5px] top-[29px] whitespace-nowrap text-[10px] font-normal leading-[normal] text-muted">
        {data.length > 0 ? yearLabel : ""}
      </p>

      {/* Legend */}
      <div className="absolute left-[315px] top-[25.2px] flex h-[17.7px] w-[152px] items-center gap-[5.9px] rounded-full border border-[#e9ecf1] bg-white pl-[4.9px]">
        {LEGEND.map((item) => (
          <span
            key={item.label}
            className="flex h-[11.7px] shrink-0 items-center gap-[3.5px] whitespace-nowrap rounded-full border border-[#e9ecf1] px-[6.8px] text-[5.5px] font-normal leading-[normal]"
          >
            <i className="block size-[4px] rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Bars (Income, Expense) + line (Net Flow); Y axis starts at 0 and adapts to the data */}
      <svg className="absolute left-0 top-0" width={490.62} height={188.52} aria-hidden="true">
        <line x1={42} x2={468} y1={BASELINE_Y} y2={BASELINE_Y} stroke="#e6e8ec" strokeWidth={0.8} />
        {Array.from({ length: TICK_INTERVALS + 1 }, (_, i) => (
          <text
            key={i}
            x={AXIS_LABEL_RIGHT_X}
            y={BASELINE_Y - (i * PLOT_HEIGHT) / TICK_INTERVALS}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={5}
            fill={COLORS.muted}
          >
            {formatTick(i * step)}
          </text>
        ))}

        {data.map((point, index) => {
          const center = centers[index];
          const incomeTop = toY(point.income);
          const expenseTop = toY(point.expense);
          return (
            <g key={`${point.period.year}-${point.period.month}`}>
              <rect
                x={center - BAR_GAP / 2 - BAR_WIDTH}
                y={incomeTop}
                width={BAR_WIDTH}
                height={BASELINE_Y - incomeTop}
                fill={COLORS.income}
              />
              <rect
                x={center + BAR_GAP / 2}
                y={expenseTop}
                width={BAR_WIDTH}
                height={BASELINE_Y - expenseTop}
                fill={COLORS.expense}
              />
              <text
                x={center}
                y={MONTH_LABEL_Y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={5}
                fill={COLORS.muted}
              >
                {shortMonth(point.period.year, point.period.month)}
              </text>
            </g>
          );
        })}

        <polyline
          points={data.map((point, index) => `${centers[index]},${toY(point.netFlow)}`).join(" ")}
          fill="none"
          stroke={COLORS.net}
          strokeWidth={1}
        />
        {data.map((point, index) => (
          <circle
            key={`dot-${point.period.year}-${point.period.month}`}
            cx={centers[index]}
            cy={toY(point.netFlow)}
            r={2.4}
            fill="#ffffff"
            stroke={COLORS.net}
            strokeWidth={1}
          />
        ))}
      </svg>
    </section>
  );
}
