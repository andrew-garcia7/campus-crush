import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFF8F0]">
      <h1 className="text-4xl font-bold text-[#2D1810]">404</h1>
      <p className="mt-2 text-[#9B7065]">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[#FF2D78] px-6 py-2 text-sm font-semibold text-white"
      >
        Go home
      </Link>
    </div>
  );
}
