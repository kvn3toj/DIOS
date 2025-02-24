import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Clock, BookOpen, Trophy } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ÜPlay - SuperApp & Gamifier',
  description: 'Watch educational content and earn rewards',
};

export default function UPlayPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ÜPlay</h1>
          <p className="text-muted-foreground">Continue your learning journey and earn rewards</p>
        </div>
      </section>

      <Tabs defaultValue="continue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="continue">Continue Watching</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="continue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute inset-0 m-auto h-12 w-12 rounded-full"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 h-1">
                      <Progress value={65} className="h-full rounded-none" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Introduction to Programming</h3>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      12:34 remaining
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute inset-0 m-auto h-12 w-12 rounded-full"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Advanced Web Development</h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        45:00
                      </div>
                      <div className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        100 XP
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="aspect-video relative bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <Trophy className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">Basic JavaScript Concepts</h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Completed
                      </div>
                      <div className="flex items-center">
                        <Trophy className="mr-2 h-4 w-4" />
                        150 XP Earned
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your course completion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Web Development Path</p>
                <span className="text-sm text-muted-foreground">60%</span>
              </div>
              <Progress value={60} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Mobile Development Path</p>
                <span className="text-sm text-muted-foreground">25%</span>
              </div>
              <Progress value={25} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Data Science Path</p>
                <span className="text-sm text-muted-foreground">15%</span>
              </div>
              <Progress value={15} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
