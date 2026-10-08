import { Cell, Pie, PieChart } from "recharts";
import { spendingCardBg, spendingIcon, spendingIconBg } from "../../../assets";
import AssetBox from "../../../components/AssetBox";
import CardBackground from "../../../components/CardBackground";
import { formatAmount, formatPercent } from "../../../lib/format";
import type { CategorySpending } from "../../../types/home";
import { getCategoryStyle } from "./categoryStyle";

// Geometry from Figma "Spending by Category Card" (62:123), relative to the card.
const MAX_LEGEND_ROWS = 5; // PENDING: what to do with more than 5 categories
const LEGEND_FIRST_TOP = 19.814;
const LEGEND_PITCH = 34.95;
const DONUT_SIZE = 140; // chart box; ring centre sits at (111.43, 117.75) in the card
const DONUT_INNER_RADIUS = 49.83; // = the white centre circle (Figma "Ellipse 12")
const DONUT_OUTER_RADIUS = 67.8; // measured from the Figma screenshot (not in the metadata)

/** Figma "Spending by Category Card" (62:123): 425 x 202.2. */
export default function SpendingByCategoryCard({ data }: { data: CategorySpending[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const slices =
    total > 0
      ? data.map((item) => ({ name: item.name, value: item.amount, color: getCategoryStyle(item.categoryId).color }))
      : [{ name: "empty", value: 1, color: "rgba(147, 147, 147, 0.2)" }];

  return (
    <section className="area-spending relative">
      <CardBackground src={spendingCardBg} />

      {/* Header */}
      <AssetBox src={spendingIconBg} left={24.313} top={13.177} width={27.571} height={27.571} />
      <AssetBox src={spendingIcon} left={30.226} top={19.549} width={15.71} height={15.709} />
      <h2 className="absolute left-[60.985px] top-[18.177px] whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        Spending by Category
      </h2>

      {/* Donut: starts at 12 o'clock and runs clockwise in the order of the legend */}
      <div className="absolute left-[41.43px] top-[47.75px]">
        <PieChart width={DONUT_SIZE} height={DONUT_SIZE} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={slices}
            dataKey="value"
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            innerRadius={DONUT_INNER_RADIUS}
            outerRadius={DONUT_OUTER_RADIUS}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
          >
            {slices.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <p className="absolute left-[112px] top-[102.69px] -translate-x-1/2 whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        {formatAmount(total)}
      </p>
      <p className="absolute left-[112px] top-[122.38px] -translate-x-1/2 whitespace-nowrap text-[10px] font-normal leading-[normal] text-muted">
        Total Expenses
      </p>

      {/* Legend */}
      {data.slice(0, MAX_LEGEND_ROWS).map((item, index) => (
        <div key={item.categoryId} className="absolute inset-x-0" style={{ top: LEGEND_FIRST_TOP + index * LEGEND_PITCH }}>
          <span
            className="absolute left-[238.559px] top-[2.03px] block size-[12.003px] rounded-full"
            style={{ backgroundColor: getCategoryStyle(item.categoryId).color }}
          />
          <p className="absolute left-[256.961px] top-0 whitespace-nowrap text-[10px] font-normal leading-[normal] text-muted">
            {item.name}
          </p>
          <p className="absolute right-[23.55px] top-[0.36px] whitespace-nowrap text-right text-[10px] font-semibold leading-[normal]">
            {formatPercent(item.percent)}
          </p>
          <p className="absolute right-[24px] top-[15.8px] whitespace-nowrap text-right text-[5px] font-normal leading-[normal] text-muted">
            {formatAmount(item.amount)}
          </p>
        </div>
      ))}
    </section>
  );
}
