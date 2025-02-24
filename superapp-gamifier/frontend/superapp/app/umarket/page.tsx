import { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Gift, Star, Trophy } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ÜMarket - SuperApp & Gamifier',
  description: 'Shop and redeem rewards with your tokens',
};

export default function UMarketPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ÜMarket</h1>
          <p className="text-muted-foreground">Redeem your tokens for exclusive rewards</p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-bold">890 Tokens</span>
            </div>
          </Card>
        </div>
      </section>

      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="digital">Digital Rewards</TabsTrigger>
          <TabsTrigger value="physical">Physical Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Gift className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">Premium Course Access</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get access to all premium courses for 1 month
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-bold">500 Tokens</span>
                  </div>
                  <Button>Redeem</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="digital" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Star className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">Digital Badge</h3>
                    <p className="text-sm text-muted-foreground mt-1">Exclusive profile badge</p>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-bold">100 Tokens</span>
                  </div>
                  <Button variant="outline">Redeem</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="physical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold">Branded T-Shirt</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      High-quality cotton t-shirt with our logo
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-bold">1000 Tokens</span>
                  </div>
                  <Button variant="outline">Redeem</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Your redemption history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Gift className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Premium Course Access</p>
                  <p className="text-sm text-muted-foreground">Redeemed 2 days ago</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-medium">500 Tokens</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
