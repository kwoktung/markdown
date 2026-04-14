import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

const themeScript = `
try {
  var t = localStorage.getItem('markdown-pro-theme') || 'system'
  var d = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (t === 'dark' || (t === 'system' && d)) {
    document.documentElement.classList.add('dark')
  }
} catch(e) {}
`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Markdown - Online Markdown Editor with PDF Export",
      },
      {
        name: "description",
        content:
          "Write, preview, and export your markdown documents to PDF with ease.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found.</p>
      </div>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        {children}
        <Toaster />
        <TanStackDevtools
          config={{ position: "bottom-left" }}
          plugins={[
            { name: "Router", render: <TanStackRouterDevtoolsPanel /> },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
