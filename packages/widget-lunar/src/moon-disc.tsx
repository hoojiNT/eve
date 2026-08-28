import { useId } from "react";

export function MoonDisc({
  phaseDeg,
  illumination,
  className,
}: {
  phaseDeg: number;
  illumination: number;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const maskId = `lunar-lit-${uid}`;
  const fillId = `lunar-fill-${uid}`;
  const shadeId = `lunar-shade-${uid}`;
  const deg = ((phaseDeg % 360) + 360) % 360;
  const waxing = deg <= 180;
  const lit = Math.max(0, Math.min(1, illumination));
  const gibbous = lit >= 0.5;
  const rx = Math.abs(2 * lit - 1) * 44;

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={fillId} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="65%" stopColor="currentColor" stopOpacity="0.88" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.62" />
        </radialGradient>
        <radialGradient id={shadeId} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.28" />
        </radialGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="black" />
          <rect x={waxing ? 50 : 0} y="0" width="50" height="100" fill="white" />
          {rx > 0.35 ? <ellipse cx="50" cy="50" rx={rx} ry="44" fill={gibbous ? "white" : "black"} /> : null}
        </mask>
      </defs>
      <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.25" />
      <circle cx="50" cy="50" r="44" fill="currentColor" fillOpacity="0.12" />
      <circle cx="50" cy="50" r="44" fill={`url(#${fillId})`} mask={`url(#${maskId})`} />
      <circle cx="50" cy="50" r="44" fill={`url(#${shadeId})`} mask={`url(#${maskId})`} />
    </svg>
  );
}
