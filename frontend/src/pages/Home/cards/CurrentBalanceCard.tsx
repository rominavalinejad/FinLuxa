import { Line, LineChart, XAxis, YAxis } from "recharts";
import {
  balanceCardBg,
  balanceChevronRight,
  balanceStartingBg,
  balanceStartingIcon,
  balanceTrendUpIcon,
  balanceWalletIcon,
} from "../../../assets";
import MaskIcon from "../../../components/MaskIcon";
import { usePeriod } from "../../../context/PeriodContext";
import { formatPeriod } from "../../../lib/date";
import { formatAmount } from "../../../lib/format";
import type { BalanceSummary } from "../../../types/home";

/** Figma "Current Balance Card" (58:181): 428.18 x 277.59. All offsets are relative to the card. */
export default function CurrentBalanceCard({ data }: { data: BalanceSummary }) {
  const { period } = usePeriod();
  const positive = data.netFlow >= 0;
  // The negative state is not designed in Figma yet: it flips the arrow and uses the expense red.
  const changeColor = positive ? "text-brand" : "text-expense";

  return (
    <section className="area-balance relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-1.74%_-2.24%_-3.11%_-0.9%]">
        <img src={balanceCardBg} alt="" className="block size-full max-w-none" />
      </span>

      {/* Header */}
      <img src={balanceWalletIcon} alt="" className="absolute left-[36.81px] top-[19.08px] size-[34.132px]" />
      <h2 className="absolute left-[84.77px] top-[29.23px] whitespace-nowrap text-[15px] font-semibold leading-normal">
        Current Balance
      </h2>
      {/* Destination / popup not specified yet: visual only */}
      <button
        type="button"
        aria-label="Balance details"
        className="absolute left-[392.85px] top-[30.3px] block h-[11.709px] w-[5.879px]"
      >
        <span className="absolute inset-[-12.35%_-34.85%_-12.35%_-24.59%]">
          <img src={balanceChevronRight} alt="" className="block size-full max-w-none" />
        </span>
      </button>

      {/* Amount + change */}
      <p className="absolute left-[36.71px] top-[73.08px] whitespace-nowrap text-[25px] font-black leading-normal">
        {formatAmount(data.currentBalance)}
      </p>
      {/* PENDING: Notion's exact wording of this comparison label */}
      <p className="absolute left-[207px] top-[82px] whitespace-nowrap text-[10px] font-normal leading-normal text-muted">
        (vs. Month {formatPeriod(period)})
      </p>
      <span
        aria-hidden="true"
        className={`absolute left-[36.06px] top-[115.56px] block ${changeColor} ${positive ? "" : "-scale-y-100"}`}
      >
        <MaskIcon src={balanceTrendUpIcon} width={12.43} height={14.03} />
      </span>
      <p
        className={`absolute left-[52.79px] top-[115.08px] whitespace-nowrap text-[15px] font-bold leading-normal ${changeColor}`}
      >
        {positive ? "+" : "-"}
        {formatAmount(Math.abs(data.netFlow))}
      </p>

      {/* Balance over time (colour assumed from the brand green; the Figma line is a static drawing) */}
      <div className="absolute left-[13.88px] top-[133.8px]">
        <LineChart
          width={386.995}
          height={70.995}
          data={data.trend}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <XAxis dataKey="label" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#1bb77b"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </div>

      {/* Starting Balance strip */}
      <div className="absolute left-[13.86px] top-[224.53px] h-[26.795px] w-[387.015px] rounded-[6.46px] border-[1.435px] border-solid border-page" />
      <img src={balanceStartingBg} alt="" className="absolute left-[37.2px] top-[226.87px] size-[21.711px]" />
      <img
        src={balanceStartingIcon}
        alt=""
        className="absolute left-[42.757px] top-[233.264px] h-[8.878px] w-[10.575px]"
      />
      <p className="absolute left-[69px] top-[232px] whitespace-nowrap text-[10px] font-normal leading-normal">
        Starting Balance:
      </p>
      <p className="absolute left-[156px] top-[232px] whitespace-nowrap text-[10px] font-semibold leading-normal">
        {formatAmount(data.startingBalance)}
      </p>
    </section>
  );
}
