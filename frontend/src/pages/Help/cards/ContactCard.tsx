import { LifeBuoyIcon } from "../icons";

/**
 * "Still need help?" strip at the bottom of the page.
 * PENDING: where "Contact support" goes (email, form, chat) has not been decided, so the button is visual only.
 */
export default function ContactCard() {
  return (
    <section className="flex items-center justify-between gap-[24px] rounded-[20.746px] bg-white px-[32px] py-[24px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-[16px]">
        <span className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-netflow/15 text-netflow">
          <LifeBuoyIcon className="size-[18px]" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold leading-[normal]">Still need help?</h2>
          <p className="mt-[3px] text-[10px] font-normal leading-[normal] text-muted">
            Can’t find your answer? Tell us what you were trying to do.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="h-[34px] shrink-0 rounded-[7px] bg-sidebar px-[18px] text-[10px] font-semibold leading-[normal] text-white outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Contact support
      </button>
    </section>
  );
}
