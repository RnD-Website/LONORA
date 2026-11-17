import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[90svh] flex-col items-center justify-center bg-espresso px-4 text-center text-bone">
      <p className="eyebrow text-cream/80">404</p>
      <h1 className="display display-xl mt-4">Room not found</h1>
      <p className="mt-6 max-w-[420px] text-white/65">This space hasn&apos;t been designed yet. Let us take you somewhere that has.</p>
      <Link href="/" className="btn btn-solid mt-10">
        Back to home
      </Link>
    </section>
  );
}
