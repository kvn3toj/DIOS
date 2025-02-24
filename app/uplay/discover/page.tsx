import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function DiscoverPage() {
  return (
    <div className="space-y-8">
      {/* Featured Section */}
      <section>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h2 className="text-2xl font-bold text-white">Featured Course</h2>
            <p className="mt-2 text-white/90">Master new skills with our featured content</p>
            <Button className="mt-4" variant="secondary">
              Start Learning
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h3 className="text-lg font-medium">Browse by Category</h3>
        <ScrollArea className="mt-4">
          <div className="flex space-x-4 pb-4">
            {['All', 'Technology', 'Business', 'Design', 'Marketing', 'Personal Development'].map((category) => (
              <Button key={category} variant="outline" className="flex-shrink-0">
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Course Grid */}
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Popular Courses</h3>
          <Input 
            placeholder="Search courses..." 
            className="max-w-xs"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="group relative rounded-lg border bg-card">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <Button
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                  size="sm"
                >
                  Watch Now
                </Button>
              </div>
              <div className="p-4">
                <h4 className="font-medium">Course Title</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Course description goes here...
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">4.5 ★</span>
                    <span className="text-sm text-muted-foreground">(123)</span>
                  </div>
                  <span className="text-sm font-medium">2h 30m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Paths */}
      <section>
        <h3 className="text-lg font-medium">Learning Paths</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6">
              <h4 className="font-medium">Path Title</h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete path description...
              </p>
              <div className="mt-4">
                <Progress value={33} />
                <p className="mt-2 text-sm text-muted-foreground">
                  33% Complete
                </p>
              </div>
              <Button className="mt-4" variant="outline">
                Continue Path
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 