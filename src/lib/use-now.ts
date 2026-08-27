import { useEffect, useState } from "react";

/** Always has a Date so SSR HTML already shows live values — not "--" / 0%. */
export function useNow(intervalMs = 250): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
