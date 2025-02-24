import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UMarketConsumerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Tabs defaultValue="browse" className="mb-8">
        <TabsList>
          <TabsTrigger value="browse">Browse Products</TabsTrigger>
          <TabsTrigger value="cart">Shopping Cart</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {children}
      </div>
    </div>
  )
} 