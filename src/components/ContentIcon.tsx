/**
 * Icons named by content.json, resolved through an explicit map.
 *
 * A namespace import (`import * as icons from 'lucide-react'`) would be correct
 * but pulls the entire icon set into the bundle — about 900 kB of the entry
 * chunk. Listing the fifteen icons the data actually asks for keeps tree-shaking
 * working; an unknown name falls back to a neutral dot rather than crashing.
 */
import {
  BarChart3,
  BrickWall,
  Car,
  Circle,
  Cpu,
  FileSearch,
  FlaskConical,
  GraduationCap,
  Handshake,
  Landmark,
  LifeBuoy,
  MapPin,
  Pickaxe,
  Pill,
  Wheat,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Keys are exactly the `icon` values used in shared/data/content.json. */
const ICONS: Record<string, LucideIcon> = {
  // organization.services
  'file-search': FileSearch,
  'map-pin': MapPin,
  'life-buoy': LifeBuoy,
  'bar-chart-3': BarChart3,
  handshake: Handshake,
  // sectors.items
  car: Car,
  wheat: Wheat,
  'brick-wall': BrickWall,
  'flask-conical': FlaskConical,
  'graduation-cap': GraduationCap,
  cpu: Cpu,
  zap: Zap,
  landmark: Landmark,
  pickaxe: Pickaxe,
  pill: Pill,
};

export function ContentIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Circle;
  return <Icon className={className} aria-hidden="true" />;
}
