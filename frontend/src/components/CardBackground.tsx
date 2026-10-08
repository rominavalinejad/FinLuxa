/**
 * Exported Figma "Card" vector. The SVG is the card plus its drop shadow, so it starts
 * 3.81px left and 4.78px above the card's top-left corner (same for every card in Figma).
 * It keeps its natural size, so the shadow margin on the right/bottom needs no extra math.
 */
export default function CardBackground({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute max-w-none"
      style={{ left: -3.8125, top: -4.7842 }}
    />
  );
}
