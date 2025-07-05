import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 sticky top-0 z-50">
      <Link href="/" className="flex items-center">
        <span className="font-bold font-headline text-lg">TechTicker</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </header>
  );
}
