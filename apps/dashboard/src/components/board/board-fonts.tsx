import { useEffect } from "react";
import { applyBoardFonts, resolveFont } from "@/lib/fonts";
import { useBoardStore } from "@/store/board";

export function BoardFonts() {
  const fontId = useBoardStore((s) => s.fontId);
  const fontCustom = useBoardStore((s) => s.fontCustom);

  useEffect(() => {
    if (fontId !== "custom") {
      applyBoardFonts(resolveFont(fontId, fontCustom));
      return;
    }
    const id = window.setTimeout(() => {
      applyBoardFonts(resolveFont(fontId, fontCustom));
    }, 400);
    return () => window.clearTimeout(id);
  }, [fontId, fontCustom]);

  return null;
}
