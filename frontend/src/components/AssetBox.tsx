interface AssetBoxProps {
  src: string;
  /** Position and size of the Figma layer, relative to its card. */
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Places an exported Figma asset inside the layer's box. The image keeps its own size and is
 * centred, so strokes/padding included in the export cannot shift or squash the icon.
 */
export default function AssetBox({ src, left, top, width, height }: AssetBoxProps) {
  return (
    <span aria-hidden="true" className="absolute flex items-center justify-center" style={{ left, top, width, height }}>
      <img src={src} alt="" className="max-w-none shrink-0" />
    </span>
  );
}
