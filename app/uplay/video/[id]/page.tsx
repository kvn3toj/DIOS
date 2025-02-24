import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Play, Clock, Award, Trophy } from 'lucide-react';

export default function VideoPage({ params }: { params: { id: string } }) {
  // Use the video ID from params to fetch video details
  const videoId = params.id;
  
  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Introduction to Programming</h1>
            <p className="text-muted-foreground">Part 1 of Web Development Path</p>
            <p className="text-sm text-muted-foreground">Video ID: {videoId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Trophy className="mr-2 h-4 w-4" />
              Claim Reward
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="aspect-video bg-muted" />
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Play className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium">Video Progress</div>
                    <Progress value={33} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium">Time Watched</div>
                    <div className="text-sm text-muted-foreground">10 minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Award className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium">Points Earned</div>
                    <div className="text-sm text-muted-foreground">50 points</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="discussion">Discussion</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>About This Video</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <p>
                      Welcome to the comprehensive introduction to programming! In this
                      video, we'll cover basic concepts, syntax, and best practices
                      to get you started on your coding journey.
                    </p>
                    <Separator />
                    <div>
                      <h4 className="mb-2 text-sm font-medium">What You'll Learn</h4>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        <li>Basic programming concepts</li>
                        <li>Variables and data types</li>
                        <li>Control structures</li>
                        <li>Functions and methods</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Prerequisites</h4>
                      <p className="text-sm text-muted-foreground">
                        No prior programming experience needed. Just bring your
                        curiosity and willingness to learn!
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Downloads</h4>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        <li>Course slides (PDF)</li>
                        <li>Code examples (ZIP)</li>
                        <li>Practice exercises</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-2 text-sm font-medium">External Links</h4>
                      <ul className="list-disc pl-4 text-sm text-muted-foreground">
                        <li>Documentation</li>
                        <li>Community forum</li>
                        <li>Additional reading</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="discussion">
            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Join the discussion about this video. Share your thoughts,
                      ask questions, and connect with other learners.
                    </p>
                    <Button>Start a Discussion</Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 