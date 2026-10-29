import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { projectBalance, SIMULATOR_MONTHS, trimGain } from "../../../lib/aiInsightsMath";
import { formatAmount } from "../../../lib/format";
import { formatMoney } from "../../../lib/money";
import type { SimulatorBase } from "../../../types/aiInsights";
import { ActivityIcon, LightbulbIcon } from "../icons";

const COLORS = { projected: "#1bb77b", baseline: "#9672f9", grid: "#eef0f3", muted: "#939393" };
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

interface SliderProps {
  label: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  marks: [string, string, string];
}

function Slider({ label, valueText, min, max, step, value, onChange, marks }: SliderProps) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-[8px]">
        <label htmlFor={`slider-${label}`} className="text-[10px] font-semibold leading-[normal]">
          {label}
        </label>
        <span className="whitespace-nowrap text-[15px] font-semibold leading-[normal]">{valueText}</span>
      </div>
      <input
        id={`slider-${label}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-[12px] block h-[16px] w-full cursor-pointer accent-brand"
      />
      <div className="mt-[4px] flex justify-between text-[8px] font-normal leading-[normal] text-muted">
        <span>{marks[0]}</span>
        <span>{marks[1]}</span>
        <span>{marks[2]}</span>
      </div>
    </div>
  );
}

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}%`;

/** Projected Balance Simulator: two sliders drive a straight-line 12-month projection (no randomness). */
export default function SimulatorCard({ base, symbol }: { base: SimulatorBase; symbol: string }) {
  const [discretionary, setDiscretionary] = useState(0);
  const [incomeChange, setIncomeChange] = useState(0);

  const points = useMemo(() => projectBalance(base, discretionary, incomeChange), [base, discretionary, incomeChange]);
  const forecast = points[points.length - 1].projected;
  const discretionaryAmount = Math.round(base.discretionaryBase * (1 + discretionary / 100));
  const tip = useMemo(() => trimGain(base, 10), [base]);

  return (
    <section className="flex flex-col rounded-[20.746px] bg-white px-[28px] pb-[24px] pt-[22px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <header className="flex items-start gap-[12px]">
        <span className="flex size-[27.571px] shrink-0 items-center justify-center rounded-[3.523px] bg-brand/15 text-brand">
          <ActivityIcon className="size-[15px]" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold leading-[normal]">Projected Balance Simulator</h2>
          <p className="mt-[3px] text-[10px] font-normal leading-[normal] text-muted">
            {SIMULATOR_MONTHS}-month projection from your current income and spending.
          </p>
        </div>
      </header>

      <div className="mt-[20px] flex gap-[36px] rounded-[12px] bg-page px-[22px] py-[18px]">
        <Slider
          label="Discretionary Spend"
          valueText={formatMoney(discretionaryAmount, symbol)}
          min={-60}
          max={100}
          step={5}
          value={discretionary}
          onChange={setDiscretionary}
          marks={["-60% Frugal", "Baseline", "+100% High"]}
        />
        <Slider
          label="Income Change"
          valueText={signed(incomeChange)}
          min={-20}
          max={20}
          step={1}
          value={incomeChange}
          onChange={setIncomeChange}
          marks={["-20%", "Baseline", "+20%"]}
        />
      </div>

      <div className="mt-[18px] flex items-center justify-between gap-[12px] text-[8px] font-normal leading-[normal] text-muted">
        <div className="flex items-center gap-[14px]">
          <span className="flex items-center gap-[5px]">
            <i className="block h-[2px] w-[10px]" style={{ backgroundColor: COLORS.projected }} />
            Projected balance
          </span>
          <span className="flex items-center gap-[5px]">
            <i className="block h-[2px] w-[10px]" style={{ backgroundColor: COLORS.baseline }} />
            Baseline trajectory
          </span>
        </div>
        <span>
          {SIMULATOR_MONTHS}-month forecast: <b className="text-[12px] font-semibold text-ink">{formatMoney(forecast, symbol)}</b>
        </span>
      </div>

      <div className="mt-[10px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="projectedFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.projected} stopOpacity={0.22} />
                <stop offset="100%" stopColor={COLORS.projected} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 8, fill: COLORS.muted }} />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 8, fill: COLORS.muted }}
              tickFormatter={(value: number) => compact.format(value)}
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(value, name) => [formatMoney(Number(value), symbol), String(name)]}
              contentStyle={{ fontSize: 10, borderRadius: 8, border: "1px solid #e9ecf1" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              name="Baseline"
              dataKey="baseline"
              stroke={COLORS.baseline}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="none"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              name="Projected"
              dataKey="projected"
              stroke={COLORS.projected}
              strokeWidth={2}
              fill="url(#projectedFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-[16px] flex items-start gap-[10px] rounded-[10px] bg-[#eaf7f3] px-[14px] py-[12px] text-[10px] font-normal leading-[1.6]">
        <LightbulbIcon className="mt-[1px] size-[14px] shrink-0 text-brand" />
        <span>
          <b className="font-semibold">FinLuxa Brain Tip:</b> keeping discretionary spend below {formatMoney(tip.limit, symbol)} a month would add
          about {formatAmount(tip.gain)} {symbol} to your balance over {SIMULATOR_MONTHS} months.
        </span>
      </p>
    </section>
  );
}
