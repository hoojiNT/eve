export type GridItem = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export function collides(a: GridItem, b: GridItem): boolean {
  if (a.id === b.id) return false;
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function clampItem(item: GridItem, cols: number): GridItem {
  const w = Math.max(1, Math.min(item.w, cols));
  const x = Math.max(0, Math.min(item.x, cols - w));
  const y = Math.max(0, item.y);
  const h = Math.max(1, item.h);
  return { ...item, x, y, w, h };
}

export function compactVertical(items: GridItem[], cols: number): GridItem[] {
  const sorted = [...items]
    .map((item) => clampItem(item, cols))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: GridItem[] = [];
  for (const item of sorted) {
    const candidate = { ...item, y: 0 };
    while (placed.some((p) => collides(candidate, p))) {
      candidate.y += 1;
    }
    placed.push(candidate);
  }
  return placed;
}

export function packLeft(items: GridItem[], cols: number): GridItem[] {
  const sorted = compactVertical(items, cols).sort((a, b) => a.y - b.y || a.x - b.x);
  const placed: GridItem[] = [];
  for (const item of sorted) {
    const candidate = { ...item, x: 0 };
    while (placed.some((p) => collides(candidate, p))) {
      candidate.x += 1;
    }
    if (candidate.x + candidate.w > cols) {
      placed.push(item);
    } else {
      placed.push(candidate);
    }
  }
  return placed;
}

export function resolveDrop(
  items: GridItem[],
  movingId: string,
  next: Pick<GridItem, "x" | "y" | "w" | "h">,
  cols: number,
): GridItem[] {
  const moving = items.find((i) => i.id === movingId);
  if (!moving) return items;
  const placed = clampItem({ ...moving, ...next }, cols);
  const others = items
    .filter((i) => i.id !== movingId)
    .map((i) => clampItem(i, cols));

  const pushed: GridItem[] = [];
  const rest = [...others].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const item of rest) {
    const candidate = { ...item };
    while (collides(candidate, placed) || pushed.some((p) => collides(candidate, p))) {
      candidate.y += 1;
    }
    pushed.push(candidate);
  }
  return compactVertical([placed, ...pushed], cols);
}

export function firstFit(
  items: GridItem[],
  cols: number,
  w: number,
  h: number,
): { x: number; y: number } {
  const width = Math.min(w, cols);
  const occupied = items.map((i) => clampItem(i, cols));
  const maxY = occupied.reduce((m, i) => Math.max(m, i.y + i.h), 0);
  for (let y = 0; y <= maxY; y += 1) {
    for (let x = 0; x <= cols - width; x += 1) {
      const candidate: GridItem = { id: "__new", x, y, w: width, h };
      if (!occupied.some((p) => collides(candidate, p))) {
        return { x, y };
      }
    }
  }
  return { x: 0, y: maxY };
}

export function cellMetrics(containerWidth: number, cols: number, gap: number, rowHeight: number) {
  const colWidth = (containerWidth - gap * (cols - 1)) / cols;
  return {
    colWidth,
    rowHeight,
    gap,
    xToPx: (x: number) => x * (colWidth + gap),
    yToPx: (y: number) => y * (rowHeight + gap),
    wToPx: (w: number) => w * colWidth + (w - 1) * gap,
    hToPx: (h: number) => h * rowHeight + (h - 1) * gap,
    pxToX: (px: number) => Math.round(px / (colWidth + gap)),
    pxToY: (px: number) => Math.round(px / (rowHeight + gap)),
  };
}

export function gridHeight(items: GridItem[], extraRows = 1): number {
  return items.reduce((m, i) => Math.max(m, i.y + i.h), 0) + extraRows;
}
