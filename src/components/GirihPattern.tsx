/**
 * Background texture: an eight-pointed star (girih) tessellation, drawn as a
 * repeating SVG pattern rather than an image — no asset, no licence, scales to
 * any viewport and costs about 700 bytes.
 *
 * Kept at 4–6% opacity so it never competes with the text sitting on top of it.
 */
export function GirihPattern({
  className = '',
  tile = 96,
  strokeWidth = 1,
}: {
  className?: string;
  tile?: number;
  strokeWidth?: number;
}) {
  const id = `girih-${tile}`;
  const h = tile / 2;
  // Two squares, one rotated 45°, give the classic eight-point star; the corner
  // arcs are what tie neighbouring tiles into a continuous lattice.
  const inset = tile * 0.16;

  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <rect x={inset} y={inset} width={tile - inset * 2} height={tile - inset * 2} />
            <rect
              x={inset}
              y={inset}
              width={tile - inset * 2}
              height={tile - inset * 2}
              transform={`rotate(45 ${h} ${h})`}
            />
            <circle cx={h} cy={h} r={tile * 0.06} />
            <path d={`M0 ${h} H${inset} M${tile - inset} ${h} H${tile}`} />
            <path d={`M${h} 0 V${inset} M${h} ${tile - inset} V${tile}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
