import { Languages, LayoutGrid, Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@eve/ui";
import { LazyGridControls, LazyWidgetPicker, preloadEditChrome } from "@/components/board/lazy";
import { toast } from "@/lib/toast";
import { copy as dict } from "@/lib/i18n";
import { useBoardStore } from "@/store/board";

export function BoardHeader() {
  const locale = useBoardStore((s) => s.locale);
  const isEditing = useBoardStore((s) => s.isEditing);
  const setEditing = useBoardStore((s) => s.setEditing);
  const setLocale = useBoardStore((s) => s.setLocale);
  const copy = dict[locale];
  const [gridReady, setGridReady] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);

  const preloadGrid = () => {
    void import("./grid-controls");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl leading-none font-medium tracking-tight text-fg">
            {copy.appName}
          </p>
          <p className="mt-1 hidden text-xs text-muted sm:block">{copy.tagline}</p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copy.language}
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
        >
          <Languages className="size-4" />
          <span className="sr-only">{copy.language}</span>
        </Button>
        <span className="hidden text-xs tracking-wide text-subtle uppercase sm:inline">
          {locale}
        </span>

        {gridReady ? (
          <Suspense
            fallback={
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutGrid className="size-4" />
                <span className="hidden sm:inline">{copy.grid}</span>
              </Button>
            }
          >
            <LazyGridControls defaultOpen={gridOpen} />
          </Suspense>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onPointerEnter={preloadGrid}
            onFocus={preloadGrid}
            onClick={() => {
              preloadGrid();
              setGridOpen(true);
              setGridReady(true);
            }}
          >
            <LayoutGrid className="size-4" />
            <span className="hidden sm:inline">{copy.grid}</span>
          </Button>
        )}

        {isEditing ? (
          <Suspense fallback={null}>
            <LazyWidgetPicker
              copy={copy}
              locale={locale}
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">{copy.addWidget}</span>
                </Button>
              }
            />
          </Suspense>
        ) : null}

        <Button
          variant={isEditing ? "default" : "secondary"}
          size="sm"
          onPointerEnter={preloadEditChrome}
          onClick={() => {
            preloadEditChrome();
            setEditing(!isEditing);
            if (!isEditing) toast(copy.dragHint);
          }}
        >
          {isEditing ? copy.done : copy.edit}
        </Button>
      </div>
    </header>
  );
}
