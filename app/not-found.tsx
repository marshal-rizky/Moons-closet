import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.18em] uppercase opacity-60">|404|</p>
      <h1 className="mt-3 font-heading text-7xl uppercase sm:text-9xl">
        Hilang
      </h1>
      <p className="mt-6 max-w-[280px] text-[12px] tracking-[0.04em] uppercase opacity-70">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Link
        href="/"
        className="mt-10 border border-foreground px-8 py-3 text-[12px] tracking-[0.12em] uppercase hover:bg-foreground hover:text-background"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
