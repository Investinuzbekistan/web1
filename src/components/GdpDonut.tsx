import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
  index: number;
}

/**
 * Lazy-loaded on purpose: Recharts and its d3 internals are ~290 kB, and this
 * donut sits well below the fold. Keeping it out of the entry chunk is what lets
 * the hero paint without waiting for a chart library.
 */
export default function GdpDonut({
  slices,
  surface,
  dimmedIndex,
  onSelect,
}: {
  slices: DonutSlice[];
  surface: string;
  dimmedIndex: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={slices}
          dataKey="value"
          nameKey="name"
          innerRadius="62%"
          outerRadius="94%"
          startAngle={90}
          endAngle={-270}
          /* 2px surface gap between segments, per the mark spec. */
          paddingAngle={1.2}
          stroke={surface}
          strokeWidth={2}
          isAnimationActive={false}
          onClick={(_, index) => onSelect(index)}
        >
          {slices.map((slice) => (
            <Cell
              key={slice.index}
              fill={slice.color}
              opacity={dimmedIndex === null || dimmedIndex === slice.index ? 1 : 0.3}
              className="cursor-pointer outline-none"
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
