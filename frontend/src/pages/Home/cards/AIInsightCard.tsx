import { Link } from "react-router-dom";
import { aiArrowRight, aiButtonBg, aiCardBg, aiIcon, aiIllustration } from "../../../assets";
import AssetBox from "../../../components/AssetBox";

/** Demo copy from Figma; the AI logic comes in a later phase. */
const DEMO_INSIGHT =
  "You spend 18% more on dining out compared to last month. If you reduce it by 15%, you could save about 750,000 this month.";

/** Figma "AI Insight Card" (57:194): 254.33 x 154.2. The button routes to the AI Insights page. */
export default function AIInsightCard() {
  return (
    <section className="area-ai relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-2.97%_-3.58%_-5.3%_-1.44%]">
        <img src={aiCardBg} alt="" className="block size-full max-w-none" />
      </span>

      {/* Header: the purple square is drawn here (flat #9672f9 in Figma), only the glyph is an asset */}
      <span className="absolute left-[20.152px] top-[20.652px] block size-[27.571px] rounded-[3.523px] bg-netflow" />
      <AssetBox src={aiIcon} left={25.742} top={25.384} width={16.388} height={18.073} />
      <h2 className="absolute left-[57.498px] top-[27.175px] whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        AI Insight
      </h2>

      {/* Insight text: vertically centred in its 64.26px box, as in Figma */}
      <div className="absolute left-[20.152px] top-[44.967px] flex h-[64.256px] w-[215.483px] items-center">
        <p className="text-justify text-[10px] font-normal leading-[normal]">{DEMO_INSIGHT}</p>
      </div>

      {/* Illustration: the exported frame already contains the round background (45.04 x 45.04) */}
      <AssetBox src={aiIllustration} left={194.882} top={99.734} width={45.043} height={45.043} />

      {/* "See Details" button: 55 x 17. The arrow sits right after the label (x = 39), not at the edge */}
      <Link to="/ai-insights" className="absolute left-[20.152px] top-[112.473px] block h-[17px] w-[55px]">
        <img src={aiButtonBg} alt="" className="absolute inset-0 size-full max-w-none" />
        <span className="absolute left-[7px] top-[8px] -translate-y-1/2 whitespace-nowrap text-[5px] font-normal leading-[normal] text-white">
          See Details
        </span>
        <AssetBox src={aiArrowRight} left={39} top={5} width={7.477} height={6.692} />
      </Link>
    </section>
  );
}
