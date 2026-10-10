import { smallStepsArrowRight, smallStepsButtonBg, smallStepsCardBg, smallStepsIllustration } from "../../../assets";
import AssetBox from "../../../components/AssetBox";
import CardBackground from "../../../components/CardBackground";

/*
 * Figma "Small Steps Card": 490.62 x 188.52. Static card (illustration + copy).
 * NOTE: built from the Figma screenshot (the Figma tool limit was reached), so positions are
 * measurements (about +-2px), not values read from the file. To be re-checked.
 */
export default function SmallStepsCard() {
  return (
    <section className="area-smallsteps relative">
      <CardBackground src={smallStepsCardBg} />

      {/* Landscape illustration, clipped to the card's rounded corners (radius 20.75) */}
      <div className="absolute inset-0 overflow-hidden rounded-[20.746px]" aria-hidden="true">
        <img src={smallStepsIllustration} alt="" className="absolute left-0 top-0 max-w-none" />
      </div>

      <h2 className="absolute left-[22.8px] top-[17.3px] whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        Small steps, big goals.
      </h2>
      <p className="absolute left-[22.8px] top-[37.4px] whitespace-nowrap text-[10px] font-normal leading-[normal]">
        Track your spending, save smarter,
        <br />
        and build the future you want.
      </p>

      {/* PENDING: destination of "Explore Insight" */}
      <button type="button" className="absolute left-[22.8px] top-[72.4px] block h-[17px] w-[67.5px]">
        <img src={smallStepsButtonBg} alt="" className="absolute inset-0 size-full max-w-none" />
        <span className="absolute left-[7px] top-[8px] -translate-y-1/2 whitespace-nowrap text-[5px] font-normal leading-[normal] text-white">
          Explore Insight
        </span>
        <AssetBox src={smallStepsArrowRight} left={52} top={5} width={7.477} height={6.692} />
      </button>
    </section>
  );
}
