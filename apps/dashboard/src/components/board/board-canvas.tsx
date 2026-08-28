import { Suspense, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button, cn } from "@eve/ui";
import { toast } from "@/lib/toast";
import { WidgetFrame } from "@/components/board/widget-frame";
import { LazyWidgetPicker } from "@/components/board/lazy";
import { cellMetrics, clampItem, gridHeight, type GridItem } from "@/lib/grid";
import { copy as dict } from "@/lib/i18n";
import { DENSITY_ROW, layoutForType, useBoardStore, type WidgetInstance } from "@/store/board";

type DragState = {
  id: string;
  mode: "move" | "resize";
  origin: GridItem;
  ghost: GridItem;
  startX: number;
  startY: number;
  minW: number;
  minH: number;
};

// Floor below which a column stops shrinking; the grid overflows its
// container instead, so the board scrolls horizontally rather than
// squeezing widgets or reflowing them into a single column.
const MIN_COL_WIDTH = 64;

export function BoardCanvas() {
  const widgets = useBoardStore((s) => s.widgets);
  const cols = useBoardStore((s) => s.cols);
  const density = useBoardStore((s) => s.density);
  const isEditing = useBoardStore((s) => s.isEditing);
  const locale = useBoardStore((s) => s.locale);
  const moveWidget = useBoardStore((s) => s.moveWidget);
  const removeWidget = useBoardStore((s) => s.removeWidget);
  const restoreWidget = useBoardStore((s) => s.restoreWidget);
  const addWidget = useBoardStore((s) => s.addWidget);
  const copy = dict[locale];

  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const gap = 12;
  const rowHeight = DENSITY_ROW[density];
  const extra = isEditing ? 2 : 0;
  const rows = Math.max(gridHeight(widgets, extra), isEditing ? 6 : 1);
  const canArrange = isEditing;
  const gridMinWidth = cols * MIN_COL_WIDTH + gap * (cols - 1);
  const colsRef = useRef(cols);
  colsRef.current = cols;

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const current = dragRef.current;
      const el = ref.current;
      if (!current || !el) return;
      const m = cellMetrics(el.getBoundingClientRect().width, colsRef.current, gap, rowHeight);
      const dx = event.clientX - current.startX;
      const dy = event.clientY - current.startY;
      const colsNow = colsRef.current;
      const nextGhost =
        current.mode === "move"
          ? clampItem(
              {
                ...current.origin,
                x: current.origin.x + m.pxToX(dx),
                y: current.origin.y + m.pxToY(dy),
              },
              colsNow,
            )
          : clampResize(current.origin, m.pxToX(dx), m.pxToY(dy), colsNow, current.minW, current.minH);
      const next = { ...current, ghost: nextGhost };
      dragRef.current = next;
      setDrag(next);
    };

    const onUp = () => {
      const current = dragRef.current;
      if (!current) return;
      moveWidget(current.id, {
        x: current.ghost.x,
        y: current.ghost.y,
        w: current.ghost.w,
        h: current.ghost.h,
      });
      dragRef.current = null;
      setDrag(null);
      document.body.style.removeProperty("user-select");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [moveWidget, rowHeight]);

  const beginDrag = (
    event: ReactPointerEvent<HTMLButtonElement>,
    widget: WidgetInstance,
    mode: "move" | "resize",
  ) => {
    if (!canArrange) return;
    event.preventDefault();
    event.stopPropagation();
    const layout = layoutForType(widget.type);
    const origin: GridItem = { id: widget.id, x: widget.x, y: widget.y, w: widget.w, h: widget.h };
    const next: DragState = {
      id: widget.id,
      mode,
      origin,
      ghost: origin,
      startX: event.clientX,
      startY: event.clientY,
      minW: Math.min(layout.minW, cols),
      minH: layout.minH,
    };
    dragRef.current = next;
    setDrag(next);
    document.body.style.userSelect = "none";
  };

  const handleDelete = (widget: WidgetInstance) => {
    const removed = removeWidget(widget.id);
    if (!removed) return;
    toast(copy.deleted, {
      action: {
        label: copy.undo,
        onClick: () => restoreWidget(removed),
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      {isEditing ? <p className="mb-4 text-sm text-muted">{copy.dragHint}</p> : null}

      {widgets.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-xl bg-surface px-6 py-16 text-center shadow-[var(--shadow-border)]">
          <p className="font-display text-2xl font-medium tracking-tight">{copy.emptyTitle}</p>
          <p className="mt-2 max-w-md text-sm text-muted">{copy.emptyBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => addWidget("countdown")}>{copy.emptyCta}</Button>
            <Suspense fallback={null}>
              <LazyWidgetPicker copy={copy} locale={locale} />
            </Suspense>
          </div>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
          <div
            ref={ref}
            className="relative grid w-full"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
              gap,
              minWidth: gridMinWidth,
            }}
          >
            {isEditing ? (
              <div
                className="pointer-events-none absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
                  gap,
                }}
              >
                {Array.from({ length: cols * rows }).map((_, i) => (
                  <div key={`cell-${i}`} className="rounded-lg ring-1 ring-fg/6" />
                ))}
              </div>
            ) : null}

            {drag ? (
              <div
                className="pointer-events-none rounded-xl bg-accent/10"
                style={{
                  gridColumn: `${drag.ghost.x + 1} / span ${drag.ghost.w}`,
                  gridRow: `${drag.ghost.y + 1} / span ${drag.ghost.h}`,
                  zIndex: 1,
                }}
              />
            ) : null}

            {widgets.map((widget, index) => {
              const dragging = drag?.id === widget.id;
              const pos = dragging && drag ? drag.ghost : widget;
              return (
                <WidgetFrame
                  key={widget.id}
                  widget={widget}
                  copy={copy}
                  locale={locale}
                  isEditing={isEditing}
                  canArrange={canArrange}
                  compact={pos.w <= 4}
                  isDragging={dragging}
                  onMoveStart={(e) => beginDrag(e, widget, "move")}
                  onResizeStart={(e) => beginDrag(e, widget, "resize")}
                  onDelete={() => handleDelete(widget)}
                  style={{
                    gridColumn: `${pos.x + 1} / span ${pos.w}`,
                    gridRow: `${pos.y + 1} / span ${pos.h}`,
                    zIndex: dragging ? 20 : 2,
                  }}
                  className={cn(index === 0 && "widget-enter")}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function clampResize(
  origin: GridItem,
  dw: number,
  dh: number,
  cols: number,
  minW: number,
  minH: number,
): GridItem {
  const w = Math.max(minW, origin.w + dw);
  const h = Math.max(minH, origin.h + dh);
  return clampItem({ ...origin, w, h }, cols);
}
