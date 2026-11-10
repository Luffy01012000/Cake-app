import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs uppercase tracking-widest text-[#707070] font-semibold mb-2">
        404 — Confection Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight mb-3">
        This architectural cake has vanished.
      </h1>
      <p className="text-sm text-[#707070] max-w-md mb-8 leading-relaxed">
        The page or recipe you are looking for may have been retired or renamed. Explore our complete haute catalog below.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/cakes"
          className="px-5 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-semibold rounded-full transition-colors"
        >
          Browse Haute Catalog
        </Link>
      </div>
    </div>
  );
}
