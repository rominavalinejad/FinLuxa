import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SparklesIcon } from "../../AiInsights/icons";
import { ChevronRightIcon, PlusSquareIcon } from "../../Transactions/icons";
import { LayoutDashboardIcon } from "../icons";

interface QuickStart {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  /** Colour of the icon square (same palette as the Home cards). */
  square: string;
}

const ITEMS: QuickStart[] = [
  {
    to: "/transactions",
    title: "Add your first transaction",
    description: "Record an income or an expense. Everything else in FinLuxa is built from these entries.",
    icon: <PlusSquareIcon className="size-[15px]" />,
    square: "bg-brand",
  },
  {
    to: "/",
    title: "Read your dashboard",
    description: "See your balance, cash flow and spending by category for the month.",
    icon: <LayoutDashboardIcon className="size-[15px]" />,
    square: "bg-netflow",
  },
  {
    to: "/ai-insights",
    title: "Get smart suggestions",
    description: "Check your health index, spending patterns and ideas for saving more.",
    icon: <SparklesIcon className="size-[15px]" />,
    square: "bg-[#ea7a25]",
  },
];

/** Three shortcuts to the pages a new user needs first. */
export default function QuickStartSection() {
  return (
    <section aria-label="Get started">
      <h2 className="text-[15px] font-semibold leading-[normal]">Get started</h2>
      <div className="mt-[16px] grid grid-cols-3 gap-[20px]">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="relative flex min-h-[132px] flex-col rounded-[20.746px] bg-white px-[19px] pb-[18px] pt-[16px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)] outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span
              className={`flex size-[27.571px] items-center justify-center rounded-[3.523px] text-white ${item.square}`}
            >
              {item.icon}
            </span>
            <ChevronRightIcon className="absolute right-[19px] top-[22px] size-[14px] text-muted" />
            <h3 className="mt-[14px] text-[12px] font-semibold leading-[normal]">{item.title}</h3>
            <p className="mt-[5px] text-[10px] font-normal leading-[1.6] text-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
