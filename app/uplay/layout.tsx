import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UPlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ÜPlay</h1>
        <p className="text-muted-foreground">Your learning journey starts here</p>
      </div>

      <Tabs defaultValue="discover" className="mb-8">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="watch">Continue Watching</TabsTrigger>
          <TabsTrigger value="playlists">My Playlists</TabsTrigger>
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
} 