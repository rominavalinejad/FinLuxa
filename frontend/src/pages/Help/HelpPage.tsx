import ContactCard from "./cards/ContactCard";
import FaqCard from "./cards/FaqCard";
import QuickStartSection from "./cards/QuickStartSection";

/**
 * Help page (route /help). Figma only defines the header and the empty page, so the body was
 * designed by Claude from the app's existing patterns (Settings cards, AI Insights spacing):
 * full content width (1002px), first block 24px under the Header, 28px between sections.
 * Everything is static content (see lib/helpContent.ts): no backend needed.
 */
export default function HelpPage() {
  return (
    <div className="flex flex-col gap-[28px] pt-[24px]">
      <QuickStartSection />
      <FaqCard />
      <ContactCard />
    </div>
  );
}
