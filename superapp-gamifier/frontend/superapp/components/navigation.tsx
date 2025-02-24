import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { UserNav } from '@/components/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                    pathname === '/' && 'bg-accent/50'
                  )}
                >
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>ÜPlay</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <Link
                      href="/uplay"
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">ÜPlay</div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Watch educational content and earn rewards
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/uplay/courses"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Courses</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Browse available courses
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/uplay/achievements"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Achievements</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View your earned achievements
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/uplay/leaderboard"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Leaderboard</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Compare your progress with others
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>ÜMarket</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li>
                    <Link
                      href="/umarket/shop"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Shop</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Browse and purchase items with your tokens
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/umarket/inventory"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Inventory</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        View your purchased items
                      </p>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/quests">Quests</Link>
          </Button>
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
