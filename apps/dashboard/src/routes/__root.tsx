import { useEffect } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import appCss from "../styles.css?url";

const APP_NAME = "Eve";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content: "Bảng widget kéo thả — đếm ngược năm mới, đồng hồ, ghi chú.",
      },
      { name: "theme-color", content: "#0a0a0c" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: () => (
    <html lang="vi" suppressHydrationWarning className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        {import.meta.env.DEV ? <ViteDevtoolsDock /> : null}
        <Scripts />
      </body>
    </html>
  ),
});

/** TanStack Start does not run Vite `transformIndexHtml`, so the dock script is injected here. */
function ViteDevtoolsDock() {
  useEffect(() => {
    if (document.querySelector("script[data-vite-devtools]")) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = "/__devtools/embedded.js";
    script.dataset.viteDevtools = "1";
    document.body.appendChild(script);
  }, []);
  return null;
}
