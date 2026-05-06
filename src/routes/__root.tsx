import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import appCss from '../styles.css?url'
import { ThemeProvider } from '#/lib/theme-provider'
import { Toaster } from 'sonner'
import { TooltipProvider } from '#/components/ui/tooltip'

const THEME_INIT_SCRIPT = `(function(){try{
  var stored=window.localStorage.getItem('theme');
  var mode=(stored==='light'||stored==='dark'||stored==='system')?stored:'system';
  var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved=mode==='system'?(prefersDark?'dark':'light'):mode;
  document.documentElement.classList.remove('light','dark');
  document.documentElement.classList.add(resolved);
  document.documentElement.style.colorScheme=resolved;
}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>

          <Toaster closeButton position="top-center" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
