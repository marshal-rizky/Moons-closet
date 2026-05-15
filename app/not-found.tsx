import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-6xl font-semibold">404</h1>
      <p className="mt-4 text-muted-foreground">Halaman tidak ditemukan.</p>
      <Link href="/" className="mt-6">
        <Button className="text-xs uppercase tracking-widest">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
