import { NavigationMenu } from "@/components/ui/navigation-menu"
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {/* Main Navigation */}
            <NavigationMenu className="border-b">
              <div className="container mx-auto flex h-16 items-center">
                <nav className="flex space-x-6">
                  <a href="/" className="flex items-center space-x-2">
                    <img src="/logo.svg" alt="CoomÜnity" className="h-8 w-8" />
                    <span className="font-bold">CoomÜnity</span>
                  </a>
                  <a href="/umarket" className="text-muted-foreground hover:text-primary">
                    ÜMarket
                  </a>
                  <a href="/uplay" className="text-muted-foreground hover:text-primary">
                    ÜPlay
                  </a>
                </nav>
              </div>
            </NavigationMenu>

            {/* App Modules */}
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 