import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 bg-background border-b">
        <div className="flex items-center space-x-4">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <h1 className="text-2xl font-bold">SuperApp</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative group">
            <Image
              src="/umarket.jpg"
              alt="UMarket"
              width={400}
              height={300}
              className="rounded-lg object-cover w-full h-[300px]"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/umarket"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Visit UMarket
              </Link>
            </div>
          </div>

          <div className="relative group">
            <Image
              src="/uplay.jpg"
              alt="UPlay"
              width={400}
              height={300}
              className="rounded-lg object-cover w-full h-[300px]"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/uplay"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Visit UPlay
              </Link>
            </div>
          </div>

          <div className="relative group">
            <Image
              src="/usocial.jpg"
              alt="USocial"
              width={400}
              height={300}
              className="rounded-lg object-cover w-full h-[300px]"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href="/usocial"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Visit USocial
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 SuperApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
