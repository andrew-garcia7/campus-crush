import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";

export function PageFrame({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <h1 className="editorial-title text-[3rem]">{title}</h1>
        <p className="mt-2 text-sm text-[#f4e4ec]/84">{subtitle}</p>
      </GlassCard>
      <GlassCard>{children}</GlassCard>
      <div className="flex flex-wrap gap-3 text-xs text-[#ecd9e4]">
        <Link href="/">Landing</Link>
        <Link href="/discover">Discover</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/coach">Coach</Link>
        <Link href="/premium">Premium</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </div>
  );
}
