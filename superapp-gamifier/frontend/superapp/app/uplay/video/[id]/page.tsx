import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Trophy, BookOpen, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Video Player - ÜPlay',
  description: 'Watch educational content and earn rewards',
};

export default function VideoPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="aspect-video bg-muted relative rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground">Video Player</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <Progress value={45} className="h-full rounded-none" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Introduction to Programming</h1>
              <p className="text-muted-foreground">Part 1 of Web Development Path</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="description" className="space-y-4">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <Card>
                <CardContent className="pt-6">
                  <p>
                    Learn the fundamentals of programming with this comprehensive introduction.
                    We'll cover basic concepts, syntax, and best practices to get you started on
                    your coding journey.
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      45:00 minutes
                    </div>
                    <div className="flex items-center">
                      <Trophy className="mr-2 h-4 w-4" />
                      100 XP
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Beginner Level
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments">
              <Card>
                <CardContent className="pt-6">
                  <ScrollArea className="h-[300px]">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">User Name</span>
                              <span className="text-sm text-muted-foreground">2 days ago</span>
                            </div>
                            <p className="text-sm">
                              Great explanation of the concepts! Really helped me understand the
                              basics.
                            </p>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    <li>
                      <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <BookOpen className="h-4 w-4" />
                        Course Materials PDF
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-sm hover:underline">
                        <BookOpen className="h-4 w-4" />
                        Code Examples
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
              <CardDescription>Continue your learning path</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="aspect-video w-40 bg-muted rounded-lg" />
                    <div>
                      <h3 className="font-medium">Variables and Data Types</h3>
                      <p className="text-sm text-muted-foreground">15:00</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>Complete to earn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">100 XP</p>
                    <p className="text-sm text-muted-foreground">Complete the video</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">First Video Achievement</p>
                    <p className="text-sm text-muted-foreground">Watch your first video</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
