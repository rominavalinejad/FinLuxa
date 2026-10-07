import {
  cashFlowCardBg,
  cashFlowExpenseBg,
  cashFlowExpenseIcon,
  cashFlowIcon,
  cashFlowIncomeBg,
  cashFlowIncomeIcon,
  cashFlowNetBg,
  cashFlowNetIcon,
} from "../../../assets";
import { usePeriod } from "../../../context/PeriodContext";
import { formatPeriod } from "../../../lib/date";
import { formatAmount } from "../../../lib/format";
import type { CashFlowSummary } from "../../../types/home";

/** Figma "Cash Flow" (54:527): 269.54 x 229.29. All offsets are relative to the card. */
export default function CashFlowCard({ data }: { data: CashFlowSummary }) {
  const { period } = usePeriod();

  return (
    <section className="area-cashflow relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-2.09%_-3.53%_-3.72%_-1.41%]">
        <img src={cashFlowCardBg} alt="" className="block size-full max-w-none" />
      </span>

      {/* Header */}
      <span className="absolute left-[20.93px] top-[18.66px] block size-[27.571px] rounded-[3.523px] bg-brand" />
      <img
        src={cashFlowIcon}
        alt=""
        className="absolute left-[24.416px] top-[23.126px] h-[18.62px] w-[20.608px]"
      />
      <h2 className="absolute left-[60.54px] top-[25.37px] whitespace-nowrap text-[15px] font-semibold leading-normal">
        Cash Flow
      </h2>
      <p className="absolute left-[146.76px] top-[29px] whitespace-nowrap text-[10px] font-normal leading-normal text-muted">
        ({formatPeriod(period)})
      </p>

      {/* Income */}
      <img src={cashFlowIncomeBg} alt="" className="absolute left-[20.93px] top-[74.89px] size-[27.587px]" />
      <img
        src={cashFlowIncomeIcon}
        alt=""
        className="absolute left-[27.592px] top-[79.983px] h-[16.633px] w-[14.224px]"
      />
      <p className="absolute left-[60.55px] top-[81.59px] whitespace-nowrap text-[10px] font-semibold leading-normal">
        Income
      </p>
      <p className="absolute right-[17.58px] top-[80.03px] whitespace-nowrap text-right text-[15px] font-semibold leading-normal text-brand">
        {formatAmount(data.income)}
      </p>

      {/* Expense */}
      <img src={cashFlowExpenseBg} alt="" className="absolute left-[21.11px] top-[114.9px] size-[27.587px]" />
      <img
        src={cashFlowExpenseIcon}
        alt=""
        className="absolute left-[26.92px] top-[120.135px] h-[15.581px] w-[15.564px]"
      />
      <p className="absolute left-[60.55px] top-[121.61px] whitespace-nowrap text-[10px] font-semibold leading-normal">
        Expense
      </p>
      <p className="absolute right-[17.58px] top-[120.05px] whitespace-nowrap text-right text-[15px] font-semibold leading-normal text-expense">
        {formatAmount(data.expense)}
      </p>

      {/* Divider */}
      <div aria-hidden="true" className="absolute left-0 top-[171.11px] h-[0.78px] w-full bg-[#d9d9d9]" />

      {/* Net Flow */}
      <img src={cashFlowNetBg} alt="" className="absolute left-[21.11px] top-[183.54px] size-[27.587px]" />
      <img
        src={cashFlowNetIcon}
        alt=""
        className="absolute left-[27.234px] top-[189.669px] h-[15.292px] w-[15.371px]"
      />
      <p className="absolute left-[60.55px] top-[190.25px] whitespace-nowrap text-[10px] font-black leading-normal">
        Net Flow
      </p>
      <p className="absolute right-[17.58px] top-[188.69px] whitespace-nowrap text-right text-[15px] font-semibold leading-normal text-netflow">
        {formatAmount(data.netFlow)}
      </p>
    </section>
  );
}
