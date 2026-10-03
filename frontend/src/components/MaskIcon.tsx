interface MaskIconProps {
  /** URL of a single-colour SVG; it is painted with the current text colour. */
  src: string;
  width: number;
  height: number;
}

/**
 * Renders an SVG silhouette in `currentColor`, so one exported icon can be
 * white, green (active) etc. without separate files per state.
 */
export default function MaskIcon({ src, width, height }: MaskIconProps) {
  const mask = `url("${src}")`;
  return (
    <span
      aria-hidden="true"
      className="block shrink-0 bg-current"
      style={{
        width,
        height,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
