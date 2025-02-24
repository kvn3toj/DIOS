import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, Award, Trophy } from 'lucide-react';

export default function UPlayPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">UPlay</h1>
            <p className="text-muted-foreground">
              Watch educational content and earn rewards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Trophy className="mr-2 h-4 w-4" />
              Claim Rewards
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted" />
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  Introduction to Programming
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn the basics of programming with this comprehensive guide
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <Progress value={33} />
                  <span className="text-sm font-medium">33%</span>
                </div>
                <div className="mt-4">
                  <Button>
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>Track your learning journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Clock className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium">Time Watched</div>
                      <div className="text-sm text-muted-foreground">
                        10 hours
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Award className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="mb-1 text-sm font-medium">Points Earned</div>
                      <div className="text-sm text-muted-foreground">
                        500 points
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your latest unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">First Video</div>
                      <div className="text-sm text-muted-foreground">
                        Completed your first video
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>Based on your interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="group relative">
                  <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={`/placeholder-${i + 1}.jpg`}
                      alt="Video thumbnail"
                      width={640}
                      height={360}
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold">Video Title {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Brief description of the video content
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 