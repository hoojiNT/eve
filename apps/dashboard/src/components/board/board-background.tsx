import { useEffect } from "react";
import { applyBoardBackground, resolveBackground } from "@/lib/background";
import { useBoardStore } from "@/store/board";

export function BoardBackground() {
  const backgroundId = useBoardStore((s) => s.backgroundId);
  const backgroundColor = useBoardStore((s) => s.backgroundColor);
  const backgroundImage = useBoardStore((s) => s.backgroundImage);

  useEffect(() => {
    const apply = () =>
      applyBoardBackground(resolveBackground(backgroundId, backgroundColor, backgroundImage));
    if (!backgroundImage.trim()) {
      apply();
      return;
    }
    const id = window.setTimeout(apply, 400);
    return () => window.clearTimeout(id);
  }, [backgroundId, backgroundColor, backgroundImage]);

  return null;
}
