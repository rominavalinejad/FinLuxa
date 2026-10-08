import {
  savingCardBg,
  savingIcon,
  savingIconBg,
  savingLightIcon,
  savingMore,
  savingStatusCard,
} from "../../../assets";
import AssetBox from "../../../components/AssetBox";
import CardBackground from "../../../components/CardBackground";
import { formatAmount } from "../../../lib/format";

/**
 * Demo values copied from Figma. The Saving Goal logic and its data contract are still under
 * review (schema + definition of "Saved"), so this card is presentation only and does not read
 * from HomeData yet.
 */
const DEMO = { saved: 12_000_000, target: 20_000_000 };

/** Figma "Saving Goal Card" (58:177): 269.54 x 247.69. All offsets are relative to the card. */
export default function SavingGoalCard() {
  const percent = Math.round((DEMO.saved / DEMO.target) * 100);
  const fill = Math.min(Math.max(percent, 0), 100);

  return (
    <section className="area-saving relative">
      <CardBackground src={savingCardBg} />

      {/* Header */}
      <AssetBox src={savingIconBg} left={24.252} top={24.823} width={36.708} height={36.708} />
      <AssetBox src={savingIcon} left={30.678} top={31.248} width={23.874} height={23.838} />
      <h2 className="absolute left-[74.756px] top-[33.735px] whitespace-nowrap text-[15px] font-semibold leading-[normal]">
        Saving Goal
      </h2>
      <p className="absolute left-[74.756px] top-[57.58px] whitespace-nowrap text-[10px] font-normal leading-[normal] text-muted">
        Save for your future :)
      </p>
      {/* Destination / menu not specified yet: visual only */}
      <button type="button" aria-label="More options" className="absolute left-[245.997px] top-[27.88px] block h-[11.74px] w-[2.902px]">
        <AssetBox src={savingMore} left={0} top={0} width={2.902} height={11.74} />
      </button>

      {/* Progress */}
      <p className="absolute left-[24.315px] top-[91.655px] whitespace-nowrap text-[10px] font-semibold leading-[normal]">
        {formatAmount(DEMO.saved)}
      </p>
      <p className="absolute left-[88.758px] top-[94.981px] whitespace-nowrap text-[5px] font-normal leading-[normal] text-muted">
        /{formatAmount(DEMO.target)}
      </p>
      <p className="absolute right-[20.96px] top-[90.728px] whitespace-nowrap text-right text-[10px] font-semibold leading-[normal]">
        {percent}%
      </p>
      <div className="absolute left-[24.315px] top-[113.675px] h-[14.077px] w-[224.528px] rounded-full bg-muted/20">
        <div className="h-full rounded-full bg-brand" style={{ width: `${fill}%` }} />
      </div>

      {/* Status message (demo copy) */}
      <AssetBox src={savingStatusCard} left={24.758} top={149.981} width={224.571} height={76.792} />
      <AssetBox src={savingLightIcon} left={62.758} top={174.981} width={17.128} height={25.186} />
      <p className="absolute left-[89.707px] top-[176.423px] whitespace-nowrap text-[10px] font-normal leading-[normal]">
        <span className="font-semibold">On track!</span> You’re saving
        <br />
        5% more than last month.
      </p>
    </section>
  );
}
