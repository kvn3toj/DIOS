import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Play, ShoppingBag, Medal } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard - SuperApp & Gamifier',
  description: 'Your personal dashboard for SuperApp & Gamifier',
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, User!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your progress and activities.
          </p>
        </div>
        <Button asChild>
          <Link href="/uplay/courses">
            <Play className="mr-2 h-4 w-4" />
            Continue Learning
          </Link>
        </Button>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234 XP</div>
            <Progress value={45} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">455 XP until next level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/50</div>
            <Progress value={24} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">3 achievements close to unlock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quests</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <Progress value={65} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">2 quests near completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Tokens</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">890</div>
            <div className="text-xs text-muted-foreground mt-2">+156 tokens this week</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest unlocked achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">First Video Completed</p>
                    <p className="text-sm text-muted-foreground">Earned 2 days ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Quests</CardTitle>
            <CardDescription>Your current quest progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Complete 5 Videos</p>
                    <span className="text-sm text-muted-foreground">3/5</span>
                  </div>
                  <Progress value={60} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
