import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function BrowseProductsPage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {/* Filters Sidebar */}
      <div className="md:col-span-1">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Categories</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2 p-2">
                <Button variant="ghost" className="w-full justify-start">All Products</Button>
                <Button variant="ghost" className="w-full justify-start">Electronics</Button>
                <Button variant="ghost" className="w-full justify-start">Clothing</Button>
                <Button variant="ghost" className="w-full justify-start">Home & Garden</Button>
                <Button variant="ghost" className="w-full justify-start">Books</Button>
              </div>
            </ScrollArea>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">Price Range</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Min" />
              <Input type="number" placeholder="Max" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="md:col-span-3">
        <div className="mb-6 flex items-center justify-between">
          <Input 
            placeholder="Search products..." 
            className="max-w-sm"
          />
          <Button>
            Sort by: Latest
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Product Cards will go here */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                {/* Product image placeholder */}
              </div>
              <div className="mt-4">
                <h3 className="font-medium">Product Name</h3>
                <p className="text-sm text-muted-foreground">Category</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">$99.99</span>
                  <Button size="sm">Add to Cart</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 