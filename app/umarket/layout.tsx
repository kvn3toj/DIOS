import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UMarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ÜMarket</h1>
        <p className="text-muted-foreground">Your cooperative marketplace</p>
      </div>

      <Tabs defaultValue="consumer" className="mb-8">
        <TabsList>
          <TabsTrigger value="consumer">Consumer</TabsTrigger>
          <TabsTrigger value="provider">Provider</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {children}
    </div>
  )
} 